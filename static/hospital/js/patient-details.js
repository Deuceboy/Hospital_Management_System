// Function to get CSRF token
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Helper function to display messages inside the modal
function displayMessage(message, isSuccess = true) {
    const messageDiv = $('#messagePlaceholder');
    const messageClass = isSuccess ? 'alert-success' : 'alert-danger';
    messageDiv.html(`<div class="alert ${messageClass}">${message}</div>`);
}

// Event Listener for Patient Link Click
$(document).on('click', '.patient-link', function() {
    const patientId = $(this).data('patient-id');

    $.ajax({
        url: `/api/patients/${patientId}/`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            const patientDetailsHtml = `
                <input type="hidden" id="patientId" value="${data.id}">
                <strong>Name:</strong> ${data.first_name} ${data.last_name}<br>
                <strong>Date of Birth:</strong> ${data.date_of_birth}<br>
                <strong>Gender:</strong> ${data.gender}<br>
                <strong>Address:</strong> ${data.address}<br>
                <strong>Phone Number:</strong> ${data.phone_number}<br>
                <strong>Email:</strong> ${data.email}<br>
                <strong>Medical History:</strong> ${data.medical_history}<br>
                <strong>Insurance Information:</strong> ${data.insurance_information}<br>
            `;
            $("#patientDetailsPlaceholder").html(patientDetailsHtml);
            $("#patientModal").modal('show');
            $('#messagePlaceholder').empty();
        },
        error: function(error) {
            console.error("Failed to fetch patient details:", error);
        }
    });
});

// Event Listener for Update Medical History Form Submission
$(document).on('submit', '#updateMedicalHistoryForm', function(e) {
    e.preventDefault();

    const patientId = $('#patientId').val();
    const medicalHistory = $('#medical_history').val();
    const csrfToken = getCSRFToken();
    console.log("CSRF Token:", csrfToken);

    $.ajax({
        url: `/api/patients/${patientId}/`,
        type: 'PATCH',
        dataType: 'json',
        data: {
            'medical_history': medicalHistory
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", csrfToken);
        },
        success: function(data) {
            displayMessage("Medical history updated successfully!");
        },
        error: function(error) {
            displayMessage("Failed to update medical history. Please try again.", false);
        }
    });
});
