// Todo App: state, rendering, interaction, localStorage, theme
const STORAGE_KEY = 'todo-app-tasks-v1';
const THEME_KEY = 'todo-app-theme';

let todos = [];
let currentFilter = 'all'; // all | active | completed

const $todoList = document.getElementById('todo-list');
const $todoForm = document.getElementById('todo-form');
const $todoInput = document.getElementById('new-todo');
const $filters = document.querySelectorAll('.filter-btn');
const $themeToggle = document.getElementById('theme-toggle');
const $themeIcon = document.getElementById('theme-icon');
const body = document.body;

function loadTodos() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        todos = data ? JSON.parse(data) : [];
    } catch {
        todos = [];
    }
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
    $todoList.innerHTML = '';
    let filteredTodos = todos.filter(t =>
        currentFilter === 'all' ? true : currentFilter === 'active' ? !t.completed : t.completed
    );
    if (filteredTodos.length === 0) {
        $todoList.innerHTML = `<li style="text-align:center;color:var(--color-completed);">No tasks (${currentFilter})</li>`;
        return;
    }
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.dataset.id = todo.id;

        // Custom checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'custom-checkbox';
        checkbox.checked = !!todo.completed;
        checkbox.setAttribute('aria-label', `Mark '${todo.title}' as completed`);
        checkbox.tabIndex = 0;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // Editable todo text
        const span = document.createElement('span');
        span.className = 'todo-title';
        span.textContent = todo.title;
        span.tabIndex = 0;
        span.setAttribute('role', 'textbox');
        span.setAttribute('aria-label', `Task: ${todo.title}. Double-click to edit.`);
        span.addEventListener('dblclick', () => enableEdit(span, todo));

        // Action buttons
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.setAttribute('aria-label', 'Edit task');
        editBtn.title = 'Edit';
        editBtn.innerHTML = '✎';
        editBtn.addEventListener('click', () => enableEdit(span, todo));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.title = 'Delete';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        $todoList.appendChild(li);
    });
}

function addTodo(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    todos.push({
        id: Date.now(),
        title: trimmed,
        completed: false
    });
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function editTodo(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, title: trimmed } : todo
    );
    saveTodos();
    renderTodos();
}

function enableEdit(span, todo) {
    if (span.isContentEditable) return;
    span.contentEditable = 'true';
    span.focus();
    span.classList.add('editing');
    // Move caret to end
    document.execCommand('selectAll', false, null);
    document.getSelection().collapseToEnd();
    // Save on blur or Enter
    function finishEdit(e) {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
        e.preventDefault();
        span.contentEditable = 'false';
        span.classList.remove('editing');
        editTodo(todo.id, span.textContent);
        span.removeEventListener('blur', finishEdit);
        span.removeEventListener('keydown', finishEdit);
    }
    span.addEventListener('blur', finishEdit);
    span.addEventListener('keydown', finishEdit);
}

// Theme toggle logic
function loadTheme() {
    let t = localStorage.getItem(THEME_KEY); 
    if (t === null) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(t);
}
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $themeIcon.textContent = theme === 'dark' ? '🌞' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadTodos();
    renderTodos();

    // Add Todo
    $todoForm.addEventListener('submit', e => {
        e.preventDefault();
        addTodo($todoInput.value);
        $todoInput.value = '';
        $todoInput.focus();
    });

    // Filters
    $filters.forEach(btn => {
        btn.addEventListener('click', () => {
            $filters.forEach(b => (b.classList.remove('active'), b.setAttribute('aria-pressed', 'false')));
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Theme toggle
    $themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(theme);
    });
});
