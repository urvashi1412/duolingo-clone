import json
from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from app.models import (
    Exercise,
    Lesson,
    Skill,
    User,
    UserLessonProgress,
    UserSkillProgress,
)

HEART_REGEN_MINUTES = 30
DEFAULT_USER_ID = 1


def get_default_user(db: Session) -> User:
    user = db.query(User).filter(User.is_default.is_(True)).first()
    if not user:
        user = db.query(User).filter(User.id == DEFAULT_USER_ID).first()
    if not user:
        raise ValueError("No default user found")
    return user


def apply_heart_regeneration(user: User, now: datetime | None = None) -> None:
    now = now or datetime.utcnow()
    if user.hearts >= user.max_hearts:
        user.hearts_updated_at = now
        return
    elapsed = now - user.hearts_updated_at
    regen_count = int(elapsed.total_seconds() // (HEART_REGEN_MINUTES * 60))
    if regen_count > 0:
        user.hearts = min(user.max_hearts, user.hearts + regen_count)
        user.hearts_updated_at = now - timedelta(
            seconds=elapsed.total_seconds() % (HEART_REGEN_MINUTES * 60)
        )


def activity_date(simulated: date | None) -> date:
    return simulated or date.today()


def register_daily_activity(user: User, when: date) -> None:
    if user.last_activity_date == when:
        return
    if user.last_activity_date is None:
        user.streak = 1
    elif user.last_activity_date == when - timedelta(days=1):
        user.streak += 1
    else:
        user.streak = 1
    user.daily_xp_today = 0
    user.last_activity_date = when


def normalize_answer(value: Any) -> str:
    if isinstance(value, list):
        return " ".join(str(v).strip().lower() for v in value)
    if isinstance(value, dict):
        return json.dumps(value, sort_keys=True)
    return str(value).strip().lower()


def check_exercise_answer(exercise: Exercise, answer: Any) -> bool:
    ex_type = exercise.exercise_type
    correct_raw = json.loads(exercise.correct_answer)

    if ex_type == "multiple_choice":
        return normalize_answer(answer) == normalize_answer(correct_raw)

    if ex_type == "type_answer" or ex_type == "fill_blank":
        return normalize_answer(answer) == normalize_answer(correct_raw)

    if ex_type == "translate_word_bank":
        if isinstance(answer, list):
            user_text = " ".join(answer)
        else:
            user_text = str(answer)
        return normalize_answer(user_text) == normalize_answer(correct_raw)

    if ex_type == "match_pairs":
        if not isinstance(answer, dict):
            return False
        expected = correct_raw if isinstance(correct_raw, dict) else {}
        for key, val in expected.items():
            if normalize_answer(answer.get(key, "")) != normalize_answer(val):
                return False
        return True

    return False


def get_skill_progress_map(db: Session, user_id: int) -> dict[int, UserSkillProgress]:
    rows = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == user_id)
        .all()
    )
    return {r.skill_id: r for r in rows}


def count_lessons_completed(db: Session, user_id: int, skill_id: int) -> int:
    return (
        db.query(UserLessonProgress)
        .join(Lesson, UserLessonProgress.lesson_id == Lesson.id)
        .filter(
            UserLessonProgress.user_id == user_id,
            Lesson.skill_id == skill_id,
            UserLessonProgress.completed.is_(True),
        )
        .count()
    )


def skill_state(
    skill: Skill,
    progress: UserSkillProgress | None,
    lessons_total: int,
    lessons_completed: int,
) -> tuple[str, int, int | None]:
    crowns = progress.crowns if progress else 0
    if not progress or not progress.is_unlocked:
        return "locked", crowns, None

    if lessons_completed >= lessons_total and lessons_total > 0:
        return "completed", crowns, None

    next_lesson = (
        skill.lessons[lessons_completed].id
        if lessons_completed < lessons_total
        else skill.lessons[-1].id
    )
    return "available", crowns, next_lesson


def lose_heart(user: User) -> bool:
    if user.hearts <= 0:
        return True
    user.hearts -= 1
    user.hearts_updated_at = datetime.utcnow()
    return user.hearts <= 0


def ordered_skills_for_language(language) -> list[Skill]:
    """All skills in path order (unit order, then skill order within unit)."""
    skills: list[Skill] = []
    for unit in sorted(language.units, key=lambda u: u.order_index):
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            skills.append(skill)
    return skills


def unlock_next_skill(db: Session, user: User, completed_skill_id: int, language) -> None:
    skill_ids = [s.id for s in ordered_skills_for_language(language)]
    try:
        idx = skill_ids.index(completed_skill_id)
    except ValueError:
        return
    if idx + 1 >= len(skill_ids):
        return
    next_id = skill_ids[idx + 1]
    nsp = (
        db.query(UserSkillProgress)
        .filter(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == next_id,
        )
        .first()
    )
    if not nsp:
        nsp = UserSkillProgress(
            user_id=user.id, skill_id=next_id, is_unlocked=True
        )
        db.add(nsp)
    else:
        nsp.is_unlocked = True
