from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LeaderboardEntry
from app.services import get_default_user

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    current = get_default_user(db)
    users = db.query(User).order_by(User.total_xp.desc()).limit(20).all()
    entries: list[LeaderboardEntry] = []
    for rank, user in enumerate(users, start=1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                display_name=user.display_name,
                total_xp=user.total_xp,
                avatar_color=user.avatar_color,
                is_current_user=user.id == current.id,
            )
        )
    return entries
