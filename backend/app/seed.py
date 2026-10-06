import json
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.models import (
    Exercise,
    Language,
    Lesson,
    Skill,
    Unit,
    User,
    UserLessonProgress,
    UserSkillProgress,
)


def seed_database(db: Session) -> None:
    if db.query(Language).first():
        return

    lang = Language(name="Spanish", code="es")
    db.add(lang)
    db.flush()

    unit1 = Unit(
        language_id=lang.id,
        order_index=1,
        title="Unit 1",
        description="Basics",
        section_label="Section 1, Unit 1",
    )
    unit2 = Unit(
        language_id=lang.id,
        order_index=2,
        title="Unit 2",
        description="Phrases",
        section_label="Section 1, Unit 2",
    )
    db.add_all([unit1, unit2])
    db.flush()

    skills_data = [
        (unit1.id, 1, "Basics 1", "chat", "#58CC02"),
        (unit1.id, 2, "Basics 2", "book", "#1CB0F6"),
        (unit1.id, 3, "Greetings", "wave", "#CE82FF"),
        (unit2.id, 1, "People", "users", "#FF9600"),
        (unit2.id, 2, "Travel", "plane", "#FF4B4B"),
    ]
    skills: list[Skill] = []
    for unit_id, order_index, title, icon, color in skills_data:
        skill = Skill(
            unit_id=unit_id,
            order_index=order_index,
            title=title,
            icon=icon,
            color=color,
        )
        db.add(skill)
        skills.append(skill)
    db.flush()

    lesson_templates = [
        ("Lesson 1", 10),
        ("Lesson 2", 12),
        ("Practice", 15),
    ]

    all_lessons: list[tuple[Skill, Lesson]] = []
    for skill in skills:
        for idx, (title, xp) in enumerate(lesson_templates, start=1):
            lesson = Lesson(
                skill_id=skill.id,
                order_index=idx,
                title=title,
                xp_reward=xp,
            )
            db.add(lesson)
            all_lessons.append((skill, lesson))
    db.flush()

    def add_exercises(lesson: Lesson, skill_title: str) -> None:
        exercises = [
            Exercise(
                lesson_id=lesson.id,
                order_index=1,
                exercise_type="multiple_choice",
                prompt="Select the correct translation",
                question=f'What is "hello" in Spanish?',
                correct_answer=json.dumps("hola"),
                options_json=json.dumps(["hola", "adiós", "gracias", "por favor"]),
            ),
            Exercise(
                lesson_id=lesson.id,
                order_index=2,
                exercise_type="translate_word_bank",
                prompt="Translate this sentence",
                question="Good morning",
                correct_answer=json.dumps("buenos días"),
                word_bank_json=json.dumps(
                    ["buenos", "días", "buenas", "noches", "hola"]
                ),
            ),
            Exercise(
                lesson_id=lesson.id,
                order_index=3,
                exercise_type="match_pairs",
                prompt="Match the pairs",
                question="Match Spanish to English",
                correct_answer=json.dumps(
                    {"hola": "hello", "gracias": "thank you", "sí": "yes"}
                ),
                pairs_json=json.dumps(
                    [
                        {"left": "hola", "right": "hello"},
                        {"left": "gracias", "right": "thank you"},
                        {"left": "sí", "right": "yes"},
                        {"left": "no", "right": "no"},
                    ]
                ),
            ),
            Exercise(
                lesson_id=lesson.id,
                order_index=4,
                exercise_type="fill_blank",
                prompt="Fill in the blank",
                question="Yo ___ estudiante.",
                correct_answer=json.dumps("soy"),
                hint="I am",
            ),
            Exercise(
                lesson_id=lesson.id,
                order_index=5,
                exercise_type="type_answer",
                prompt="Type the translation",
                question=f'Translate: "water" ({skill_title})',
                correct_answer=json.dumps("agua"),
            ),
        ]
        db.add_all(exercises)

    for skill, lesson in all_lessons:
        add_exercises(lesson, skill.title)

    users = [
        User(
            username="learner",
            display_name="You",
            is_default=True,
            total_xp=120,
            streak=3,
            hearts=5,
            gems=450,
            daily_xp_today=15,
            last_activity_date=date.today() - timedelta(days=0),
        ),
        User(
            username="maria",
            display_name="Maria",
            avatar_color="#1CB0F6",
            total_xp=980,
            streak=12,
        ),
        User(
            username="alex",
            display_name="Alex",
            avatar_color="#CE82FF",
            total_xp=760,
            streak=7,
        ),
        User(
            username="sam",
            display_name="Sam",
            avatar_color="#FF9600",
            total_xp=540,
            streak=4,
        ),
    ]
    db.add_all(users)
    db.flush()

    default_user = users[0]
    first_skill = skills[0]
    second_skill = skills[1]

    db.add(
        UserSkillProgress(
            user_id=default_user.id,
            skill_id=first_skill.id,
            crowns=1,
            lessons_completed=2,
            is_unlocked=True,
        )
    )
    db.add(
        UserSkillProgress(
            user_id=default_user.id,
            skill_id=second_skill.id,
            crowns=0,
            lessons_completed=0,
            is_unlocked=True,
        )
    )
    for skill in skills[2:]:
        db.add(
            UserSkillProgress(
                user_id=default_user.id,
                skill_id=skill.id,
                is_unlocked=False,
            )
        )

    first_lessons = (
        db.query(Lesson)
        .filter(Lesson.skill_id == first_skill.id)
        .order_by(Lesson.order_index)
        .all()
    )
    for lesson in first_lessons[:2]:
        db.add(
            UserLessonProgress(
                user_id=default_user.id,
                lesson_id=lesson.id,
                completed=True,
                xp_earned=lesson.xp_reward,
            )
        )

    default_user.hearts_updated_at = datetime.utcnow()
    db.commit()
