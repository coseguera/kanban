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

async function updateTodoItem(msalInstance, listId, taskId, newStatus) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.ReadWrite'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: newStatus
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}