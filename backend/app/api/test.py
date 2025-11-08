"""Test/Development endpoints without authentication"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database import get_db
from ..models.user import User
from ..models.scrape_job import ScrapeJob, JobStatus, TriggerType
from ..core.security import get_password_hash
import uuid

router = APIRouter(prefix="/test", tags=["test"])

@router.post("/init-test-user", response_model=Dict[str, Any])
async def initialize_test_user(db: Session = Depends(get_db)):
    """
    Initialize a test user with default settings for development.
    This endpoint is for local testing only - remove in production!
    """
    # Check if test user already exists
    test_user = db.query(User).filter(User.email == "test@example.com").first()

    if test_user:
        return {
            "message": "Test user already exists",
            "user_id": str(test_user.id),
            "email": test_user.email,
        }

    # Create test user
    test_user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("test123"),
        is_active=True,
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    return {
        "message": "Test user created successfully",
        "user_id": str(test_user.id),
        "email": test_user.email,
        "password": "test123",
        "note": "Use these credentials to login or use test endpoints"
    }


@router.get("/health")
async def test_health():
    """Simple health check endpoint"""
    return {
        "status": "ok",
        "message": "Test endpoints are available",
        "note": "These endpoints bypass authentication for local testing"
    }


@router.post("/trigger-scrape", response_model=Dict[str, Any])
async def trigger_test_scrape(db: Session = Depends(get_db)):
    """
    Trigger a scrape job without authentication.
    Uses the test user automatically.
    For local testing only!
    """
    # Get or create test user
    test_user = db.query(User).filter(User.email == "test@example.com").first()

    if not test_user:
        # Auto-create test user if it doesn't exist
        test_user = User(
            id=uuid.uuid4(),
            email="test@example.com",
            hashed_password=get_password_hash("test123"),
            is_active=True,
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

    # Create a test scrape job
    job = ScrapeJob(
        id=uuid.uuid4(),
        user_id=test_user.id,
        status=JobStatus.PENDING,
        trigger_type=TriggerType.MANUAL,
        job_metadata={
            "test_mode": True,
            "note": "This is a test scrape job"
        }
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "message": "Test scrape job created",
        "job_id": str(job.id),
        "status": job.status.value,
        "user_id": str(test_user.id),
        "note": "Job created but won't execute without API keys configured. Set up API keys in Settings first."
    }


@router.get("/jobs", response_model=Dict[str, Any])
async def get_test_jobs(db: Session = Depends(get_db)):
    """
    Get all jobs for the test user without authentication.
    For local testing only!
    """
    # Get test user
    test_user = db.query(User).filter(User.email == "test@example.com").first()

    if not test_user:
        raise HTTPException(
            status_code=404,
            detail="Test user not found. Call /test/init-test-user first"
        )

    # Get all jobs for test user
    jobs = db.query(ScrapeJob).filter(
        ScrapeJob.user_id == test_user.id
    ).order_by(ScrapeJob.created_at.desc()).limit(20).all()

    return {
        "user_id": str(test_user.id),
        "total_jobs": len(jobs),
        "jobs": [
            {
                "id": str(job.id),
                "status": job.status.value,
                "trigger_type": job.trigger_type.value,
                "created_at": job.created_at.isoformat(),
                "completed_at": job.completed_at.isoformat() if job.completed_at else None,
                "metadata": job.job_metadata
            }
            for job in jobs
        ]
    }
