document.addEventListener("DOMContentLoaded", function() {
    let appointmentItems = document.querySelectorAll("[data-appointment-id]");

    appointmentItems.forEach(item => {
        let appointmentId = item.getAttribute("data-appointment-id");

        item.addEventListener("click", function(event) {
            // Ensure that the click was not made on the "Reschedule" button
            if (!event.target.classList.contains("btn-reschedule")) {
                fetchAppointmentDetails(appointmentId);
            }
        });

        // Listen to status change dropdowns
        let statusDropdowns = item.querySelectorAll(".dropdown-item");
        statusDropdowns.forEach(statusOption => {
            statusOption.addEventListener("click", function(event) {
                event.stopPropagation(); // Prevent the main appointment click event

                let newStatus = statusOption.getAttribute("data-status");
                changeAppointmentStatus(appointmentId, newStatus);
            });
        });
    });
});

function changeAppointmentStatus(appointmentId, newStatus) {
    fetch(`/api/appointments/${appointmentId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({
            status: newStatus
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Appointment status updated:", data);
        // You can provide a feedback message or refresh the page to reflect the changes
        location.reload(); // Refresh the page (you can also use more efficient ways to update the view without a full page reload)
    })
    .catch(error => {
        console.error('Error updating appointment status:', error);
    });
}