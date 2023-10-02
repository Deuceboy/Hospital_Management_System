document.addEventListener("DOMContentLoaded", function() {

    let rescheduleButtons = document.querySelectorAll(".btn-reschedule");

    rescheduleButtons.forEach(button => {
        button.addEventListener("click", function(event) {
            event.stopPropagation();

            const appointmentId = button.getAttribute("data-appointment-id");


            document.getElementById("confirmReschedule").dataset.appointmentId = appointmentId;

            // Manually triggering the modal after setting the data
            $("#rescheduleModal").modal('show');
        });
    });

    document.getElementById("confirmReschedule").addEventListener("click", function() {
        const appointmentId = this.dataset.appointmentId;
        const newDate = document.getElementById("newDate").value;
        const newTime = document.getElementById("newTime").value;

        rescheduleAppointment(appointmentId, newDate, newTime);
    });
});  // Ensure this closing parenthesis and curly bracket

function rescheduleAppointment(appointmentId, newDate, newTime) {
    fetch(`/api/appointments/${appointmentId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",  // Ensure the server knows we want JSON back
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            date: newDate,
            start_time: newTime
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Appointment rescheduled:", data);
        location.reload();
    })
    .catch(error => {
        console.error('Error rescheduling appointment:', error);
    });
}

