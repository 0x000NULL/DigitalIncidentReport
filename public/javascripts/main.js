document.addEventListener('DOMContentLoaded', function() {
    // Add any necessary JavaScript functionality here
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Add navigation logic here
            window.location.href = '/report';
        });
    }
}); 