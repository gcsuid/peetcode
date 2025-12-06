from datetime import date, timedelta
from typing import Optional
from models import MemoryRating

def calculate_next_review(current_interval: int, rating: Optional[MemoryRating]) -> dict:
    """
    Calculates the next review schedule based on the rating.
    Returns a dict with:
    - current_interval_days: int
    - next_review_date: date
    """
    interval = current_interval

    if rating == MemoryRating.REMEMBERED:
        interval = max(interval * 2, 10)
    elif rating == MemoryRating.PARTIAL:
        interval = max(int(interval * 1.5), 7)
    else: # FORGOT or None
        interval = 5

    next_date = date.today() + timedelta(days=interval)
    
    return {
        "current_interval_days": interval,
        "next_review_date": next_date
    }

def get_initial_schedule() -> dict:
    """
    Returns the initial schedule for a new problem.
    """
    return {
        "current_interval_days": 5,
        "next_review_date": date.today() + timedelta(days=5)
    }
