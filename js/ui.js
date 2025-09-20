function setupUI(msalInstance) {
    const loginBtn = document.getElementById('loginBtn');
    const fetchBtn = document.getElementById('fetchBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const responseElement = document.getElementById('response');

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
            const data = await fetchTodoLists(msalInstance);
            responseElement.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            responseElement.textContent = `Error: ${error.message}`;
        }
    });

    return { updateUI };
}