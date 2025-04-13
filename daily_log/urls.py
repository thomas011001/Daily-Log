from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("log/<int:id>", views.log_view, name="log_view"),
    path("new", views.new, name="new"),
    path("log/all", views.all, name="all_logs"),
    path("htu", views.htu, name="htu"),

    # api routs
    path("api/user/<int:id>", views.user, name="user"),
    path("api/log", views.log, name="log"),
    path("api/task", views.task, name="task"),
    path("api/note", views.note, name="note"),
    path("api/event", views.event, name="event"),
]