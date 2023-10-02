$(document).ready(function() {
    $("#appointmentForm").on("submit", function(event) {
        console.log("jQuery event listener triggered");
        event.preventDefault();
        createAppointment();
    });
});

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

function createAppointment() {
    console.log("createAppointment function has been called.");

    let patientName = document.getElementById("inputPatientName").value;
    let doctorId = document.getElementById("inputDoctorName").value;
    let phoneNumber = document.getElementById("inputPhone").value;
    let symptoms = document.getElementById("inputSymptoms").value;
    let startTime = document.getElementById("inputStartTime").value;
    let appointmentDate = document.getElementById("inputDate").value;

   if (!patientName) {
    console.log("Patient name is empty.");
    return;
}
if (!doctorId || doctorId === "") {
    console.log("Doctor is not selected.");
    return;
}
if (!phoneNumber) {
    console.log("Phone number is empty.");
    return;
}
if (!symptoms) {
    console.log("Symptoms field is empty.");
    return;
}
if (!startTime) {
    console.log("Start time is empty.");
    return;
}
if (!appointmentDate) {
    console.log("Appointment date is empty.");
    return;
}

    let formData = {
        patient_name: patientName,
        doctor: doctorId,
        phone_number: phoneNumber,
        symptoms: symptoms,
        start_time: startTime,
        date: appointmentDate,
        status: "Pending"
    };

    console.log("Preparing to make the fetch request...");

    fetch("/api/appointments/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log("Fetch request was made.");
        if (!response.ok) {
            // Not a 2XX HTTP response code
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        if (data.id) {
            alert("Appointment successfully created!");
        } else {
            alert("There was an error creating the appointment. Please check your input.");
        }
    })
    .catch(error => {
        console.error('There was an error:', error);
        if (error.detail) { // Check if there's a detail field in the error
            alert(`Error: ${error.detail}`);
        } else {
            alert("There was an error creating the appointment. Please try again later.");
        }
    });
}
