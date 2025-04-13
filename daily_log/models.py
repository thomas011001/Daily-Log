from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Create your models here.

class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "daily_logs": [{"id": log.id, "date": log.day_date} for log in self.daily_logs.all()],
        }  

class DailyLog(models.Model): 
    user = models.ForeignKey(User, related_name="daily_logs", on_delete=models.CASCADE)
    day_date = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)

    def serialize(self):
        all_items = []

        for task in self.tasks.all():
            all_items.append({
                "type": "task",
                "id": task.id,
                "title": task.title,
                "finished": task.finished,
                "created_at": task.created_at,
            })

        for note in self.notes.all():
            all_items.append({
                "type": "note",
                "id": note.id,
                "title": note.title,
                "created_at": note.created_at,
            })

        for event in self.events.all():
            all_items.append({
                "type": "event",
                "id": event.id,
                "title": event.title,
                "created_at": event.created_at,
            })

        all_items.sort(key=lambda item: item["created_at"])
        return {
            "id": self.id,
            "user": self.user.username,
            "day_date": self.day_date.strftime("%Y-%m-%d"),
            "objects": all_items
        }


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name=("tasks"))
    title = models.TextField(max_length=50)
    finished = models.BooleanField(default=False)
    description = models.TextField(max_length=300, null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "finished": self.finished, 
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
        }

class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    title = models.TextField(max_length=50)
    description = models.TextField(max_length=300, null=True)
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name=("notes"))
    created_at = models.DateTimeField(default=timezone.now)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
        }

class Event(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    title = models.TextField(max_length=50)
    description = models.TextField(max_length=300, null=True)
    start_time = models.TimeField()
    end_time = models.TimeField(null=True)
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name=("events"))
    created_at = models.DateTimeField(default=timezone.now)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
        }