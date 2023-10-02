$(document).ready(function() {

    // Function to get the CSRF token from cookies
    function getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    // Function to get patient details from the server
    function fetchPatientDetails(patientId) {
        return $.ajax({
            url: `/api/nurse-reports/${patientId}/get_patient_details/`,
            method: 'GET',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')  // Fetch CSRF token
            }
        });
    }

    // Handle button click to populate modal fields
    $(".reportButton").click(function() {
        const patientId = $(this).data('patient-id');
        const patientName = $(this).data('patient-name');
        const currentDate = new Date().toLocaleDateString();

        // Populate the known form fields
        $("#reportPatientId").val(patientId);
        $("#reportPatientName").val(patientName);
        $("#currentDate").val(currentDate);

        // Fetch the patient details and populate the rest
        fetchPatientDetails(patientId).done(function(data) {
            $("#assignedDoctor").val(data.assigned_doctor);
            $("#nurseName").val(data.nurse_name);  // Updated to use the correct key
        }).fail(function() {
            alert('Failed to fetch patient details. Please try again.');
        });
    });

    // Handle form submission
$("#nurseReportForm").submit(function(event) {
    event.preventDefault();

    const formData = {
        patient: $("#reportPatientId").val(),
        current_status: $("#currentStatus").val(), // Add the current_status field
        medications_treatments: $("#medications").val(),
        other_details: $("#details").val(),
    };

    $.ajax({
        url: '/api/nurse-reports/',
        method: 'POST',
        data: formData,
        headers: {
            'Authorization': 'Bearer ' + getCookie('auth_token'),
            'X-CSRFToken': getCookie('csrftoken')
        },
        success: function(response) {
            alert('Report submitted successfully!');
            $("#nurseReportModal").modal('hide');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('AJAX Error:', errorThrown);
            alert('There was an error submitting the report. Please try again.');
        }
    });
});

});

