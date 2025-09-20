document.addEventListener('DOMContentLoaded', function() {
    // All scripts should be loaded by now
    initializeAuth().then((authResult) => {
        const ui = setupUI(authResult.msalInstance);
        ui.updateUI();
    });
});