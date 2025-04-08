document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('incidentForm');
    const pages = document.querySelectorAll('.form-page');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');
    let currentPage = 1;
    const totalPages = pages.length;

    // Add error message elements to all required fields
    document.querySelectorAll('[required]').forEach(field => {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = getErrorMessage(field);
        field.parentNode.appendChild(errorMessage);
    });

    function getErrorMessage(field) {
        const fieldName = field.id.replace(/([A-Z])/g, ' $1').toLowerCase();
        switch(field.type) {
            case 'email':
                return `Please enter a valid email address`;
            case 'tel':
                return `Please enter a valid phone number`;
            case 'select-one':
                return `Please select an option`;
            default:
                return `Please enter your ${fieldName}`;
        }
    }

    // Phone number formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,10}'))[0];
                let formattedValue = '';
                if (value.length > 6) {
                    formattedValue = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
                } else if (value.length > 3) {
                    formattedValue = `(${value.substring(0, 3)}) ${value.substring(3)}`;
                } else {
                    formattedValue = value;
                }
                e.target.value = formattedValue;
            }
        });
    });

    // ZIP code validation
    const zipInput = document.getElementById('zip');
    if (zipInput) {
        zipInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0, 5);
            }
            e.target.value = value;
        });
    }

    // Show first page initially
    showPage(1);

    // Event listeners for navigation buttons
    prevButton.addEventListener('click', () => navigatePage(-1));
    nextButton.addEventListener('click', () => navigatePage(1));

    function showPage(pageNumber) {
        pages.forEach(page => {
            page.classList.remove('active');
            if (parseInt(page.dataset.page) === pageNumber) {
                page.classList.add('active');
            }
        });

        // Update progress bar
        const progress = document.querySelector('.progress');
        progress.style.width = `${(pageNumber / totalPages) * 100}%`;

        // Update navigation buttons
        prevButton.disabled = pageNumber === 1;
        nextButton.style.display = pageNumber === totalPages ? 'none' : 'block';
        submitButton.style.display = pageNumber === totalPages ? 'block' : 'none';

        if (pageNumber === 5) {
            const script = document.createElement('script');
            script.src = '/javascripts/vehicle-damage.js';
            document.body.appendChild(script);
        }
    }

    function navigatePage(direction) {
        const newPage = currentPage + direction;
        if (newPage >= 1 && newPage <= totalPages) {
            if (direction === 1) {
                // Validate current page before proceeding
                if (validateCurrentPage()) {
                    // Special handling for page 4
                    if (currentPage === 4) {
                        const knowsLocation = document.getElementById('knowsLocation');
                        if (knowsLocation && knowsLocation.value === 'no') {
                            currentPage = 7; // Skip to page 7 if location is unknown
                        } else {
                            currentPage = newPage;
                        }
                    } else {
                        currentPage = newPage;
                    }
                    showPage(currentPage);
                }
            } else {
                // When going backwards, we need to check if we're coming from page 7
                if (currentPage === 7) {
                    const knowsLocation = document.getElementById('knowsLocation');
                    if (knowsLocation && knowsLocation.value === 'no') {
                        currentPage = 4; // Go back to page 4 if location was unknown
                    } else {
                        currentPage = newPage;
                    }
                } else {
                    currentPage = newPage;
                }
                showPage(currentPage);
            }
        }
    }

    function validateCurrentPage() {
        const currentPage = document.querySelector('.form-page.active');
        const pageNumber = parseInt(currentPage.dataset.page);
        const nextButton = document.getElementById('nextButton');
        const submitButton = document.getElementById('submitButton');
        
        // Clear previous error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
        
        // Remove error classes
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
        
        let isValid = true;
        let firstErrorField = null;
        
        // Get all required fields on the current page
        const requiredFields = currentPage.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            // Skip validation for hidden fields
            if (field.closest('[style*="display: none"]')) {
                return;
            }
            
            if (!field.value.trim()) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
                
                // Add error class
                field.classList.add('error');
                
                // Create and add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = getErrorMessage(field);
                field.parentNode.appendChild(errorMessage);
            }
        });

        // Special handling for Page 5
        if (pageNumber === 5) {
            const knowsLocation = document.getElementById('knowsLocation');
            if (knowsLocation && knowsLocation.value === '') {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = knowsLocation;
                }
                knowsLocation.classList.add('error');
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please select whether you know the location of the incident';
                knowsLocation.parentNode.appendChild(errorMessage);
            }
        }

        // Scroll to first error if any
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }

        // Update button states
        if (pageNumber === 1) {
            nextButton.disabled = !isValid;
            submitButton.style.display = 'none';
        } else if (pageNumber === 9) { // Last page
            nextButton.style.display = 'none';
            submitButton.style.display = isValid ? 'block' : 'none';
        } else {
            nextButton.disabled = !isValid;
            submitButton.style.display = 'none';
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidZip(zip) {
        return /^\d{5}$/.test(zip);
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateCurrentPage()) {
            try {
                const formData = new FormData(form);
                const response = await fetch('/report/submit', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Report submitted successfully!');
                    window.location.href = '/'; // Redirect to home page
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                alert('Error submitting report. Please try again.');
                console.error('Submission error:', error);
            }
        }
    });

    // Handle operator information display
    const renterOperating = document.getElementById('renterOperating');
    const operatorInfo = document.getElementById('operatorInfo');
    const operatorFields = operatorInfo.querySelectorAll('input, select');

    if (renterOperating && operatorInfo) {
        renterOperating.addEventListener('change', function() {
            if (this.value === 'no') {
                operatorInfo.style.display = 'block';
                // Make all operator fields required
                operatorFields.forEach(field => {
                    field.required = true;
                });
            } else {
                operatorInfo.style.display = 'none';
                // Remove required attribute from operator fields
                operatorFields.forEach(field => {
                    field.required = false;
                    field.value = ''; // Clear values when hidden
                });
            }
        });
    }

    // Handle location information display
    const knowsLocation = document.getElementById('knowsLocation');
    const locationInfo = document.getElementById('locationInfo');

    if (knowsLocation && locationInfo) {
        knowsLocation.addEventListener('change', function() {
            if (this.value === 'yes') {
                locationInfo.style.display = 'block';
                // Make all location fields required
                const locationFields = locationInfo.querySelectorAll('input, select');
                locationFields.forEach(field => {
                    field.required = true;
                });
            } else {
                locationInfo.style.display = 'none';
                // Remove required attribute from all location fields
                const locationFields = locationInfo.querySelectorAll('input, select');
                locationFields.forEach(field => {
                    field.required = false;
                    field.value = ''; // Clear values when hidden
                });
            }
        });
    }

    // Handle other vehicle information display
    const otherVehicleInvolved = document.getElementById('otherVehicleInvolved');
    const otherVehicleInfo = document.getElementById('otherVehicleInfo');
    const ownerOperating = document.getElementById('ownerOperating');
    const otherOperatorInfo = document.getElementById('otherOperatorInfo');
    const otherVehicleFields = otherVehicleInfo ? otherVehicleInfo.querySelectorAll('input, select, textarea') : [];
    const otherOperatorFields = otherOperatorInfo ? otherOperatorInfo.querySelectorAll('input, select, textarea') : [];

    if (otherVehicleInvolved && otherVehicleInfo) {
        otherVehicleInvolved.addEventListener('change', function() {
            if (this.value === 'yes') {
                otherVehicleInfo.style.display = 'block';
                // Make all other vehicle fields required
                otherVehicleFields.forEach(field => {
                    field.required = true;
                });
            } else {
                otherVehicleInfo.style.display = 'none';
                // Remove required attribute from other vehicle fields
                otherVehicleFields.forEach(field => {
                    field.required = false;
                    field.value = ''; // Clear values when hidden
                });
            }
        });
    }

    if (ownerOperating && otherOperatorInfo) {
        ownerOperating.addEventListener('change', function() {
            if (this.value === 'no') {
                otherOperatorInfo.style.display = 'block';
                // Make all operator fields required
                otherOperatorFields.forEach(field => {
                    field.required = true;
                });
            } else {
                otherOperatorInfo.style.display = 'none';
                // Remove required attribute from operator fields
                otherOperatorFields.forEach(field => {
                    field.required = false;
                    field.value = ''; // Clear values when hidden
                });
            }
        });
    }

    // Handle witness information display
    const hasWitnesses = document.getElementById('hasWitnesses');
    const witnessInfo = document.getElementById('witnessInfo');
    const witnessCount = document.getElementById('witnessCount');
    const witnessesContainer = document.getElementById('witnessesContainer');
    const witnessTemplate = document.getElementById('witnessTemplate');

    if (hasWitnesses && witnessInfo) {
        hasWitnesses.addEventListener('change', function() {
            if (this.value === 'yes') {
                witnessInfo.style.display = 'block';
                witnessCount.required = true;
            } else {
                witnessInfo.style.display = 'none';
                witnessCount.required = false;
                witnessCount.value = '';
                witnessesContainer.innerHTML = '';
            }
        });
    }

    if (witnessCount && witnessesContainer) {
        witnessCount.addEventListener('change', function() {
            const count = parseInt(this.value);
            if (count > 0 && count <= 10) {
                witnessesContainer.innerHTML = '';
                for (let i = 1; i <= count; i++) {
                    const witness = witnessTemplate.content.cloneNode(true);
                    const witnessSection = witness.querySelector('.witness-section');
                    
                    // Update witness number
                    witnessSection.querySelector('.witness-number').textContent = i;
                    
                    // Update input IDs and names to be unique
                    const inputs = witnessSection.querySelectorAll('input, select');
                    inputs.forEach(input => {
                        const originalId = input.id;
                        const originalName = input.name;
                        input.id = `${originalId}_${i}`;
                        input.name = originalName.replace('[]', `_${i}`);
                    });
                    
                    witnessesContainer.appendChild(witness);
                }
            }
        });
    }

    // Signature Pad functionality
    const signaturePad = document.getElementById('signaturePad');
    const clearSignature = document.getElementById('clearSignature');
    const signatureData = document.getElementById('signatureData');
    const accuracyConfirmation = document.getElementById('accuracyConfirmation');

    if (signaturePad) {
        // Initialize signature pad
        const canvas = signaturePad;
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set up drawing style
        ctx.strokeStyle = '#000000'; // Explicitly set to black
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff'; // Ensure white background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Drawing functions
        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
        }

        function draw(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();

            lastX = x;
            lastY = y;
            updateSignatureData();
        }

        function stopDrawing() {
            isDrawing = false;
            updateSignatureData();
        }

        function clearCanvas() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000000';
            signatureData.value = '';
        }

        function updateSignatureData() {
            signatureData.value = canvas.toDataURL();
        }

        // Event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });

        // Clear signature button
        clearSignature.addEventListener('click', clearCanvas);

        // Set current date as default for signature date
        const signatureDate = document.getElementById('signatureDate');
        if (signatureDate) {
            const today = new Date().toISOString().split('T')[0];
            signatureDate.value = today;
        }
    }
}); 