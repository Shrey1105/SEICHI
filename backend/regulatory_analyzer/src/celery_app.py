"""
Celery configuration for background tasks
"""

from celery import Celery
from src.config import REDIS_URL

# Create Celery app
celery_app = Celery(
    "regulatory_intelligence",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hour
    beat_schedule={
        "cleanup-old-reports": {
            "task": "src.tasks.cleanup_old_reports",
            "schedule": 86400.0,  # Daily
        },
        "process-scheduled-analyses": {
            "task": "src.tasks.process_scheduled_analyses",
            "schedule": 3600.0,  # Hourly
        },
    },
)

if __name__ == "__main__":
    celery_app.start()
