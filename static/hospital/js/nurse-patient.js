document.addEventListener("DOMContentLoaded", function() {
    // Selectors for buttons
    const viewDetailsButtons = document.querySelectorAll(".view-details-button");

    // Add event listeners to all "view details" buttons
    viewDetailsButtons.forEach(button => {
        button.addEventListener("click", function() {
            const patientId = this.getAttribute("data-patient-id");
            console.log('Fetching data for patientId:', patientId); // ADDED for debugging
            fetchPatientDetails(patientId);
            fetchPatientNotes(patientId);
            fetchPatientPrescription(patientId);
        });
    });

    function fetchPatientDetails(patientId) {
        fetch(`/api/patients/${patientId}/`)
            .then(response => response.json())
            .then(data => {
                console.log('Received patient data:', data);
                displayPatientDetails(data);
            })
            .catch(error => {
                console.error("Error fetching patient details:", error);
            });
    }

    function fetchPatientPrescription(patientId) {
        console.log(`Inside fetchPatientPrescription for patientId: ${patientId}`);
        fetch(`/api/prescriptions/?patient=${patientId}`)
            .then(response => {
                console.log('Response from prescriptions API:', response); // ADDED for debugging
                return response.json();
            })
            .then(data => {
                console.log('Received prescription data:', data);
                if (data && data.length > 0) {
                    const latestPrescription = data[data.length - 1];
                    displayPatientPrescription(latestPrescription);
                } else {
                    console.log('No prescriptions found for this patient.');
                }
            })
            .catch(error => {
                console.error("Error fetching patient prescriptions:", error);
            });
    }

    function fetchPatientNotes(patientId) {
        fetch(`/api/patient-notes/`)
            .then(response => response.json())
            .then(data => {
                console.log("All notes:", data);
                const numericPatientId = Number(patientId);
                console.log("Searching for notes for patientId:", numericPatientId);

                const patientNote = data.find(note => note.patient === numericPatientId);

                if (patientNote) {
                    displayPatientNotes(patientNote);
                } else {
                    console.log("No notes found for this patient.");
                }
            })
            .catch(error => {
                console.error("Error fetching patient notes:", error);
            });
    }

    function displayPatientDetails(data) {
        const nameElem = document.getElementById("detailPatientName");
        console.log('PatientName element:', nameElem);
        const dobElem = document.getElementById("patientDob");
        const genderElem = document.getElementById("patientGender");
        const addressElem = document.getElementById("patientAddress");
        const phoneElem = document.getElementById("patientPhone");
        const emailElem = document.getElementById("patientEmail");
        const historyElem = document.getElementById("patientMedicalHistory");
        const insuranceElem = document.getElementById("patientInsurance");

        if (nameElem) {
            nameElem.textContent = data.first_name + " " + data.last_name;
            console.log('Set name in element:', nameElem.textContent);
        }
        if (dobElem) dobElem.textContent = data.date_of_birth;
        if (genderElem) genderElem.textContent = data.gender;
        if (addressElem) addressElem.textContent = data.address;
        if (phoneElem) phoneElem.textContent = data.phone_number;
        if (emailElem) emailElem.textContent = data.email;
        if (historyElem) historyElem.textContent = data.medical_history;
        if (insuranceElem) insuranceElem.textContent = data.insurance_information;
    }

    function displayPatientPrescription(prescription) {
        const medicationElem = document.getElementById("prescriptionMedication");
        const dosageElem = document.getElementById("prescriptionDosage");
        const instructionsElem = document.getElementById("prescriptionInstructions");

        if (medicationElem) medicationElem.textContent = prescription.medication;
        if (dosageElem) dosageElem.textContent = prescription.dosage;
        if (instructionsElem) instructionsElem.textContent = prescription.instructions;
    }

    function displayPatientNotes(note) {
        const contentElem = document.getElementById("noteContent");
        const doctorElem = document.getElementById("noteDoctor");
        const dateElem = document.getElementById("noteDate");

        const dateObject = new Date(note.date_created);
        const formattedDate = dateObject.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        if (contentElem) contentElem.textContent = note.content;
        if (doctorElem) doctorElem.textContent = note.doctor;
        if (dateElem) dateElem.textContent = formattedDate;
    }
});
