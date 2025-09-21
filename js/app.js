document.addEventListener('DOMContentLoaded', function() {
    // All scripts should be loaded by now
    initializeAuth().then((authResult) => {
        const ui = setupUI(authResult.msalInstance);
        
        // Check if user just returned from authentication redirect
        if (authResult.hasResponse && authResult.response) {
            console.log('User authenticated successfully via redirect');
            // Show success message briefly
            const responseElement = document.getElementById('response');
            if (responseElement) {
                responseElement.textContent = 'Login successful!';
                setTimeout(() => {
                    responseElement.textContent = '';
                }, 3000);
            }
        } else if (authResult.error) {
            console.error('Authentication error:', authResult.error);
            const responseElement = document.getElementById('response');
            if (responseElement) {
                responseElement.textContent = `Authentication error: ${authResult.error.message}`;
            }
        }
        
        ui.updateUI();
    }).catch((error) => {
        console.error('Failed to initialize authentication:', error);
        const responseElement = document.getElementById('response');
        if (responseElement) {
            responseElement.textContent = `Failed to initialize: ${error.message}`;
        }
    });
});