$(document).ready(function() {

    // Fetch report button click event
    $('#fetchReportBtn').on('click', function() {
        const patientName = $('#patientNameInput').val();

        if (patientName) {
            $.ajax({
                url: '/api/nurse-reports/',
                method: 'GET',
                data: { name: patientName },
                dataType: 'json',
                success: function(response) {
                    if(response.length > 0) {
                        displayReport(response[0], patientName);  // Pass patientName to the function
                    } else {
                        resetModal();
                        $('#reportModal .modal-body').append('<p>No report found for the given patient name.</p>');
                    }
                },
                error: function(error) {
                    alert("Error fetching report. Please try again.");
                }
            });
        } else {
            alert("Please enter a patient name.");
        }
    });

    // Display the fetched report
    function displayReport(report, patientName) {  // Accept patientName as an argument
        $('#patientNameInput').hide();
        $('#reportDetails').show();
        $('#reportDate').text(report.date);
        $('#reportStatus').text(report.current_status);
        $('#reportMedications').text(report.medications_treatments);
        $('#reportOtherDetails').text(report.other_details);
        $('#reportPatientName').text(patientName);  // Now it uses the passed patientName
    }

    // Reset modal for new fetch or if no report is found
    function resetModal() {
        $('#patientNameInput').show().val('');  // Also clear any existing input
        $('#reportDetails').hide();
    }

    // Reset modal every time it's closed
    $('#reportModal').on('hidden.bs.modal', function () {
        resetModal();
    });

});
