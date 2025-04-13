document.addEventListener("DOMContentLoaded", function(){

    // adding an object
    new Sortable(objects, {
        animation: 150
    });
    
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const noteModal = new bootstrap.Modal(document.getElementById('noteModal'));
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    
    document.querySelector("#taskForm").addEventListener("submit", addTask);
    document.querySelector("#noteForm").addEventListener("submit", addNote);
    document.querySelector("#eventForm").addEventListener("submit", addEvent);
    
    function addTask(event) {
        event.preventDefault();
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const title = document.querySelector("#task-title").value;
        const description = document.querySelector("#task-description").value;   
        const endTime = document.querySelector("#task-time").value ? document.querySelector("#task-time").value : null;

        fetch(`/api/task`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                log_id: logId,
                title: title,
                description: description,
                time: endTime,
            })
        })
        .then(res => res.json())
        .then(data => {
            document.querySelector("#task-time").value = "";
            document.querySelector("#task-description").value = "";
            document.querySelector("#task-title").value = "";
            taskModal.hide();
            displayObjects();
            displayMsg(data.msg, data.msgTyp);
        });
    }

    function addNote(event) {
        event.preventDefault();
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const title = document.querySelector("#note-title").value;
        const description = document.querySelector("#note-description").value;   

        fetch(`/api/note`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                log_id: logId,
                title: title,
                description: description,
            })
        })
        .then(res => res.json())
        .then(data => {
            document.querySelector("#note-description").value = "";
            document.querySelector("#note-title").value = "";
            noteModal.hide();
            displayObjects()
            displayMsg(data.msg, data.msgTyp);
        });
    }

    function addEvent(event) {
        event.preventDefault();
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const title = document.querySelector("#event-title").value;
        const description = document.querySelector("#event-description").value;   
        const start = document.querySelector("#event-start-time").value;   
        const end = document.querySelector("#event-end-time").value;   

        fetch(`/api/event`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                log_id: logId,
                title: title,
                description: description,
                start_time: start,
                end_time: end
            })
        })
        .then(res => res.json())
        .then(data => {
            document.querySelector("#event-description").value = "";
            document.querySelector("#event-title").value = "";
            document.querySelector("#event-end-time").value = "";
            document.querySelector("#event-start-time").value = "";
            eventModal.hide();
            displayObjects()
            displayMsg(data.msg, data.msgTyp);
        });
    }
    
    function displayObjects() {
        fetch(`/api/log?id=${logId}`)
        .then(res => res.json())
        .then(data => { 
            document.querySelector(`#log-day`).innerHTML = `Day: <span class="date">${data.day_date}</span>`;
            document.querySelector("#objects").innerHTML = "";
            return data.objects;
        })
        .then(objects => objects.forEach(object => {
            const objectType = object.type;
            const ul = document.querySelector("#objects");
            const li = document.createElement("li");
            li.dataset.id = object.id;
            li.classList.add("item", "mb-3", objectType);
            if (objectType == "task" && object.finished) { li.classList.add("finished"); }
            const icon = objectType == "task" ? "fa-solid fa-circle" 
                        : objectType == "note" ? "fa-solid fa-quote-left"
                        : "fa-regular fa-circle-dot";
            li.innerHTML = `
                <i class="${icon}"></i>  <span class="text">${object.title}</span>
            `;

            li.addEventListener("click", displayObjectModal);

            ul.append(li);
        }));
    }

    displayObjects();

    function displayMsg(msg, msgTyp) {
        document.querySelector("#msg").innerHTML = `
            <div class="alert alert-${msgTyp} alert-dismissible fade show" role="alert">
                ${msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    function displayObjectModal(){
        const classList = this.classList;
        const object = classList.contains("task") ? "task"
                    : classList.contains("note") ? "note"
                    : "event";

        if (object == "task") displayTaskModal(this);
        else if (object == "note") displayNoteModal(this);
        else displayEventModal(this);
    }

    function displayTaskModal(task) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/api/task?id=${task.dataset.id}`)
        .then(res => res.json())
        .then(data => {
            const editBtn = document.querySelector("#task-edit"); 
            const saveBtn = document.querySelector("#task-save");
            const deleteBtn = document.querySelector("#task-delete");
            const submitBtn = document.querySelector("#task-submit");
            submitBtn.disabled = true
            editBtn.classList.remove("hidden");
            deleteBtn.classList.remove("hidden");
            
            const id = data.id;
            const title = data.title;
            const desc = data.description;
            const time = data.end_time;
            const finished = data.finished;

            const taskTitle = document.querySelector("#task-title");
            const taskDesc = document.querySelector("#task-description");
            const taskFinished = document.querySelector("#task-finished");
            const taskTime = document.querySelector("#task-time");

            taskTitle.value = title;
            taskDesc.value = desc;
            taskFinished.checked = finished;
            taskTime.value = time;
            
            [taskDesc, taskTime, taskFinished, taskTitle].forEach(obj => {
                obj.disabled = true;
                obj.classList.add("disabled");
            });

            document.querySelector("#taskModalLabel").textContent = title;
            document.querySelector("#taskModal input[type=submit]").classList.add("hidden");

            editBtn.addEventListener("click", function() {
                this.classList.add("hidden");
                saveBtn.classList.remove("hidden");
                [taskDesc, taskTime, taskFinished, taskTitle].forEach(obj => {
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                });
                
                saveBtn.addEventListener("click", function() {
                    fetch(`/api/task?id=${id}`, {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify({
                            title: taskTitle.value,
                            description: taskDesc.value,
                            end_time: taskTime.value ? taskTime.value : "00:00",
                            finished: taskFinished.checked,
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        taskModal.hide();
                        task.children[1].textContent = taskTitle.value
                        if (taskFinished.checked) task.classList.add("finished") ;
                        else task.classList.remove("finished");
                        displayMsg(data.msg, data.msgTyp);
                    });
                });
            });

            deleteBtn.addEventListener("click", function() {
                fetch(`/api/task?id=${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    taskModal.hide()
                    task.remove()
                    displayMsg(data.msg, data.msgTyp)
                });
            })

            document.getElementById('taskModal').addEventListener("hidden.bs.modal", function() {
                editBtn.classList.add("hidden");
                saveBtn.classList.add("hidden");
                deleteBtn.classList.add("hidden");
                submitBtn.disabled = false;
                submitBtn.classList.remove("hidden");
                document.querySelector("#taskModalLabel").textContent = "New Task";
                [taskDesc, taskTime, taskFinished, taskTitle].forEach(obj => {
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                    obj != taskFinished ? obj.value = "" : obj.checked = false
                });
            });

            taskModal.show();

        });
    }

    function displayNoteModal(note) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/api/note?id=${note.dataset.id}`)
        .then(res => res.json())
        .then(data => {
            const editBtn = document.querySelector("#note-edit"); 
            const saveBtn = document.querySelector("#note-save");
            const deleteBtn = document.querySelector("#note-delete");
            const submitBtn = document.querySelector("#note-submit");
            submitBtn.disabled = true
            editBtn.classList.remove("hidden");
            deleteBtn.classList.remove("hidden");
            
            const id = data.id;
            const title = data.title;
            const desc = data.description;

            const noteTitle = document.querySelector("#note-title");
            const noteDesc = document.querySelector("#note-description");


            noteTitle.value = title;
            noteDesc.value = desc;
            
            [noteDesc, noteTitle].forEach(obj => {
                obj.disabled = true;
                obj.classList.add("disabled");
            });

            document.querySelector("#noteModalLabel").textContent = title;
            document.querySelector("#noteModal input[type=submit]").classList.add("hidden");

            editBtn.addEventListener("click", function() {
                this.classList.add("hidden");
                saveBtn.classList.remove("hidden");
                [noteDesc, noteTitle].forEach(obj => {
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                });
                
                saveBtn.addEventListener("click", function() {
                    fetch(`/api/note?id=${id}`, {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify({
                            title: noteTitle.value,
                            description: noteDesc.value,
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        noteModal.hide();
                        note.children[1].textContent = noteTitle.value
                        displayMsg(data.msg, data.msgTyp);
                    });
                });
            });

            deleteBtn.addEventListener("click", function() {
                fetch(`/api/note?id=${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    noteModal.hide()
                    note.remove()
                    displayMsg(data.msg, data.msgTyp)
                });
            })

            document.getElementById('noteModal').addEventListener("hidden.bs.modal", function() {
                editBtn.classList.add("hidden");
                saveBtn.classList.add("hidden");
                deleteBtn.classList.add("hidden");
                submitBtn.classList.remove("hidden");
                submitBtn.disabled = false;
                document.querySelector("#noteModalLabel").textContent = "New Note";
                [noteDesc, noteTitle].forEach(obj => {
                    obj.value = ""
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                });
            });

            noteModal.show();
            
        });
    }


    function displayEventModal(event) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/api/event?id=${event.dataset.id}`)
        .then(res => res.json())
        .then(data => {
            const editBtn = document.querySelector("#event-edit"); 
            const saveBtn = document.querySelector("#event-save");
            const deleteBtn = document.querySelector("#event-delete");
            const submitBtn = document.querySelector("#event-submit");
            submitBtn.disabled = true
            submitBtn.classList.add("hidden");
            editBtn.classList.remove("hidden");
            deleteBtn.classList.remove("hidden");
            
            const id = data.id;
            const title = data.title;
            const desc = data.description;
            const start = data.start_time;
            const end = data.end_time;

            const eventTitle = document.querySelector("#event-title");
            const eventDesc = document.querySelector("#event-description");
            const eventStart = document.querySelector("#event-start-time");
            const eventEnd = document.querySelector("#event-end-time");


            eventTitle.value = title;
            eventDesc.value = desc;
            eventStart.value = start;
            eventEnd.value = end;
            
            [eventDesc, eventStart, eventEnd, eventTitle].forEach(obj => {
                obj.disabled = true;
                obj.classList.add("disabled");
            });

            document.querySelector("#eventModalLabel").textContent = title;

            editBtn.addEventListener("click", function() {
                this.classList.add("hidden");
                saveBtn.classList.remove("hidden");
                [eventDesc, eventStart, eventEnd, eventTitle].forEach(obj => {
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                });
                
                saveBtn.addEventListener("click", function() {
                    fetch(`/api/event?id=${id}`, {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        },
                        body: JSON.stringify({
                            title: eventTitle.value,
                            description: eventDesc.value,
                            start_time: eventStart.value, 
                            end_time: eventEnd.value, 
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        eventModal.hide();
                        event.children[1].textContent = eventTitle.value
                        displayMsg(data.msg, data.msgTyp);
                    });
                });
            });

            deleteBtn.addEventListener("click", function() {
                fetch(`/api/event?id=${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    eventModal.hide()
                    event.remove()
                    displayMsg(data.msg, data.msgTyp)
                });
            })

            document.getElementById('eventModal').addEventListener("hidden.bs.modal", function() {
                editBtn.classList.add("hidden");
                saveBtn.classList.add("hidden");
                deleteBtn.classList.add("hidden");
                submitBtn.classList.remove("hidden");
                submitBtn.disabled = false;
                document.querySelector("#eventModalLabel").textContent = "New Event";
                [eventDesc, eventStart, eventEnd, eventTitle].forEach(obj => {
                    obj.value = ""
                    obj.disabled = false;
                    obj.classList.remove("disabled");
                });
            });

            eventModal.show();

        });
    }
});
