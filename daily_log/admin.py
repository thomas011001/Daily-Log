from django.contrib import admin

# Register your models here.

from .models import User, DailyLog, Task, Note, Event

admin.site.register(User)
admin.site.register(DailyLog)
admin.site.register(Task)
admin.site.register(Note)
admin.site.register(Event)