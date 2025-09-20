function setupUI(msalInstance) {
    const loginBtn = document.getElementById('loginBtn');
    const fetchBtn = document.getElementById('fetchBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const responseElement = document.getElementById('response');
    const todoListsElement = document.getElementById('todoLists');

    function renderTodoLists(data) {
        todoListsElement.innerHTML = '';
        
        if (data.value && data.value.length > 0) {
            data.value.forEach(list => {
                const listItem = document.createElement('li');
                listItem.textContent = list.displayName;
                todoListsElement.appendChild(listItem);
            });
            responseElement.textContent = '';
        } else {
            todoListsElement.innerHTML = '<li>No todo lists found</li>';
        }
    }

    function updateUI() {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            loginBtn.disabled = true;
            fetchBtn.disabled = false;
            logoutBtn.disabled = false;
        } else {
            loginBtn.disabled = false;
            fetchBtn.disabled = true;
            logoutBtn.disabled = true;
        }
    }

    loginBtn.addEventListener('click', async () => {
        try {
            responseElement.textContent = 'Redirecting to login...';
            await msalInstance.loginPopup(loginRequest);
            updateUI();
            responseElement.textContent = 'Login successful!';
        } catch (error) {
            console.error('Login error:', error);
            responseElement.textContent = `Login error: ${error.message}`;
        }
    });

    logoutBtn.addEventListener('click', () => {
        msalInstance.logoutRedirect();
    });

    fetchBtn.addEventListener('click', async () => {
        try {
            responseElement.textContent = 'Loading...';
            todoListsElement.innerHTML = '';
            const data = await fetchTodoLists(msalInstance);
            renderTodoLists(data);
        } catch (error) {
            responseElement.textContent = `Error: ${error.message}`;
            todoListsElement.innerHTML = '';
        }
    });

    return { updateUI };
}