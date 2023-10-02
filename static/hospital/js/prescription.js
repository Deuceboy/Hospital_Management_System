// Function to get CSRF token
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Helper function to display messages in the modal
function displayPrescriptionMessage(message, isSuccess=true) {
    const messageDiv = document.querySelector('#prescriptionMessagePlaceholder');
    const messageClass = isSuccess ? 'alert-success' : 'alert-danger';
    messageDiv.innerHTML = `<div class="alert ${messageClass}">${message}</div>`;
}

document.addEventListener("DOMContentLoaded", function() {

    // Fetch the medications to populate the dropdown
    fetch('/api/medications/')
    .then(response => response.json())
    .then(medications => {
        const selectElement = document.getElementById('medicationDropdown');
        medications.forEach(medication => {
            const option = document.createElement('option');
            option.value = medication.id;
            option.innerText = medication.name;
            selectElement.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching medications:', error));

    // Event Listener for Prescription Form Submission
    document.querySelector('#prescriptionForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Disabling the prescribe button to prevent multiple submissions
        const prescribeBtn = document.querySelector("#prescribeButton");
        prescribeBtn.disabled = true;

        const patientId = document.querySelector('#prescriptionPatientId').value;
        const selectElement = document.getElementById('medicationDropdown');
        const medicationId = selectElement.value;
        const dosage = document.querySelector('#dosageInput').value;
        const instructions = document.querySelector('#instructionsTextarea').value;
        const datePrescribed = document.querySelector('#datePrescribedInput').value;
        const csrfToken = getCSRFToken();

        fetch(`/api/prescriptions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                patient: patientId,
                medication: medicationId,
                dosage: dosage,
                instructions: instructions,
                date_prescribed: datePrescribed // If you want the user to set the date
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.id) {
                displayPrescriptionMessage('Prescription added successfully!');
                $('#prescriptionModal').modal('hide'); // Closing the modal
            } else {
                displayPrescriptionMessage('Failed to add prescription. Please try again.', false);
            }
            prescribeBtn.disabled = false; // Re-enabling the prescribe button
        })
        .catch(error => {
            console.error('Error:', error);
            displayPrescriptionMessage('An error occurred while adding the prescription. Please try again.', false);
            prescribeBtn.disabled = false; // Re-enabling the prescribe button
        });
    });

    // Event Listener for Prescribe Button
    const prescribeButtons = document.querySelectorAll('.prescribe-btn');
    prescribeButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const patientId = event.target.getAttribute('data-patient-id');

            // Set the patientId in the modal's hidden input for later use
            document.querySelector('#prescriptionPatientId').value = patientId;

            // Reset the message placeholder when opening the modal
            document.querySelector('#prescriptionMessagePlaceholder').innerHTML = '';

            // Display the modal
            $('#prescriptionModal').modal('show');
        });
    });
});
