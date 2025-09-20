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

async function createTodoItem(msalInstance, listId, title) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.ReadWrite'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            status: 'notStarted'
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

async function updateTodoItem(msalInstance, listId, taskId, updates) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.ReadWrite'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    // Build the update object from the provided updates
    const updateBody = {};
    
    if (updates.title !== undefined) {
        updateBody.title = updates.title;
    }
    
    if (updates.status !== undefined) {
        updateBody.status = updates.status;
    }
    
    if (updates.importance !== undefined) {
        updateBody.importance = updates.importance;
    }
    
    if (updates.body !== undefined) {
        updateBody.body = {
            content: updates.body,
            contentType: 'text'
        };
    }
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateBody)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

async function deleteTodoItem(msalInstance, listId, taskId) {
    const accounts = msalInstance.getAllAccounts();
    const tokenRequest = {
        scopes: ['Tasks.ReadWrite'],
        account: accounts[0]
    };

    const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${listId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${tokenResponse.accessToken}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // DELETE returns 204 No Content on success
    return true;
}