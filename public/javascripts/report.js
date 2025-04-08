// Vehicle Damage Handling
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

let damageMarkers = [];
let currentClickPosition = null;

// Initialize damage type buttons
const damageTypes = [
    { type: 'dent', icon: 'fa-dent', label: 'Dent' },
    { type: 'scratch', icon: 'fa-scratch', label: 'Scratch' },
    { type: 'crack', icon: 'fa-crack', label: 'Crack' },
    { type: 'break', icon: 'fa-break', label: 'Break' },
    { type: 'scuff', icon: 'fa-scuff', label: 'Scuff' },
    { type: 'other', icon: 'fa-other', label: 'Other' }
];

damageTypes.forEach(damageType => {
    const button = document.createElement('button');
    button.className = 'damage-type-btn';
    button.innerHTML = `
        <i class="fas ${damageType.icon}"></i>
        <span>${damageType.label}</span>
    `;
    button.dataset.type = damageType.type;
    button.addEventListener('click', () => selectDamageType(damageType.type));
    damageTypeGrid.appendChild(button);
});

// Initialize severity buttons
const severities = ['minor', 'moderate', 'severe'];
severities.forEach(severity => {
    const button = document.createElement('button');
    button.className = 'severity-btn';
    button.textContent = severity.charAt(0).toUpperCase() + severity.slice(1);
    button.dataset.severity = severity;
    button.addEventListener('click', () => selectSeverity(severity));
    severityOptions.appendChild(button);
});

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
function selectDamageType(type) {
    console.log('Selecting damage type:', type);
    document.querySelectorAll('.damage-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        console.log('Selected button:', selectedBtn);
    } else {
        console.error('Button not found for type:', type);
    }
    updateConfirmButton();
}

// Handle severity selection
function selectSeverity(severity) {
    console.log('Selecting severity:', severity);
    document.querySelectorAll('.severity-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`[data-severity="${severity}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        console.log('Selected severity button:', selectedBtn);
    } else {
        console.error('Severity button not found:', severity);
    }
    updateConfirmButton();
}

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
} else {
    console.error('Confirm button not found!');
}

// Handle cancel button click
if (cancelDamageBtn) {
    cancelDamageBtn.addEventListener('click', closeModal);
} else {
    console.error('Cancel button not found!');
}

// Handle close modal button click
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
} else {
    console.error('Close modal button not found!');
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
    damageMarkersInput.value = JSON.stringify(damageMarkers);
}

// Update damage list
function updateDamageList() {
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
            <button class="remove-damage" onclick="removeDamage(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        damageList.appendChild(item);
    });
}

// Remove damage marker
function removeDamage(index) {
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