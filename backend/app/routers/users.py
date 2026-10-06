from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RefillResult, UserStats
from app.services import apply_heart_regeneration, get_default_user

router = APIRouter(prefix="/api/users", tags=["users"])

REFILL_GEM_COST = 350


@router.get("/me", response_model=UserStats)
def get_me(db: Session = Depends(get_db)):
    user = get_default_user(db)
    apply_heart_regeneration(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/hearts/refill", response_model=RefillResult)
def refill_hearts(db: Session = Depends(get_db)):
    user = get_default_user(db)
    apply_heart_regeneration(user)

    if user.hearts >= user.max_hearts:
        return RefillResult(
            hearts=user.hearts,
            gems=user.gems,
            message="Hearts already full!",
        )

    if user.gems < REFILL_GEM_COST:
        return RefillResult(
            hearts=user.hearts,
            gems=user.gems,
            message="Not enough gems.",
        )

    user.gems -= REFILL_GEM_COST
    user.hearts = user.max_hearts
    db.commit()

    return RefillResult(
        hearts=user.hearts,
        gems=user.gems,
        message="Hearts refilled!",
    )


@router.post("/practice/refill", response_model=RefillResult)
def practice_refill(db: Session = Depends(get_db)):
    """Mock practice session that restores one heart."""
    user = get_default_user(db)
    apply_heart_regeneration(user)
    if user.hearts < user.max_hearts:
        user.hearts += 1
    db.commit()
    return RefillResult(
        hearts=user.hearts,
        gems=user.gems,
        message="Practice complete! +1 heart",
    )
