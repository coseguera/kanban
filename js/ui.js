function setupUI(msalInstance) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backBtn');
    const responseElement = document.getElementById('response');
    const todoListsElement = document.getElementById('todoLists');
    const todoItemsElement = document.getElementById('todoItems');

    async function loadTodoLists() {
        try {
            responseElement.textContent = 'Loading...';
            todoListsElement.innerHTML = '';
            const data = await fetchTodoLists(msalInstance);
            renderTodoLists(data);
            showTodoLists();
        } catch (error) {
            responseElement.textContent = `Error: ${error.message}`;
            todoListsElement.innerHTML = '';
        }
    }

    function showTodoLists() {
        todoListsElement.style.display = 'block';
        todoItemsElement.style.display = 'none';
        backBtn.style.display = 'none';
    }

    function showTodoItems() {
        todoListsElement.style.display = 'none';
        todoItemsElement.style.display = 'block';
        backBtn.style.display = 'inline-block';
    }

    function renderTodoLists(data) {
        todoListsElement.innerHTML = '';
        
        if (data.value && data.value.length > 0) {
            data.value.forEach(list => {
                const listItem = document.createElement('li');
                listItem.textContent = list.displayName;
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', () => loadTodoItems(list.id, list.displayName));
                todoListsElement.appendChild(listItem);
            });
            responseElement.textContent = '';
        } else {
            todoListsElement.innerHTML = '<li>No todo lists found</li>';
        }
    }

    function renderTodoItems(data, listName) {
        todoItemsElement.innerHTML = '';
        
        if (data.value && data.value.length > 0) {
            data.value.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item.title;
                todoItemsElement.appendChild(listItem);
            });
        } else {
            todoItemsElement.innerHTML = '<li>No items in this list</li>';
        }
        
        document.querySelector('h1').textContent = `Items in: ${listName}`;
        showTodoItems();
    }

    async function loadTodoItems(listId, listName) {
        try {
            responseElement.textContent = 'Loading items...';
            const data = await fetchTodoItems(msalInstance, listId);
            renderTodoItems(data, listName);
            responseElement.textContent = '';
        } catch (error) {
            responseElement.textContent = `Error: ${error.message}`;
        }
    }

    function updateUI() {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            loginBtn.disabled = true;
            logoutBtn.disabled = false;
            loadTodoLists();
        } else {
            loginBtn.disabled = false;
            logoutBtn.disabled = true;
            todoListsElement.innerHTML = '';
            todoItemsElement.innerHTML = '';
            responseElement.textContent = '';
            showTodoLists();
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

    backBtn.addEventListener('click', () => {
        document.querySelector('h1').textContent = 'Todo Lists';
        showTodoLists();
        responseElement.textContent = '';
    });

    return { updateUI };
}