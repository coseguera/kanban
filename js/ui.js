function setupUI(msalInstance) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backBtn');
    const newListBtn = document.getElementById('newListBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const newTaskTitle = document.getElementById('newTaskTitle');
    const responseElement = document.getElementById('response');
    const todoListsElement = document.getElementById('todoLists');
    const todoItemsElement = document.getElementById('todoItems');
    const notStartedItems = document.getElementById('notStartedItems');
    const inProgressItems = document.getElementById('inProgressItems');
    const completedItems = document.getElementById('completedItems');
    const listModal = document.getElementById('listModal');
    const listForm = document.getElementById('listForm');
    const listNameInput = document.getElementById('listNameInput');
    const listModalTitle = document.getElementById('listModalTitle');
    const saveListBtn = document.getElementById('saveListBtn');
    const deleteListBtn = document.getElementById('deleteList');

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
                
                // Create content with list name
                const listText = document.createElement('span');
                listText.textContent = list.displayName;
                listText.style.flex = '1';
                listText.style.cursor = 'pointer';
                
                // Create icons container
                const iconsContainer = document.createElement('div');
                iconsContainer.style.display = 'flex';
                iconsContainer.style.alignItems = 'center';
                
                // Create edit icon
                const editIcon = document.createElement('span');
                editIcon.className = 'edit-icon';
                editIcon.textContent = '⋯';
                editIcon.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent list click event
                    showListModal('edit', list);
                });
                
                iconsContainer.appendChild(editIcon);
                
                listItem.appendChild(listText);
                listItem.appendChild(iconsContainer);
                
                listItem.style.cursor = 'pointer';
                listItem.style.justifyContent = 'space-between';
                
                // Add click event to the text area only (not the icon)
                listText.addEventListener('click', () => loadTodoItems(list.id, list.displayName));
                
                todoListsElement.appendChild(listItem);
            });
            responseElement.textContent = '';
        } else {
            todoListsElement.innerHTML = '<li class="empty-state">No todo lists found. Create one in Microsoft To Do to get started!</li>';
        }
    }

    function renderTodoItems(data, listName) {
        notStartedItems.innerHTML = '';
        inProgressItems.innerHTML = '';
        completedItems.innerHTML = '';
        
        if (data.value && data.value.length > 0) {
            data.value.forEach(item => {
                const listItem = document.createElement('li');
                
                // Create content with importance star
                const itemText = document.createElement('span');
                itemText.textContent = item.title;
                
                // Create icons container
                const iconsContainer = document.createElement('div');
                iconsContainer.style.display = 'flex';
                iconsContainer.style.alignItems = 'center';
                
                // Create edit icon
                const editIcon = document.createElement('span');
                editIcon.className = 'edit-icon';
                editIcon.textContent = '⋯';
                editIcon.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent drag events
                    showEditPopup(item);
                });
                
                const importanceStar = document.createElement('span');
                importanceStar.className = 'importance-star';
                
                if (item.importance === 'high') {
                    importanceStar.textContent = '★'; // Bold/filled star
                    importanceStar.classList.add('high');
                } else {
                    importanceStar.textContent = '☆'; // Empty star
                    importanceStar.classList.add('normal');
                }
                
                // Add click event listener to toggle importance
                importanceStar.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent drag events
                    await toggleImportance(item.id, item.importance);
                });
                
                iconsContainer.appendChild(editIcon);
                iconsContainer.appendChild(importanceStar);
                
                listItem.appendChild(itemText);
                listItem.appendChild(iconsContainer);
                
                listItem.draggable = true;
                listItem.dataset.taskId = item.id;
                listItem.dataset.currentStatus = item.status;
                
                // Add drag event listeners
                listItem.addEventListener('dragstart', handleDragStart);
                listItem.addEventListener('dragend', handleDragEnd);
                
                switch(item.status) {
                    case 'notStarted':
                        notStartedItems.appendChild(listItem);
                        break;
                    case 'inProgress':
                        inProgressItems.appendChild(listItem);
                        break;
                    case 'completed':
                        completedItems.appendChild(listItem);
                        break;
                    default:
                        // Handle other statuses like 'waitingOnOthers', 'deferred'
                        notStartedItems.appendChild(listItem);
                        break;
                }
            });
        } else {
            notStartedItems.innerHTML = '<li>No items in this list</li>';
        }
        
        // Show empty message if no items in a category
        if (notStartedItems.children.length === 0) {
            notStartedItems.innerHTML = '<li>No items</li>';
        }
        if (inProgressItems.children.length === 0) {
            inProgressItems.innerHTML = '<li>No items</li>';
        }
        if (completedItems.children.length === 0) {
            completedItems.innerHTML = '<li>No items</li>';
        }
        
        document.querySelector('h1').textContent = `Items in: ${listName}`;
        showTodoItems();
    }

    let draggedElement = null;
    let currentListId = null;

    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    function handleDragEnd(e) {
        e.target.style.opacity = '1';
        draggedElement = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (draggedElement) {
            const targetColumn = e.currentTarget;
            const taskId = draggedElement.dataset.taskId;
            const currentStatus = draggedElement.dataset.currentStatus;
            
            let newStatus;
            if (targetColumn === notStartedItems) {
                newStatus = 'notStarted';
            } else if (targetColumn === inProgressItems) {
                newStatus = 'inProgress';
            } else if (targetColumn === completedItems) {
                newStatus = 'completed';
            }
            
            if (newStatus && newStatus !== currentStatus) {
                updateTaskStatus(taskId, newStatus);
            }
        }
    }

    async function updateTaskStatus(taskId, newStatus) {
        try {
            responseElement.textContent = 'Updating task...';
            await updateTodoItem(msalInstance, currentListId, taskId, { status: newStatus });
            
            // Refresh the items to show the updated status
            const data = await fetchTodoItems(msalInstance, currentListId);
            const listName = document.querySelector('h1').textContent.replace('Items in: ', '');
            renderTodoItems(data, listName);
            responseElement.textContent = '';
        } catch (error) {
            responseElement.textContent = `Error updating task: ${error.message}`;
        }
    }

    async function toggleImportance(taskId, currentImportance) {
        try {
            const newImportance = currentImportance === 'high' ? 'normal' : 'high';
            await updateTodoItem(msalInstance, currentListId, taskId, { importance: newImportance });
            
            // Refresh the items to show the updated importance
            const data = await fetchTodoItems(msalInstance, currentListId);
            const listName = document.querySelector('h1').textContent.replace('Items in: ', '');
            renderTodoItems(data, listName);
        } catch (error) {
            responseElement.textContent = `Error updating importance: ${error.message}`;
        }
    }

    function showEditPopup(item) {
        const modal = document.getElementById('editModal');
        const form = document.getElementById('editTaskForm');
        
        // Populate form with current values
        document.getElementById('editTitle').value = item.title;
        
        // Set status toggle
        const statusButtons = document.querySelectorAll('#editStatus .toggle-btn');
        statusButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === item.status) {
                btn.classList.add('active');
            }
        });
        
        // Set importance toggle
        const importanceButtons = document.querySelectorAll('#editImportance .toggle-btn');
        importanceButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === (item.importance || 'normal')) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('editBody').value = item.body?.content || '';
        
        // Store item data for submission
        form.dataset.taskId = item.id;
        
        // Load checklist items
        loadChecklistItems(item.id);
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup event listeners (only once)
        if (!form.hasEventListener) {
            form.hasEventListener = true;
            
            // Close modal events
            document.getElementById('cancelEdit').addEventListener('click', hideEditPopup);
            document.querySelector('.close-btn').addEventListener('click', hideEditPopup);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideEditPopup();
            });
            
            // Delete button event
            document.getElementById('deleteTask').addEventListener('click', handleDeleteTask);
            
            // Toggle button events
            setupToggleButtons();
            
            // Checklist events
            setupChecklistEvents();
            
            // Form submission
            form.addEventListener('submit', handleEditSubmit);
        }
    }

    function setupToggleButtons() {
        // Status toggle buttons
        document.querySelectorAll('#editStatus .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#editStatus .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Importance toggle buttons
        document.querySelectorAll('#editImportance .toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#editImportance .toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    function setupChecklistEvents() {
        // Add checklist item
        document.getElementById('addChecklistItem').addEventListener('click', handleAddChecklistItem);
        
        // Allow Enter key to add item
        document.getElementById('newChecklistItem').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddChecklistItem();
            }
        });
    }

    async function loadChecklistItems(taskId) {
        try {
            const data = await fetchChecklistItems(msalInstance, currentListId, taskId);
            renderChecklistItems(data.value || []);
        } catch (error) {
            console.error('Error loading checklist items:', error);
            renderChecklistItems([]);
        }
    }

    function renderChecklistItems(items) {
        const checklistContainer = document.getElementById('checklistItems');
        checklistContainer.innerHTML = '';
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'checklist-item';
            li.dataset.itemId = item.id;
            
            li.innerHTML = `
                <input type="checkbox" ${item.isChecked ? 'checked' : ''}>
                <span class="item-text ${item.isChecked ? 'completed' : ''}">${item.displayName}</span>
                <span class="delete-item">×</span>
            `;
            
            // Checkbox event
            li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
                handleChecklistItemToggle(item.id, e.target.checked);
            });
            
            // Delete event
            li.querySelector('.delete-item').addEventListener('click', () => {
                handleDeleteChecklistItem(item.id);
            });
            
            checklistContainer.appendChild(li);
        });
    }

    async function handleAddChecklistItem() {
        const input = document.getElementById('newChecklistItem');
        const displayName = input.value.trim();
        
        if (!displayName) return;
        
        try {
            const taskId = document.getElementById('editTaskForm').dataset.taskId;
            await createChecklistItem(msalInstance, currentListId, taskId, displayName);
            input.value = '';
            loadChecklistItems(taskId);
        } catch (error) {
            responseElement.textContent = `Error adding checklist item: ${error.message}`;
        }
    }

    async function handleChecklistItemToggle(checklistItemId, isChecked) {
        try {
            const taskId = document.getElementById('editTaskForm').dataset.taskId;
            await updateChecklistItem(msalInstance, currentListId, taskId, checklistItemId, { isChecked });
            loadChecklistItems(taskId);
        } catch (error) {
            responseElement.textContent = `Error updating checklist item: ${error.message}`;
        }
    }

    async function handleDeleteChecklistItem(checklistItemId) {
        try {
            const taskId = document.getElementById('editTaskForm').dataset.taskId;
            await deleteChecklistItem(msalInstance, currentListId, taskId, checklistItemId);
            loadChecklistItems(taskId);
        } catch (error) {
            responseElement.textContent = `Error deleting checklist item: ${error.message}`;
        }
    }

    function hideEditPopup() {
        document.getElementById('editModal').style.display = 'none';
        // Reset delete button text
        document.getElementById('deleteTask').textContent = 'Delete Task';
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const taskId = form.dataset.taskId;
        
        // Get form values
        const titleValue = document.getElementById('editTitle').value.trim();
        const selectedStatus = document.querySelector('#editStatus .toggle-btn.active')?.dataset.value;
        const selectedImportance = document.querySelector('#editImportance .toggle-btn.active')?.dataset.value;
        const bodyContent = document.getElementById('editBody').value.trim();
        
        // Validate required fields
        if (!titleValue) {
            responseElement.textContent = 'Error: Title is required';
            return;
        }
        
        if (!selectedStatus) {
            responseElement.textContent = 'Error: Please select a status';
            return;
        }
        
        if (!selectedImportance) {
            responseElement.textContent = 'Error: Please select an importance level';
            return;
        }
        
        // Build updates object
        const updates = {
            title: titleValue,
            status: selectedStatus,
            importance: selectedImportance
        };
        
        if (bodyContent) {
            updates.body = bodyContent;
        }
        
        try {
            responseElement.textContent = 'Updating task...';
            await updateTodoItem(msalInstance, currentListId, taskId, updates);
            
            // Refresh the items to show the updated task
            const data = await fetchTodoItems(msalInstance, currentListId);
            const listName = document.querySelector('h1').textContent.replace('Items in: ', '');
            renderTodoItems(data, listName);
            
            responseElement.textContent = '';
            hideEditPopup();
        } catch (error) {
            responseElement.textContent = `Error updating task: ${error.message}`;
        }
    }

    async function handleDeleteTask() {
        const form = document.getElementById('editTaskForm');
        const taskId = form.dataset.taskId;
        const deleteBtn = document.getElementById('deleteTask');
        
        // Check if this is the confirmation click
        if (deleteBtn.textContent === 'Confirm Delete') {
            try {
                responseElement.textContent = 'Deleting task...';
                await deleteTodoItem(msalInstance, currentListId, taskId);
                
                // Refresh the items to show the updated list
                const data = await fetchTodoItems(msalInstance, currentListId);
                const listName = document.querySelector('h1').textContent.replace('Items in: ', '');
                renderTodoItems(data, listName);
                
                responseElement.textContent = '';
                hideEditPopup();
                
                // Reset button text for next time
                deleteBtn.textContent = 'Delete Task';
            } catch (error) {
                responseElement.textContent = `Error deleting task: ${error.message}`;
                // Reset button text on error
                deleteBtn.textContent = 'Delete Task';
            }
        } else {
            // First click - change button text to confirm
            deleteBtn.textContent = 'Confirm Delete';
        }
    }

    function setupDropZones() {
        [notStartedItems, inProgressItems, completedItems].forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
    }

    function updateUI() {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            loginBtn.style.display = 'none';
            newListBtn.style.display = 'inline-block';
            logoutBtn.disabled = false;
            loadTodoLists();
        } else {
            loginBtn.style.display = 'inline-block';
            loginBtn.disabled = false;
            newListBtn.style.display = 'none';
            logoutBtn.disabled = true;
            todoListsElement.innerHTML = '';
            notStartedItems.innerHTML = '';
            inProgressItems.innerHTML = '';
            completedItems.innerHTML = '';
            responseElement.textContent = '';
            showTodoLists();
        }
    }

    loginBtn.addEventListener('click', async () => {
        try {
            responseElement.textContent = 'Redirecting to login...';
            await msalInstance.loginRedirect(loginRequest);
            // Note: Code after loginRedirect won't execute as the page will redirect
        } catch (error) {
            console.error('Login error:', error);
            responseElement.textContent = `Login error: ${error.message}`;
        }
    });

    logoutBtn.addEventListener('click', () => {
        msalInstance.logoutRedirect();
    });

    async function createNewTask() {
        const title = newTaskTitle.value.trim();
        if (!title) {
            responseElement.textContent = 'Please enter a task title';
            return;
        }

        try {
            responseElement.textContent = 'Creating task...';
            await createTodoItem(msalInstance, currentListId, title);
            
            // Clear the input
            newTaskTitle.value = '';
            
            // Refresh the items to show the new task
            const data = await fetchTodoItems(msalInstance, currentListId);
            const listName = document.querySelector('h1').textContent.replace('Items in: ', '');
            renderTodoItems(data, listName);
            responseElement.textContent = '';
        } catch (error) {
            responseElement.textContent = `Error creating task: ${error.message}`;
        }
    }

    function showListModal(mode, list = null) {
        listModal.style.display = 'flex';
        listNameInput.value = '';
        responseElement.textContent = '';
        
        if (mode === 'create') {
            listModalTitle.textContent = '📝 Create New List';
            saveListBtn.textContent = 'Create List';
            deleteListBtn.style.display = 'none';
            listForm.removeAttribute('data-list-id');
        } else if (mode === 'edit' && list) {
            listModalTitle.textContent = '✏️ Edit List';
            saveListBtn.textContent = 'Save Changes';
            deleteListBtn.style.display = 'inline-block';
            listNameInput.value = list.displayName;
            listForm.dataset.listId = list.id;
        }
        
        listNameInput.focus();
    }

    function hideListModal() {
        listModal.style.display = 'none';
        listNameInput.value = '';
        responseElement.textContent = '';
        listForm.removeAttribute('data-list-id');
        // Reset delete button text
        deleteListBtn.textContent = 'Delete List';
    }

    async function saveList() {
        const listName = listNameInput.value.trim();
        const listId = listForm.dataset.listId;
        const isEdit = !!listId;
        
        if (!listName) {
            responseElement.textContent = 'Please enter a list name';
            listNameInput.focus();
            return;
        }

        // Validate list name length
        if (listName.length > 100) {
            responseElement.textContent = 'List name must be 100 characters or less';
            listNameInput.focus();
            return;
        }

        try {
            responseElement.textContent = isEdit ? 'Updating list...' : 'Creating list...';
            saveListBtn.disabled = true;
            listNameInput.disabled = true;
            
            if (isEdit) {
                await updateTodoList(msalInstance, listId, listName);
            } else {
                await createTodoList(msalInstance, listName);
            }
            
            // Close modal and refresh lists
            hideListModal();
            await loadTodoLists();
            responseElement.textContent = isEdit ? 'List updated successfully!' : 'List created successfully!';
            
            // Clear success message after 2 seconds
            setTimeout(() => {
                if (responseElement.textContent.includes('successfully!')) {
                    responseElement.textContent = '';
                }
            }, 2000);
        } catch (error) {
            responseElement.textContent = `Error ${isEdit ? 'updating' : 'creating'} list: ${error.message}`;
        } finally {
            saveListBtn.disabled = false;
            listNameInput.disabled = false;
        }
    }

    async function deleteListHandler() {
        const listId = listForm.dataset.listId;
        
        if (!listId) return;
        
        // Check if this is the confirmation click
        if (deleteListBtn.textContent === 'Confirm Delete') {
            try {
                responseElement.textContent = 'Deleting list...';
                await deleteTodoList(msalInstance, listId);
                
                // Close modal and refresh lists
                hideListModal();
                await loadTodoLists();
                responseElement.textContent = 'List deleted successfully!';
                
                // Clear success message after 2 seconds
                setTimeout(() => {
                    if (responseElement.textContent === 'List deleted successfully!') {
                        responseElement.textContent = '';
                    }
                }, 2000);
                
                // Reset button text for next time
                deleteListBtn.textContent = 'Delete List';
            } catch (error) {
                responseElement.textContent = `Error deleting list: ${error.message}`;
                // Reset button text on error
                deleteListBtn.textContent = 'Delete List';
            }
        } else {
            // First click - change button text to confirm
            deleteListBtn.textContent = 'Confirm Delete';
        }
    }

    // Event listeners
    backBtn.addEventListener('click', () => {
        document.querySelector('h1').textContent = 'Kanban Board';
        showTodoLists();
        responseElement.textContent = '';
    });

    newListBtn.addEventListener('click', () => showListModal('create'));

    // List modal event listeners
    listForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveList();
    });

    document.getElementById('cancelList').addEventListener('click', hideListModal);
    document.getElementById('closeListModal').addEventListener('click', hideListModal);
    deleteListBtn.addEventListener('click', deleteListHandler);

    // Close modal when clicking outside
    listModal.addEventListener('click', (e) => {
        if (e.target === listModal) {
            hideListModal();
        }
    });

    // Enter key support for list name input
    listNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveList();
        }
    });

    addTaskBtn.addEventListener('click', createNewTask);
    
    newTaskTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createNewTask();
        }
    });

    async function loadTodoItems(listId, listName) {
        try {
            currentListId = listId;
            responseElement.textContent = 'Loading items...';
            const data = await fetchTodoItems(msalInstance, listId);
            renderTodoItems(data, listName);
            responseElement.textContent = '';
        } catch (error) {
            responseElement.textContent = `Error: ${error.message}`;
        }
    }

    // Setup drop zones
    setupDropZones();

    return { updateUI };
}