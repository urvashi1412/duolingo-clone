from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(128))
    avatar_color: Mapped[str] = mapped_column(String(16), default="#58CC02")
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    daily_xp_goal: Mapped[int] = mapped_column(Integer, default=20)
    daily_xp_today: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    hearts_updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    skill_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="user"
    )
    lesson_progress: Mapped[list["UserLessonProgress"]] = relationship(
        back_populates="user"
    )


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    code: Mapped[str] = mapped_column(String(8), unique=True)

    units: Mapped[list["Unit"]] = relationship(back_populates="language")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    language_id: Mapped[int] = mapped_column(ForeignKey("languages.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(256), default="")
    section_label: Mapped[str] = mapped_column(String(64), default="Section 1")

    language: Mapped["Language"] = relationship(back_populates="units")
    skills: Mapped[list["Skill"]] = relationship(back_populates="unit")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(128))
    icon: Mapped[str] = mapped_column(String(32), default="star")
    color: Mapped[str] = mapped_column(String(16), default="#58CC02")

    unit: Mapped["Unit"] = relationship(back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="skill")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(128))
    xp_reward: Mapped[int] = mapped_column(Integer, default=10)

    skill: Mapped["Skill"] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="lesson")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    exercise_type: Mapped[str] = mapped_column(String(32))
    prompt: Mapped[str] = mapped_column(String(256), default="")
    question: Mapped[str] = mapped_column(Text)
    correct_answer: Mapped[str] = mapped_column(Text)
    options_json: Mapped[str] = mapped_column(Text, default="[]")
    pairs_json: Mapped[str] = mapped_column(Text, default="[]")
    word_bank_json: Mapped[str] = mapped_column(Text, default="[]")
    hint: Mapped[str] = mapped_column(String(256), default="")

    lesson: Mapped["Lesson"] = relationship(back_populates="exercises")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    __table_args__ = (UniqueConstraint("user_id", "skill_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    crowns: Mapped[int] = mapped_column(Integer, default=0)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="skill_progress")


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="lesson_progress")
