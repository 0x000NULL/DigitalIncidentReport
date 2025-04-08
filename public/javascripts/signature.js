document.addEventListener('DOMContentLoaded', function() {
    const signatureInput = document.getElementById('signatureInput');
    const signatureData = document.getElementById('signatureData');

    if (signatureInput) {
        // Update signature data when the input changes
        signatureInput.addEventListener('input', function() {
            // Create a canvas to convert the text to an image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 400;
            canvas.height = 100;
            
            // Clear canvas and set white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set text style
            ctx.font = 'italic 40px "Brush Script MT", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            
            // Draw text
            ctx.fillText(signatureInput.value, canvas.width/2, canvas.height/2);
            
            // Convert to data URL and store in hidden input
            signatureData.value = canvas.toDataURL();
        });
    }
}); 