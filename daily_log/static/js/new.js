document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("#newLog")
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    form.addEventListener("submit", function(event){
        event.preventDefault()
        const inp = document.querySelector("#date").value
        const date = new Date(inp)
        const today = new Date()
        today.setHours(0,0,0,0)

        if (date >= today) {
            fetch(`/api/log`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    date: inp
                })
            })
            .then(res => res.json())
            .then(data => {
                data.success ? window.location.replace(`/log/${data.log_id}`) : displayMsg(data.msg, data.msgTyp)
            })
        } else {
            displayMsg("You Can't Create Log In The Past", "danger")
        }
        
        function displayMsg(msg, msgTyp) {
            document.querySelector("#msg").innerHTML = `
                <div class="alert alert-${msgTyp} alert-dismissible fade show" role="alert">
                    ${msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }


    })
})