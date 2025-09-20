const msalConfig = {
    auth: {
        clientId: '',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
    }
};

const loginRequest = {
    scopes: ['Tasks.ReadWrite']
};