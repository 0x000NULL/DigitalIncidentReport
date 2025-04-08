document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    const modals = {
        terms: {
            modal: document.getElementById('termsModal'),
            checkbox: document.getElementById('termsAgreement'),
            links: document.querySelectorAll('[data-modal="termsModal"]')
        },
        privacy: {
            modal: document.getElementById('privacyModal'),
            checkbox: document.getElementById('privacyAgreement'),
            links: document.querySelectorAll('[data-modal="privacyModal"]')
        },
        esignature: {
            modal: document.getElementById('esignatureModal'),
            checkbox: document.getElementById('esignatureAgreement'),
            links: document.querySelectorAll('[data-modal="esignatureModal"]')
        }
    };

    // Function to open a modal
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Function to close a modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Function to handle modal acceptance
    function handleAccept(modal, checkbox) {
        if (checkbox) {
            checkbox.checked = true;
        }
        closeModal(modal);
    }

    // Set up event listeners for each modal
    Object.values(modals).forEach(({ modal, checkbox, links }) => {
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-modal');
        const acceptBtn = modal.querySelector('.accept-terms-btn');

        // Open modal when clicking links
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(modal);
            });
        });

        // Close modal when clicking the close button
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
        });

        // Accept terms button functionality
        acceptBtn.addEventListener('click', function() {
            handleAccept(modal, checkbox);
        });
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(e) {
        Object.values(modals).forEach(({ modal }) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            Object.values(modals).forEach(({ modal }) => {
                if (modal.style.display === 'block') {
                    closeModal(modal);
                }
            });
        }
    });
}); 