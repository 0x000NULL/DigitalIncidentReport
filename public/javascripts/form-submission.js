// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('incidentForm');
    let isSubmitting = false; // Add submission lock
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent double submission
            if (isSubmitting) {
                console.log('Form is already being submitted');
                return;
            }
            
            // Validate all required fields
            if (!validateForm()) {
                return;
            }
            
            // Set submission lock
            isSubmitting = true;
            
            // Disable submit button
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }
            
            try {
                // Collect form data
                const formData = new FormData(form);
                
                // Convert FormData to object
                const data = {};
                formData.forEach((value, key) => {
                    // Handle arrays (like trafficControls)
                    if (key.endsWith('[]')) {
                        const baseKey = key.slice(0, -2);
                        if (!data[baseKey]) {
                            data[baseKey] = [];
                        }
                        data[baseKey].push(value);
                    } else {
                        data[key] = value;
                    }
                });
                
                // Handle special cases
                data.termsAgreement = formData.get('termsAgreement') === 'on';
                data.privacyAgreement = formData.get('privacyAgreement') === 'on';
                data.esignatureAgreement = formData.get('esignatureAgreement') === 'on';
                data.accuracyConfirmation = formData.get('accuracyConfirmation') === 'on';
                
                // Parse numbers
                if (data.odometer) {
                    data.odometer = parseInt(data.odometer);
                    if (isNaN(data.odometer)) {
                        alert('Please enter a valid odometer reading');
                        return;
                    }
                }
                
                // Handle damage markers
                if (window.damageMarkers && Array.isArray(window.damageMarkers)) {
                    // Ensure each marker has the correct structure
                    data.damageMarkers = JSON.stringify(window.damageMarkers.map(marker => ({
                        coordinates: {
                            x: marker.coordinates.x,
                            y: marker.coordinates.y
                        },
                        type: marker.type,
                        description: marker.description || '',
                        severity: marker.severity || 'moderate'
                    })));
                } else {
                    data.damageMarkers = '[]';
                }
                
                // Handle signature
                const signatureInput = document.getElementById('signatureData');
                if (signatureInput) {
                    data.signatureData = signatureInput.value;
                }
                
                console.log('Submitting form data:', data);
                
                const response = await fetch('/report/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                console.log('Response status:', response.status);
                const result = await response.json();
                console.log('Response data:', result);
                
                if (result.success) {
                    alert('Report submitted successfully!');
                    window.location.href = '/report/confirmation/' + result.reportId;
                } else {
                    // Display the specific error message from the server
                    let errorMessage = 'Error submitting report';
                    if (result.message) {
                        errorMessage += ': ' + result.message;
                    }
                    if (result.errors && Array.isArray(result.errors)) {
                        errorMessage += '\n\nDetails:\n' + result.errors.join('\n');
                    }
                    console.error('Submission error:', errorMessage);
                    alert(errorMessage);
                }
            } catch (error) {
                console.error('Error:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                alert('An error occurred while submitting the report. Please try again.');
            } finally {
                // Reset submission lock and button state
                isSubmitting = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Report';
                }
            }
        });
    }
});

// Form validation
function validateForm() {
    const requiredFields = [
        'firstName', 'lastName', 'address', 'city', 'state', 'zip',
        'homePhone', 'email', 'ownsVehicle', 'insuranceCompany', 'policyNumber',
        'vehicleNumber', 'licensePlate', 'licenseState', 'vehicleMake', 'vehicleModel',
        'odometer', 'renterOperating', 'vehicleUse', 'creditCardCoverage', 'description',
        'knowsLocation', 'otherVehicleInvolved', 'directionOfTravel', 'trafficControlStatus',
        'accidentDescription', 'roadConditions', 'lightingConditions'
    ];
    
    for (const field of requiredFields) {
        const element = document.getElementById(field);
        if (element && !element.value.trim()) {
            alert(`Please fill in the ${field} field`);
            element.focus();
            return false;
        }
    }
    
    // Validate agreements
    if (!document.getElementById('termsAgreement').checked ||
        !document.getElementById('privacyAgreement').checked ||
        !document.getElementById('esignatureAgreement').checked) {
        alert('Please accept all agreements');
        return false;
    }
    
    // Validate signature
    const signatureData = document.getElementById('signatureData');
    if (!signatureData || !signatureData.value.trim()) {
        alert('Please provide your signature');
        return false;
    }
    
    // Validate accuracy confirmation
    if (!document.getElementById('accuracyConfirmation').checked) {
        alert('Please confirm the accuracy of your report');
        return false;
    }
    
    return true;
} 