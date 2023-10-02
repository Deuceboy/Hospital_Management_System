document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function(e) {
        e.preventDefault();
        logoutUser();
    });
});

function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function logoutUser() {
    fetch('/api/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Server response was not ok.');
        }
    })
    .then(data => {
        if (data.status === 'success') {
            window.location.href = '/api/login/';
        } else {
            console.error('Unexpected server response:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

// Assuming your logout button has an ID of 'logoutButton'
document.getElementById('logoutButton').addEventListener('click', logoutUser);

