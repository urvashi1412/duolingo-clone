import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Language, Lesson, Skill, Unit
from app.schemas import CourseTree, SkillNode, UnitNode
from app.services import (
    count_lessons_completed,
    get_default_user,
    get_skill_progress_map,
    skill_state,
)

router = APIRouter(prefix="/api/course", tags=["course"])


@router.get("", response_model=CourseTree)
def get_course_tree(db: Session = Depends(get_db)):
    user = get_default_user(db)
    language = (
        db.query(Language)
        .options(
            joinedload(Language.units)
            .joinedload(Unit.skills)
            .joinedload(Skill.lessons)
        )
        .first()
    )
    if not language:
        return CourseTree(
            language_id=0,
            language_name="Spanish",
            language_code="es",
            units=[],
        )

    progress_map = get_skill_progress_map(db, user.id)
    units_out: list[UnitNode] = []

    for unit in sorted(language.units, key=lambda u: u.order_index):
        skills_out: list[SkillNode] = []
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            lessons_total = len(skill.lessons)
            lessons_completed = count_lessons_completed(db, user.id, skill.id)
            progress = progress_map.get(skill.id)
            state, crowns, next_lesson = skill_state(
                skill, progress, lessons_total, lessons_completed
            )
            skills_out.append(
                SkillNode(
                    id=skill.id,
                    unit_id=unit.id,
                    order_index=skill.order_index,
                    title=skill.title,
                    icon=skill.icon,
                    color=skill.color,
                    crowns=crowns,
                    lessons_total=lessons_total,
                    lessons_completed=lessons_completed,
                    state=state,
                    current_lesson_id=next_lesson,
                )
            )
        units_out.append(
            UnitNode(
                id=unit.id,
                order_index=unit.order_index,
                title=unit.title,
                description=unit.description,
                section_label=unit.section_label,
                skills=skills_out,
            )
        )

    return CourseTree(
        language_id=language.id,
        language_name=language.name,
        language_code=language.code,
        units=units_out,
    )
