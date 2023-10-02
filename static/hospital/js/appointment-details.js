// Utility function to get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to fetch and display appointment details
function fetchAppointmentDetails(appointmentId) {
    fetch(`/api/appointments/${appointmentId}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch appointment details. Please try again.');
        }
        return response.json();
    })
    .then(details => {
        // Populate the modal with the fetched details
        document.getElementById("modalAppointmentDate").textContent = details.date || 'N/A'; // Fallback to 'N/A' if date isn't provided
        document.getElementById("modalAppointmentTime").textContent = details.start_time || 'N/A';
        document.getElementById("modalPatientName").textContent = details.patient_name || 'N/A';
        document.getElementById("modalPhoneNumber").textContent = details.phone_number || 'N/A';
        document.getElementById("modalSymptoms").textContent = details.symptoms || 'N/A';
        document.getElementById("modalStatus").textContent = details.status || 'N/A';

        // Show the modal
        $("#appointmentDetailsModal").modal('show');
    })
    .catch(error => {
        console.error('Error fetching appointment details:', error);
        alert(error.message); // Provide feedback to the user
    });
}

// You can add more logic related to appointment details in this file if needed
