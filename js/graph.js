async function fetchUserData(msalInstance) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['User.Read'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`
        }
    });
    
    const data = await response.json();
    return data;
}