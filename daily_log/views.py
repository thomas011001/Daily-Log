import json
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from .models import *

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "daily/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "daily/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "daily/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "daily/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "daily/register.html")

# api : log - note - events - tasks - user

def user(request, id):
    if request.method == "GET":
        user = User.objects.get(pk=id)
        return JsonResponse(user.serialize())


def log(request):
    if request.method == "POST":
        if request.user.is_authenticated: 
            user = request.user
            data = json.loads(request.body)
            date = data.get("date")
    
            is_log_exist = DailyLog.objects.filter(user=user, day_date=date).exists()

            if not is_log_exist:
                log = DailyLog(
                    user = user,
                    day_date = date
                )
                log.save()
                return JsonResponse({"success": True, "log_id": log.id, "msg": "You Have Created Log", "msgTyp": "success"})

            else:
                return JsonResponse({"success": False, "msg": "the log is already exists", "msgTyp": "danger"}, status=400)
        
        else: 
            return JsonResponse({"succuss": False, "msg": "you need to log in", "msgTyp": "danger"}, status=401)
    
    if request.method == "GET":
        filter = request.GET.get("filter", None)
        
        if not filter:
            try:
                log_id = request.GET.get("id")
                log = DailyLog.objects.get(pk=log_id, user=request.user)
                return JsonResponse(log.serialize())

            except DailyLog.DoesNotExist: 
                return JsonResponse({"succuss": False, "msg": "log does not exist", "msgTyp": "danger"}, status=404)
        elif filter == "user":
            if request.user.is_authenticated:     
                user = request.user
                logs = DailyLog.objects.filter(user=user)
                data = [log.serialize() for log in logs]

                return JsonResponse({"data": data})
            else :
                return JsonResponse({"succuss": False, "msg": "You need to log in", "msgTyp": "danger"}, status=404)
    

def task(request):

    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            log_id = data.get("log_id")
            user = request.user
            title = data.get("title")
            description = data.get("description", None)
            end_time = data.get("time", None)
            log = DailyLog.objects.get(pk=log_id)
            
            task = Task(
                user = user,
                title = title,
                description = description, 
                daily_log = log,
                end_time = end_time
            )
            task.save()

            return JsonResponse({"success": True, "msg": "You Have Created Task", "msgTyp": "success"})
    else:
        try:
            id = request.GET.get("id")
            task = Task.objects.get(pk=id, user=request.user)
        except Task.DoesNotExist:
            return JsonResponse({"succuss": False, "msg": "Task does not exist", "msgTyp": "danger"}, status=404)

        if request.method == "GET":
            return JsonResponse(task.serialize())
        
        elif request.method == "PUT":
            data = json.loads(request.body)
            
            for field in ["title", "finished", "description", "end_time"]:
                if field in data:
                    setattr(task, field, data.get(field))
            
            task.save()

            return JsonResponse({"success": True, "msg": "You Have Edited a Task", "msgTyp": "success"})
        
        elif request.method == "DELETE":
            task.delete()
            return JsonResponse({"success": True, "msg": " deleted", "msgTyp": "success"})


def note(request):

    if request.method == "POST":
        data = json.loads(request.body)
        user = request.user
        title = data.get("title")
        description = data.get("description")
        log_id = data.get("log_id")
        daily_log = DailyLog.objects.get(pk=log_id)
        note = Note(
            user = user,
            title = title,
            description = description,
            daily_log = daily_log
        )

        note.save()

        return JsonResponse({"success": True, "msg": "You Have Created a Note", "msgTyp": "success"})
    
    else:
        try:
            note_id = request.GET.get("id")
            note = Note.objects.get(pk=note_id)
        except Note.DoesNotExist:
            return JsonResponse({"succuss": False, "msg": "Note does not exist", "msgTyp": "danger"}, status=404)

        if request.method == "GET":
            return JsonResponse(note.serialize())

        elif request.method == "PUT":
            data = json.loads(request.body)

            for field in ["title", "description"]:
                if field in data:
                    setattr(note, field, data.get(field))
            
            note.save()
            return JsonResponse({"success": True, "msg": "You Have Edited a Note", "msgTyp": "success"})

        elif request.method == "DELETE":
            note.delete()
            return JsonResponse({"success": True, "msg": " deleted", "msgTyp": "success"})

            
def event(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            title = data.get("title")
            description = data.get("description")
            start = data.get("start_time")
            end = data.get("end_time")
            log_id = data.get("log_id")
            log = DailyLog.objects.get(pk=log_id)
            
            event = Event(
                user = request.user,
                title = title,
                description = description,
                start_time = start,
                end_time = end,
                daily_log = log 
            )

            event.save()
            
            return JsonResponse({"success": True, "msg": "You Have Created an Event", "msgTyp": "success"})

    else:
        try:
            event_id = request.GET.get("id")
            event = Event.objects.get(pk=event_id, user=request.user)
        except:
            return JsonResponse({"succuss": False, "msg": "Event does not exist", "msgTyp": "danger"}, status=404)

        if request.method == "GET":
            return JsonResponse(event.serialize())

        elif request.method == "PUT":
            data = json.loads(request.body)

            for field in ["title", "start_time", "description", "end_time"]:
                if field in data:
                    setattr(event, field, data.get(field))
            event.save()
            return JsonResponse({"success": True, "msg": "You Have Edited an Event", "msgTyp": "success"})

        
        elif request.method == "DELETE":
            event.delete()
            return JsonResponse({"success": True, "msg": " deleted", "msgTyp": "success"})



def index(request):
    if request.user.is_authenticated:
        try:
            last_log = DailyLog.objects.get(day_date = datetime.today(), user=request.user)
            return HttpResponseRedirect(reverse("log_view", args=([last_log.id])))
        except:
            return render(request, "daily/welcome.html")
    return render(request, "daily/welcome.html")

@login_required
def log_view(request, id):
    return render(request, "daily/log.html", {
        "id": id
    })

@login_required
def new(request):
    return render(request, "daily/new.html")

@login_required
def all(request):
    return render(request, "daily/all_logs.html", {
        "logs": request.user.serialize()['daily_logs']
    })

def htu(request):
    return render(request, "daily/howtouse.html")