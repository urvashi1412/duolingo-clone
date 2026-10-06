import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    Exercise,
    Language,
    Lesson,
    Skill,
    Unit,
    UserLessonProgress,
    UserSkillProgress,
)
from app.schemas import (
    AnswerResult,
    AnswerSubmission,
    ExercisePublic,
    LessonCompleteRequest,
    LessonCompleteResult,
    LessonDetail,
)
from app.services import (
    activity_date,
    apply_heart_regeneration,
    check_exercise_answer,
    count_lessons_completed,
    get_default_user,
    lose_heart,
    register_daily_activity,
    unlock_next_skill,
)

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


def _lesson_to_detail(lesson: Lesson) -> LessonDetail:
    exercises: list[ExercisePublic] = []
    for ex in sorted(lesson.exercises, key=lambda e: e.order_index):
        exercises.append(
            ExercisePublic(
                id=ex.id,
                order_index=ex.order_index,
                exercise_type=ex.exercise_type,
                prompt=ex.prompt,
                question=ex.question,
                options=json.loads(ex.options_json or "[]"),
                pairs=json.loads(ex.pairs_json or "[]"),
                word_bank=json.loads(ex.word_bank_json or "[]"),
                hint=ex.hint,
            )
        )
    return LessonDetail(
        id=lesson.id,
        skill_id=lesson.skill_id,
        title=lesson.title,
        xp_reward=lesson.xp_reward,
        exercises=exercises,
    )


@router.get("/{lesson_id}", response_model=LessonDetail)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    user = get_default_user(db)
    apply_heart_regeneration(user)
    db.commit()

    lesson = (
        db.query(Lesson)
        .options(joinedload(Lesson.exercises))
        .filter(Lesson.id == lesson_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return _lesson_to_detail(lesson)


@router.post("/{lesson_id}/check", response_model=AnswerResult)
def check_answer(
    lesson_id: int, body: AnswerSubmission, db: Session = Depends(get_db)
):
    user = get_default_user(db)
    apply_heart_regeneration(user)

    exercise = (
        db.query(Exercise)
        .filter(Exercise.id == body.exercise_id, Exercise.lesson_id == lesson_id)
        .first()
    )
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    if user.hearts <= 0:
        return AnswerResult(
            correct=False,
            hearts_remaining=0,
            lesson_failed=True,
            feedback_message="You are out of hearts!",
        )

    correct = check_exercise_answer(exercise, body.answer)
    lesson_failed = False
    feedback = "Great job!" if correct else "Correct solution:"

    if not correct:
        lesson_failed = lose_heart(user)
        feedback = "Wrong answer." if not lesson_failed else "Out of hearts!"

    db.commit()

    correct_answer = None
    if not correct:
        correct_answer = json.loads(exercise.correct_answer)

    return AnswerResult(
        correct=correct,
        correct_answer=correct_answer,
        hearts_remaining=user.hearts,
        lesson_failed=lesson_failed,
        feedback_message=feedback,
    )


@router.post("/{lesson_id}/complete", response_model=LessonCompleteResult)
def complete_lesson(
    lesson_id: int, body: LessonCompleteRequest, db: Session = Depends(get_db)
):
    user = get_default_user(db)
    apply_heart_regeneration(user)

    lesson = (
        db.query(Lesson)
        .options(
            joinedload(Lesson.skill)
            .joinedload(Skill.unit)
            .joinedload(Unit.language)
            .joinedload(Language.units)
            .joinedload(Unit.skills)
        )
        .filter(Lesson.id == lesson_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    when = activity_date(body.simulated_date)
    register_daily_activity(user, when)

    xp = lesson.xp_reward
    if body.correct_count == body.total_count and body.total_count > 0:
        xp += 5

    user.total_xp += xp
    user.daily_xp_today += xp

    progress = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.lesson_id == lesson_id,
        )
        .first()
    )
    if not progress:
        progress = UserLessonProgress(user_id=user.id, lesson_id=lesson_id)
        db.add(progress)
    if not progress.completed:
        progress.completed = True
        progress.xp_earned = xp
    else:
        progress.xp_earned = max(progress.xp_earned, xp)

    skill_progress = (
        db.query(UserSkillProgress)
        .filter(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == lesson.skill_id,
        )
        .first()
    )
    if not skill_progress:
        skill_progress = UserSkillProgress(
            user_id=user.id, skill_id=lesson.skill_id, is_unlocked=True
        )
        db.add(skill_progress)

    lessons_completed = count_lessons_completed(db, user.id, lesson.skill_id)
    skill_progress.lessons_completed = lessons_completed

    lessons_in_skill = (
        db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).count()
    )
    skill_completed = lessons_completed >= lessons_in_skill
    if skill_completed and skill_progress.crowns < 1:
        skill_progress.crowns = 1

    if skill_completed:
        language = lesson.skill.unit.language
        unlock_next_skill(db, user, lesson.skill_id, language)

    db.commit()
    db.refresh(skill_progress)

    return LessonCompleteResult(
        xp_earned=xp,
        total_xp=user.total_xp,
        streak=user.streak,
        daily_xp_today=user.daily_xp_today,
        crowns=skill_progress.crowns,
        skill_completed=skill_completed,
    )
