async function fetchTodoLists(msalInstance) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.Read'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch('https://graph.microsoft.com/v1.0/me/todo/lists', {
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`
        }
    });
    
    const data = await response.json();
    return data;
}

async function fetchTodoItems(msalInstance, listId) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.Read'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`
        }
    });
    
    const data = await response.json();
    return data;
}