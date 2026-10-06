from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class UserStats(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_color: str
    total_xp: int
    streak: int
    hearts: int
    max_hearts: int
    gems: int
    daily_xp_goal: int
    daily_xp_today: int
    last_activity_date: date | None
    hearts_updated_at: datetime

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    rank: int
    display_name: str
    total_xp: int
    avatar_color: str
    is_current_user: bool = False


class ExercisePublic(BaseModel):
    id: int
    order_index: int
    exercise_type: str
    prompt: str
    question: str
    options: list[str] = Field(default_factory=list)
    pairs: list[dict[str, str]] = Field(default_factory=list)
    word_bank: list[str] = Field(default_factory=list)
    hint: str = ""


class LessonDetail(BaseModel):
    id: int
    skill_id: int
    title: str
    xp_reward: int
    exercises: list[ExercisePublic]


class SkillNode(BaseModel):
    id: int
    unit_id: int
    order_index: int
    title: str
    icon: str
    color: str
    crowns: int
    lessons_total: int
    lessons_completed: int
    state: str  # locked | available | completed
    current_lesson_id: int | None


class UnitNode(BaseModel):
    id: int
    order_index: int
    title: str
    description: str
    section_label: str
    skills: list[SkillNode]


class CourseTree(BaseModel):
    language_id: int
    language_name: str
    language_code: str
    units: list[UnitNode]


class AnswerSubmission(BaseModel):
    exercise_id: int
    answer: Any
    simulated_date: date | None = None


class AnswerResult(BaseModel):
    correct: bool
    correct_answer: Any | None = None
    hearts_remaining: int
    lesson_failed: bool
    feedback_message: str


class LessonCompleteRequest(BaseModel):
    simulated_date: date | None = None
    correct_count: int
    total_count: int


class LessonCompleteResult(BaseModel):
    xp_earned: int
    total_xp: int
    streak: int
    daily_xp_today: int
    crowns: int
    skill_completed: bool


class RefillResult(BaseModel):
    hearts: int
    gems: int
    message: str
