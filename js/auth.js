function initializeAuth() {
    const msalInstance = new msal.PublicClientApplication(msalConfig);

    // Handle redirect after login and return a promise
    const handleRedirect = msalInstance.handleRedirectPromise().then((response) => {
        return {
            msalInstance,
            hasResponse: !!response,
            isAuthenticated: msalInstance.getAllAccounts().length > 0
        };
    });

    return handleRedirect;
}