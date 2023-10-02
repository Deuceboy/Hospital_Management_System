document.addEventListener('DOMContentLoaded', function() {
    // Ensuring DOM is completely loaded before executing the JavaScript code

    // ===================
    // CONSTANTS
    // ===================
    const patientNameInput = document.getElementById('patientNameForInvoiceInput');
    const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
    const invoiceDetails = document.getElementById('invoiceDetails');
    const invoiceDateIssued = document.getElementById('invoiceDateIssued');
    const invoiceMedications = document.getElementById('invoiceMedications');
    const invoiceAmount = document.getElementById('invoiceAmount');
    const invoicePaymentStatus = document.getElementById('invoicePaymentStatus');
    const updatePaymentStatusBtn = document.getElementById('updatePaymentStatusBtn');
    const updatePaymentStatusDropdown = document.getElementById('updatePaymentStatusDropdown');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // ===================
    // FUNCTIONS
    // ===================
    function generateInvoice() {
        const patientName = patientNameInput.value;
        fetch(`/api/patients/?name=${patientName}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                const patientId = data[0].id;
                return fetch(`/api/invoices/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({ patient: patientId })
                });
            } else {
                throw new Error("Patient not found");
            }
        })
        .then(handleResponse)
        .then(displayInvoice)
        .catch(error => {
            console.error("Error:", error);
            alert('Failed to generate the invoice. Please try again.');
        });
    }
function updatePaymentStatus() {
    console.log("updatePaymentStatus function called");

    const invoiceId = document.getElementById('invoiceIdInput').value;
    const newPaymentStatus = document.getElementById('updatePaymentStatusDropdown').value;

    console.log(`Invoice ID: ${invoiceId}`);
    console.log(`New Payment Status: ${newPaymentStatus}`);

        if (!invoiceId || !newPaymentStatus) {
            console.error('Invoice ID and new payment status are required.');
            return;
        }

        fetch(`/api/invoices/${invoiceId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ payment_status: newPaymentStatus })
        })
        .then(handleResponse)
        .then(data => {
            invoicePaymentStatus.textContent = data.payment_status;
            alert('Payment status updated successfully!');
        })
        .catch(handleError);
    }

    function handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }

    function displayInvoice(data) {
        invoiceDetails.style.display = 'block';
        invoiceDateIssued.textContent = data.date_issued;
        const invoiceIdInput = document.getElementById('invoiceIdInput');
        invoiceIdInput.value = data.id;
        const medicationNames = data.medications_prescribed.map(med => med.name).join(", ");
        invoiceMedications.textContent = medicationNames;
        invoiceAmount.textContent = data.amount;
        invoicePaymentStatus.textContent = data.payment_status;
    }

    function handleError(error) {
        console.error("Error:", error);
        alert('Failed to update payment status. Please try again.');
    }

    function resetModal() {
    // Reset the patient name input
    patientNameInput.value = '';

    // Hide the invoice details
    invoiceDetails.style.display = 'none';

    // Reset invoice details fields
    invoiceDateIssued.textContent = '';
    const invoiceIdInput = document.getElementById('invoiceIdInput');
    invoiceIdInput.value = '';
    invoiceMedications.textContent = '';
    invoiceAmount.textContent = '';
    invoicePaymentStatus.textContent = '';
    document.getElementById('updatePaymentStatusDropdown').value = 'Unpaid';
}


    // ===================
    // EVENT LISTENERS
    // ===================
    generateInvoiceBtn.addEventListener('click', generateInvoice);
    console.log("Attaching event listener for updatePaymentStatusBtn");
    updatePaymentStatusBtn.addEventListener('click', updatePaymentStatus);
    $('#invoiceModal').on('hidden.bs.modal', resetModal);



}); // Close the DOMContentLoaded callback
