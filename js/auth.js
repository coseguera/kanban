function initializeAuth() {
    const msalInstance = new msal.PublicClientApplication(msalConfig);

    // Handle redirect after login and return a promise
    const handleRedirect = msalInstance.handleRedirectPromise().then((response) => {
        // If we received a response from the redirect, the user just logged in
        if (response) {
            console.log('Login successful after redirect:', response);
        }
        
        return {
            msalInstance,
            hasResponse: !!response,
            isAuthenticated: msalInstance.getAllAccounts().length > 0,
            response: response
        };
    }).catch((error) => {
        console.error('Error handling redirect:', error);
        return {
            msalInstance,
            hasResponse: false,
            isAuthenticated: false,
            error: error
        };
    });

    return handleRedirect;
}