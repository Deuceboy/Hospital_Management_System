// Function to fetch CSRF Token
function getCSRFToken() {
    const cookies = document.cookie.split(";");
    for(let cookie of cookies) {
        let [name, value] = cookie.split('=').map(c => c.trim());
        if (name === 'csrftoken') {
            return value;
        }
    }
}


// Function to display messages
function displayNoteMessage(message, success=true) {
    const messageBox = document.querySelector('#messageBox');
    if (!messageBox) {
        console.error('Unable to find the message box element (#messageBox).');
        return;
    }
    messageBox.textContent = message;
    messageBox.style.color = success ? 'green' : 'red';
    setTimeout(() => {
        messageBox.textContent = '';
    }, 3000);
}

// When the 'Add Note' button is clicked, populate the hidden input with the patient's ID.
document.querySelectorAll('.add-note-btn').forEach(button => {
    button.addEventListener('click', function() {
        const patientId = button.getAttribute('data-patient-id');
        document.querySelector('#patientNoteId').value = patientId;
    });
});

// Event Listener for the modal's 'Add Note' button.
document.querySelector('#submitNote').addEventListener('click', function(event) {
    const patientId = document.querySelector('#patientNoteId').value;


    event.stopPropagation();

    const noteContent = document.querySelector('#noteContent').value;
    const csrfToken = getCSRFToken();

    fetch(`/api/patient-notes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            patient: patientId,
            content: noteContent
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        displayNoteMessage('Note added successfully!');
        document.querySelector('#noteContent').value = ''; // Clear the textarea after successful addition
    })
    .catch(error => {
        console.error('Error:', error);
        displayNoteMessage(`Error: ${error.message}`, false);
    });
});
