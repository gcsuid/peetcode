from fastapi import FastAPI, Request, Depends, Form, status, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from starlette.middleware.sessions import SessionMiddleware
from typing import Optional
import os
from datetime import date, datetime

from database import create_db_and_tables, get_session
from models import User, Problem, Attempt, ReviewSchedule, Difficulty, AttemptType, MemoryRating
from auth import get_password_hash, verify_password
from ai_service import compare_attempts
from scheduler import get_initial_schedule, calculate_next_review

app = FastAPI()

# Secret key for session middleware - in prod use env var
SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Dependency to get current user
def get_current_user(request: Request, session: Session = Depends(get_session)):
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    user = session.get(User, user_id)
    return user

@app.get("/", response_class=HTMLResponse)
def index(request: Request, user: User = Depends(get_current_user)):
    if user:
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("index.html", {"request": request})

# Auth Routes
@app.get("/signup", response_class=HTMLResponse)
def signup_form(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.post("/signup")
def signup(request: Request, email: str = Form(...), password: str = Form(...), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if user:
        return templates.TemplateResponse("signup.html", {"request": request, "error": "Email already registered"})
    
    hashed_password = get_password_hash(password)
    new_user = User(email=email, password_hash=hashed_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    request.session["user_id"] = new_user.id
    return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)

@app.get("/login", response_class=HTMLResponse)
def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
def login(request: Request, email: str = Form(...), password: str = Form(...), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials"})
    
    request.session["user_id"] = user.id
    return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)

# Dashboard
@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    # Stats
    total_problems = session.exec(select(Problem).where(Problem.user_id == user.id)).all()
    total_attempts = session.exec(select(Attempt).where(Attempt.user_id == user.id)).all()
    
    today = date.today()
    due_problems = session.exec(select(ReviewSchedule).where(ReviewSchedule.user_id == user.id, ReviewSchedule.active == True, ReviewSchedule.next_review_date <= today)).all()
    
    weak_problems = []
    for p in total_problems:
        last_attempt = session.exec(select(Attempt).where(Attempt.problem_id == p.id).order_by(Attempt.attempt_date.desc())).first()
        if last_attempt and last_attempt.ai_memory_rating in [MemoryRating.PARTIAL, MemoryRating.FORGOT]:
            weak_problems.append(p)

    return templates.TemplateResponse("dashboard.html", {
        "request": request, 
        "user": user,
        "total_problems_count": len(total_problems),
        "total_attempts_count": len(total_attempts),
        "due_count": len(due_problems),
        "weak_problems": weak_problems
    })

# Submit Problem
@app.get("/submit", response_class=HTMLResponse)
def submit_form(request: Request, user: User = Depends(get_current_user)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("submit.html", {"request": request})

@app.post("/submit")
def submit_problem(
    request: Request,
    leetcode_ref: str = Form(...),
    title: str = Form(...),
    difficulty: str = Form(...),
    tags: str = Form(...),
    description: str = Form(...),
    approach_text: str = Form(...),
    code: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)

    # Check if problem exists
    existing_problem = session.exec(select(Problem).where(Problem.user_id == user.id, Problem.leetcode_ref == leetcode_ref)).first()

    if existing_problem:
        new_attempt = Attempt(
            problem_id=existing_problem.id,
            user_id=user.id,
            attempt_type=AttemptType.REVIEW,
            approach_text=approach_text,
            code=code,
            language=language,
            ai_memory_rating=MemoryRating.REMEMBERED # Defaulting
        )
        session.add(new_attempt)
        
        schedule = session.exec(select(ReviewSchedule).where(ReviewSchedule.problem_id == existing_problem.id)).first()
        if schedule:
            schedule_update = calculate_next_review(schedule.current_interval_days, MemoryRating.REMEMBERED)
            schedule.current_interval_days = schedule_update["current_interval_days"]
            schedule.next_review_date = schedule_update["next_review_date"]
            schedule.last_review_date = date.today()
            schedule.active = True
            session.add(schedule)
        
        session.commit()
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)

    # New Problem
    new_problem = Problem(
        user_id=user.id,
        leetcode_ref=leetcode_ref,
        title=title,
        difficulty=Difficulty(difficulty),
        tags=tags,
        description=description
    )
    session.add(new_problem)
    session.commit()
    session.refresh(new_problem)

    # Original Attempt
    original_attempt = Attempt(
        problem_id=new_problem.id,
        user_id=user.id,
        attempt_type=AttemptType.ORIGINAL,
        approach_text=approach_text,
        code=code,
        language=language
    )
    session.add(original_attempt)

    # Schedule
    initial_schedule = get_initial_schedule()
    new_schedule = ReviewSchedule(
        problem_id=new_problem.id,
        user_id=user.id,
        next_review_date=initial_schedule["next_review_date"],
        current_interval_days=initial_schedule["current_interval_days"],
        active=True
    )
    session.add(new_schedule)
    
    session.commit()
    
    return RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)

# Practice List
@app.get("/practice", response_class=HTMLResponse)
def practice_list(request: Request, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    today = date.today()
    due_schedules = session.exec(select(ReviewSchedule).where(ReviewSchedule.user_id == user.id, ReviewSchedule.active == True, ReviewSchedule.next_review_date <= today)).all()
    
    problems = []
    for s in due_schedules:
        problems.append(s.problem)
        
    return templates.TemplateResponse("practice_list.html", {"request": request, "problems": problems})

# Practice Detail
@app.get("/practice/{problem_id}", response_class=HTMLResponse)
def practice_detail(request: Request, problem_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    problem = session.get(Problem, problem_id)
    if not problem or problem.user_id != user.id:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    return templates.TemplateResponse("practice_detail.html", {"request": request, "problem": problem})

@app.post("/practice/{problem_id}")
def practice_submit(
    request: Request,
    problem_id: int,
    approach_text: str = Form(...),
    code: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
        
    problem = session.get(Problem, problem_id)
    if not problem or problem.user_id != user.id:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Get Original Attempt
    original_attempt = session.exec(select(Attempt).where(Attempt.problem_id == problem_id, Attempt.attempt_type == AttemptType.ORIGINAL)).first()
    
    # Call Gemini
    ai_result = compare_attempts(
        problem_description=problem.description,
        original_approach=original_attempt.approach_text if original_attempt else "N/A",
        original_code=original_attempt.code if original_attempt else None,
        new_approach=approach_text,
        new_code=code
    )
    
    rating = MemoryRating(ai_result["rating"])
    
    # Create Review Attempt
    new_attempt = Attempt(
        problem_id=problem.id,
        user_id=user.id,
        attempt_type=AttemptType.REVIEW,
        approach_text=approach_text,
        code=code,
        language=language,
        ai_feedback_summary=ai_result["summary"],
        ai_memory_rating=rating
    )
    session.add(new_attempt)
    session.commit()
    session.refresh(new_attempt)
    
    # Update Schedule
    schedule = session.exec(select(ReviewSchedule).where(ReviewSchedule.problem_id == problem.id)).first()
    if schedule:
        schedule_update = calculate_next_review(schedule.current_interval_days, rating)
        schedule.current_interval_days = schedule_update["current_interval_days"]
        schedule.next_review_date = schedule_update["next_review_date"]
        schedule.last_review_date = date.today()
        session.add(schedule)
        session.commit()
        
    return RedirectResponse(url=f"/revise/{new_attempt.id}", status_code=status.HTTP_302_FOUND)

# Revise / Result
@app.get("/revise/{attempt_id}", response_class=HTMLResponse)
def revise_view(request: Request, attempt_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user:
        return RedirectResponse(url="/login", status_code=status.HTTP_302_FOUND)
    
    attempt = session.get(Attempt, attempt_id)
    if not attempt or attempt.user_id != user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    problem = attempt.problem
    original_attempt = session.exec(select(Attempt).where(Attempt.problem_id == problem.id, Attempt.attempt_type == AttemptType.ORIGINAL)).first()
    
    return templates.TemplateResponse("revise.html", {
        "request": request, 
        "attempt": attempt, 
        "problem": problem, 
        "original_attempt": original_attempt
    })
