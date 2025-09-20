const msalConfig = {
    auth: {
        clientId: '8b1cd1bb-5380-4314-a831-c9981a240464',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
    }
};

const loginRequest = {
    scopes: ['User.Read']
};