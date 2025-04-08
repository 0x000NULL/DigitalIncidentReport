document.addEventListener('DOMContentLoaded', function() {
    const vehicleImage = document.getElementById('vehicleImage');
    const damageMarkers = document.getElementById('damageMarkers');
    const damageList = document.getElementById('damageList');
    const damageMarkerTemplate = document.getElementById('damageMarkerTemplate');
    const damageListItemTemplate = document.getElementById('damageListItemTemplate');

    let currentMarker = null;

    // Handle clicks on the vehicle image
    vehicleImage.addEventListener('click', function(e) {
        const rect = vehicleImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create new damage marker
        const marker = damageMarkerTemplate.content.cloneNode(true);
        const markerElement = marker.querySelector('.damage-marker');
        markerElement.style.left = `${(x / rect.width) * 100}%`;
        markerElement.style.top = `${(y / rect.height) * 100}%`;

        // Add marker to the container
        damageMarkers.appendChild(marker);

        // Show damage type selection
        const damageInfo = markerElement.querySelector('.damage-info');
        damageInfo.classList.add('active');

        // Position the damage info popup
        const infoRect = damageInfo.getBoundingClientRect();
        if (x + infoRect.width > rect.width) {
            damageInfo.style.left = 'auto';
            damageInfo.style.right = '0';
        } else {
            damageInfo.style.left = '0';
            damageInfo.style.right = 'auto';
        }

        if (y + infoRect.height > rect.height) {
            damageInfo.style.top = 'auto';
            damageInfo.style.bottom = '100%';
        } else {
            damageInfo.style.top = '100%';
            damageInfo.style.bottom = 'auto';
        }

        // Handle damage type selection
        const damageTypeSelect = markerElement.querySelector('.damage-type-select');
        damageTypeSelect.addEventListener('change', function() {
            if (this.value) {
                // Add to damage list
                const listItem = damageListItemTemplate.content.cloneNode(true);
                const listItemElement = listItem.querySelector('.damage-item');
                
                // Set location and type
                const locationX = Math.round(x / rect.width * 100);
                const locationY = Math.round(y / rect.height * 100);
                listItemElement.querySelector('.damage-location').textContent = 
                    `Location: ${getLocationDescription(locationX, locationY)}`;
                listItemElement.querySelector('.damage-type').textContent = 
                    `Type: ${this.options[this.selectedIndex].text}`;

                // Handle removal
                const removeButton = listItemElement.querySelector('.remove-damage');
                removeButton.addEventListener('click', function() {
                    listItemElement.remove();
                    markerElement.remove();
                });

                damageList.appendChild(listItem);
                damageInfo.classList.remove('active');
            }
        });

        // Close damage info when clicking outside
        document.addEventListener('click', function closeDamageInfo(e) {
            if (!markerElement.contains(e.target)) {
                damageInfo.classList.remove('active');
                document.removeEventListener('click', closeDamageInfo);
            }
        });
    });

    // Helper function to get location description
    function getLocationDescription(x, y) {
        if (x < 20) return 'Front Left';
        if (x > 80) return 'Front Right';
        if (y < 20) return 'Front';
        if (y > 80) return 'Rear';
        if (x < 40) return 'Left Side';
        if (x > 60) return 'Right Side';
        return 'Center';
    }
}); 