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
        console.log('showPage called for page:', pageNumber);
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

        // Initialize vehicle damage functionality when page 6 is loaded
        if (pageNumber === 6) {
            console.log('Initializing vehicle damage functionality');
            initializeVehicleDamage();
        }
    }

    function clearErrors() {
        const currentPage = document.querySelector('.form-page.active');
        if (currentPage) {
            const errorMessages = currentPage.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
            
            const errorFields = currentPage.querySelectorAll('.error');
            errorFields.forEach(field => field.classList.remove('error'));
        }
    }

    function validateCurrentPage(showErrors = false) {
        console.log('validateCurrentPage called, showErrors:', showErrors);
        const currentPage = document.querySelector('.form-page.active');
        if (!currentPage) {
            console.log('No active page found');
            return true;
        }
        
        const pageNumber = parseInt(currentPage.dataset.page);
        console.log('Validating page:', pageNumber);
        
        // Clear previous errors if we're showing new ones
        if (showErrors) {
            clearErrors();
        }
        
        let isValid = true;
        let firstErrorField = null;
        
        // Get all required fields on the current page only
        const requiredFields = currentPage.querySelectorAll('[required]');
        console.log('Found required fields:', requiredFields.length);
        
        requiredFields.forEach(field => {
            // Skip validation for hidden fields
            if (field.closest('[style*="display: none"]') || field.closest('.hidden')) {
                console.log('Skipping hidden field:', field.id);
                return;
            }
            
            // Skip validation for fields in hidden sections
            const parentSection = field.closest('div[id$="Info"]');
            if (parentSection && (parentSection.style.display === 'none' || parentSection.classList.contains('hidden'))) {
                console.log('Skipping field in hidden section:', field.id);
                return;
            }
            
            // Skip validation for fields on other pages
            const fieldPage = field.closest('.form-page');
            if (fieldPage && fieldPage !== currentPage) {
                console.log('Skipping field on other page:', field.id);
                return;
            }
            
            // Check if the field is valid
            let isFieldValid = true;
            
            if (field.type === 'checkbox') {
                isFieldValid = field.checked;
            } else {
                isFieldValid = field.value.trim() !== '';
                
                // Additional validation for specific field types
                if (isFieldValid) {
                    switch(field.type) {
                        case 'email':
                            isFieldValid = isValidEmail(field.value);
                            break;
                        case 'tel':
                            isFieldValid = field.value.replace(/\D/g, '').length >= 10;
                            break;
                        case 'select-one':
                            isFieldValid = field.value !== '';
                            break;
                    }
                }
            }
            
            if (!isFieldValid) {
                console.log('Field validation failed:', field.id);
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
                
                // Only show errors if showErrors is true
                if (showErrors) {
                    console.log('Adding error to field:', field.id);
                    // Add error class
                    field.classList.add('error');
                    
                    // Create and add error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = getErrorMessage(field);
                    field.parentNode.appendChild(errorMessage);
                }
            }
        });

        console.log('Page validation result:', isValid);
        return isValid;
    }

    // Add event listeners for checkboxes to update validation on change
    document.querySelectorAll('input[type="checkbox"][required]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('Checkbox changed:', this.id);
            validateCurrentPage(false);
        });
    });

    // Add validation when clicking next button
    nextButton.addEventListener('click', function(e) {
        console.log('Next button clicked');
        e.preventDefault(); // Always prevent default to handle navigation ourselves
        
        // Validate the current page
        if (validateCurrentPage(true)) {
            // Only navigate if validation passes
            currentPage++;
            showPage(currentPage);
        }
    });

    // Add event listener for previous button
    prevButton.addEventListener('click', function(e) {
        console.log('Previous button clicked');
        e.preventDefault();
        currentPage--;
        showPage(currentPage);
    });

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

    // Add this new function to handle vehicle damage initialization
    function initializeVehicleDamage() {
        console.log('Initializing vehicle damage handling...');

        const vehicleImage = document.getElementById('vehicleImage');
        const damageMarkersInput = document.getElementById('damageMarkersInput');
        const damageTypeModal = document.getElementById('damageTypeModal');
        const damageTypeGrid = document.getElementById('damageTypeGrid');
        const severityOptions = document.getElementById('severityOptions');
        const damageDescription = document.getElementById('damageTypeDescription');
        const confirmDamageBtn = document.querySelector('.confirm-btn');
        const cancelDamageBtn = document.querySelector('.cancel-btn');
        const damageList = document.getElementById('damageList');
        const closeModalBtn = document.querySelector('.close-modal');

        // Debug logging for element selection
        console.log('Selected elements:', {
            vehicleImage,
            damageMarkersInput,
            damageTypeModal,
            damageTypeGrid,
            severityOptions,
            damageDescription,
            confirmDamageBtn,
            cancelDamageBtn,
            damageList,
            closeModalBtn
        });

        if (!vehicleImage || !damageTypeModal) {
            console.error('Required elements not found for vehicle damage functionality');
            return;
        }

        let damageMarkers = [];
        let currentClickPosition = null;

        // Handle vehicle image click
        vehicleImage.addEventListener('click', (e) => {
            console.log('Vehicle image clicked');
            const rect = vehicleImage.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            currentClickPosition = { x, y };
            console.log('Click position:', currentClickPosition);
            console.log('Modal element:', damageTypeModal);
            
            if (damageTypeModal) {
                console.log('Setting modal display to block');
                damageTypeModal.style.display = 'block';
            } else {
                console.error('Modal element not found!');
            }
        });

        // Handle damage type selection
        const damageTypeButtons = document.querySelectorAll('.damage-type-btn');
        damageTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Damage type button clicked:', button.dataset.type);
                damageTypeButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                updateConfirmButton();
            });
        });

        // Handle severity selection
        const severityButtons = document.querySelectorAll('.severity-btn');
        severityButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Severity button clicked:', button.dataset.severity);
                severityButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                updateConfirmButton();
            });
        });

        // Update confirm button state
        function updateConfirmButton() {
            console.log('Updating confirm button state');
            const hasType = document.querySelector('.damage-type-btn.selected');
            const hasSeverity = document.querySelector('.severity-btn.selected');
            console.log('Has type:', !!hasType, 'Has severity:', !!hasSeverity);
            if (confirmDamageBtn) {
                confirmDamageBtn.disabled = !(hasType && hasSeverity);
                console.log('Confirm button disabled:', confirmDamageBtn.disabled);
            } else {
                console.error('Confirm button not found!');
            }
        }

        // Handle confirm button click
        if (confirmDamageBtn) {
            confirmDamageBtn.addEventListener('click', () => {
                console.log('Confirm button clicked');
                const type = document.querySelector('.damage-type-btn.selected')?.dataset.type;
                const severity = document.querySelector('.severity-btn.selected')?.dataset.severity;
                const description = damageDescription?.value.trim();
                
                console.log('Selected values:', { type, severity, description });
                
                if (type && severity) {
                    const marker = {
                        coordinates: currentClickPosition,
                        type,
                        severity,
                        description,
                        timestamp: new Date().toISOString()
                    };
                    
                    damageMarkers.push(marker);
                    updateDamageMarkers();
                    updateDamageList();
                    closeModal();
                } else {
                    console.error('Missing required selections:', { type, severity });
                }
            });
        }

        // Handle cancel button click
        if (cancelDamageBtn) {
            cancelDamageBtn.addEventListener('click', closeModal);
        }

        // Handle close modal button click
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        // Close modal and reset form
        function closeModal() {
            console.log('Closing modal');
            if (damageTypeModal) {
                damageTypeModal.style.display = 'none';
                document.querySelectorAll('.damage-type-btn').forEach(btn => btn.classList.remove('selected'));
                document.querySelectorAll('.severity-btn').forEach(btn => btn.classList.remove('selected'));
                if (damageDescription) {
                    damageDescription.value = '';
                }
                currentClickPosition = null;
                updateConfirmButton();
            } else {
                console.error('Modal element not found when trying to close!');
            }
        }

        // Update damage markers on image
        function updateDamageMarkers() {
            console.log('Updating damage markers');
            // Remove existing markers
            document.querySelectorAll('.damage-marker').forEach(marker => marker.remove());
            
            // Add new markers
            damageMarkers.forEach(marker => {
                const markerElement = document.createElement('div');
                markerElement.className = 'damage-marker';
                markerElement.style.left = `${marker.coordinates.x}%`;
                markerElement.style.top = `${marker.coordinates.y}%`;
                markerElement.dataset.type = marker.type;
                markerElement.dataset.severity = marker.severity;
                
                // Add click handler to remove marker
                markerElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = damageMarkers.findIndex(m => 
                        m.coordinates.x === marker.coordinates.x && 
                        m.coordinates.y === marker.coordinates.y
                    );
                    if (index !== -1) {
                        damageMarkers.splice(index, 1);
                        updateDamageMarkers();
                        updateDamageList();
                    }
                });
                
                vehicleImage.parentElement.appendChild(markerElement);
            });
            
            // Update hidden input
            if (damageMarkersInput) {
                damageMarkersInput.value = JSON.stringify(damageMarkers);
            }
        }

        // Update damage list
        function updateDamageList() {
            console.log('Updating damage list');
            if (damageList) {
                damageList.innerHTML = '';
                
                damageMarkers.forEach((marker, index) => {
                    const item = document.createElement('div');
                    item.className = 'damage-item';
                    item.innerHTML = `
                        <div class="damage-item-info">
                            <span class="damage-item-type">${marker.type}</span>
                            <span class="damage-item-severity ${marker.severity}">${marker.severity}</span>
                            ${marker.description ? `<p>${marker.description}</p>` : ''}
                        </div>
                        <button class="remove-damage" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    damageList.appendChild(item);
                });

                // Add event delegation for remove buttons
                damageList.addEventListener('click', (e) => {
                    const removeButton = e.target.closest('.remove-damage');
                    if (removeButton) {
                        const index = parseInt(removeButton.dataset.index);
                        removeDamage(index);
                    }
                });
            }
        }

        // Remove damage marker
        function removeDamage(index) {
            console.log('Removing damage marker at index:', index);
            damageMarkers.splice(index, 1);
            updateDamageMarkers();
            updateDamageList();
        }

        // Load existing damage markers if any
        if (damageMarkersInput && damageMarkersInput.value) {
            try {
                damageMarkers = JSON.parse(damageMarkersInput.value);
                updateDamageMarkers();
                updateDamageList();
            } catch (e) {
                console.error('Error parsing damage markers:', e);
            }
        }
    }
}); 