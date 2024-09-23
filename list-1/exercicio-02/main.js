// main.js

// Selecionando Elementos do DOM
const taskForm = document.getElementById('task-form'); // Seleciona o formulário de tarefas pelo ID
const taskInput = document.getElementById('task-input'); // Seleciona o campo de entrada de tarefas pelo ID
const filterInput = document.getElementById('filter-input'); // Seleciona o campo de filtro de tarefas pelo ID
const tasksList = document.getElementById('tasks'); // Seleciona a lista de tarefas pelo ID
const themeToggleBtn = document.getElementById('theme-toggle'); // Seleciona o botão de alternância de tema pelo ID

// Inicialização das Tarefas
let tasks = []; // Inicializa um array vazio para armazenar as tarefas

// Dados Fictícios (caso o localStorage esteja vazio)
const defaultTasks = [
    { id: Date.now() + 1, name: 'Estudar JavaScript', completed: false }, // Tarefa 1
    { id: Date.now() + 2, name: 'Fazer exercícios de programação', completed: true }, // Tarefa 2
    { id: Date.now() + 3, name: 'Revisar conceitos de HTML e CSS', completed: false }, // Tarefa 3
];

/**
 * Loads tasks from local storage. If tasks are found in local storage, they are parsed and assigned to the `tasks` variable.
 * If no tasks are found, the `tasks` variable is set to `defaultTasks` and the tasks are saved to local storage.
 */
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks'); // Obtém as tarefas armazenadas no localStorage
    if (storedTasks) {
        tasks = JSON.parse(storedTasks); // Se houver tarefas armazenadas, carrega-as
    } else {
        tasks = defaultTasks; // Caso contrário, usa os dados fictícios
        saveTasks(); // Salva os dados fictícios no localStorage
    }
}

/**
 * Saves the current list of tasks to the local storage.
 * Converts the tasks array to a JSON string and stores it under the key 'tasks'.
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Converte o array de tarefas para JSON e salva no localStorage
}

/**
 * Renders the list of tasks, optionally filtered by a search string.
 *
 * @param {string} [filter=''] - The search string to filter tasks by name.
 */
function renderTasks(filter = '') {
    tasksList.innerHTML = ''; // Limpa a lista de tarefas

    // Filtrar Tarefas
    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(filter.toLowerCase()) // Filtra as tarefas com base no texto do filtro
    );

    // Renderizar Cada Tarefa
    filteredTasks.forEach(task => {
        const li = document.createElement('li'); // Cria um elemento de lista
        li.classList.toggle('completed', task.completed); // Adiciona a classe 'completed' se a tarefa estiver concluída
        li.setAttribute('data-id', task.id); // Define um atributo de dados com o ID da tarefa

        const checkbox = document.createElement('input'); // Cria um elemento de entrada (checkbox)
        checkbox.type = 'checkbox'; // Define o tipo como checkbox
        checkbox.checked = task.completed; // Define o estado do checkbox com base na conclusão da tarefa
        checkbox.setAttribute('aria-label', `Marcar ${task.name} como concluída`); // Define um rótulo acessível
        checkbox.addEventListener('change', toggleTaskCompletion); // Adiciona um ouvinte de evento para alternar a conclusão da tarefa

        const span = document.createElement('span'); // Cria um elemento de span
        span.classList.add('task-name'); // Adiciona a classe 'task-name'
        span.textContent = task.name; // Define o texto do span como o nome da tarefa

        const actionsDiv = document.createElement('div'); // Cria um elemento de div para ações
        actionsDiv.classList.add('actions'); // Adiciona a classe 'actions'

        const deleteBtn = document.createElement('button'); // Cria um botão para deletar a tarefa
        deleteBtn.innerHTML = '🗑️'; // Define o conteúdo do botão
        deleteBtn.setAttribute('aria-label', `Remover ${task.name}`); // Define um rótulo acessível
        deleteBtn.addEventListener('click', removeTask); // Adiciona um ouvinte de evento para remover a tarefa

        actionsDiv.appendChild(deleteBtn); // Adiciona o botão de deletar à div de ações

        li.appendChild(checkbox); // Adiciona o checkbox ao elemento de lista
        li.appendChild(span); // Adiciona o span ao elemento de lista
        li.appendChild(actionsDiv); // Adiciona a div de ações ao elemento de lista

        tasksList.appendChild(li); // Adiciona o elemento de lista à lista de tarefas
    });
}

/**
 * Adds a new task to the task list.
 *
 * @param {Event} e - The event object from the form submission.
 * @returns {void}
 */
function addTask(e) {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    const taskName = taskInput.value.trim(); // Obtém o valor do campo de entrada e remove espaços em branco
    if (taskName === '') return; // Se o nome da tarefa estiver vazio, sai da função

    const newTask = {
        id: Date.now(), // Define um ID único para a nova tarefa
        name: taskName, // Define o nome da nova tarefa
        completed: false, // Define o estado de conclusão como falso
    };

    tasks.push(newTask); // Adiciona a nova tarefa ao array de tarefas
    saveTasks(); // Salva as tarefas no localStorage
    renderTasks(filterInput.value); // Renderiza as tarefas com base no filtro atual
    taskForm.reset(); // Reseta o formulário
}

/**
 * Removes a task from the task list based on the event target.
 *
 * @param {Event} e - The event object triggered by the user action.
 */
function removeTask(e) {
    const taskId = e.target.closest('li').getAttribute('data-id'); // Obtém o ID da tarefa a ser removida
    tasks = tasks.filter(task => task.id != taskId); // Filtra as tarefas para remover a tarefa com o ID correspondente
    saveTasks(); // Salva as tarefas no localStorage
    renderTasks(filterInput.value); // Renderiza as tarefas com base no filtro atual
}

/**
 * Toggles the completion status of a task.
 *
 * @param {Event} e - The event object from the checkbox click.
 */
function toggleTaskCompletion(e) {
    const taskId = e.target.closest('li').getAttribute('data-id'); // Obtém o ID da tarefa a ser alternada
    tasks = tasks.map(task =>
        task.id == taskId ? { ...task, completed: e.target.checked } : task // Alterna o estado de conclusão da tarefa
    );
    saveTasks(); // Salva as tarefas no localStorage
    renderTasks(filterInput.value); // Renderiza as tarefas com base no filtro atual
}

/**
 * Filters tasks based on the input event's target value and renders the filtered tasks.
 *
 * @param {Event} e - The input event that triggers the filter.
 */
function filterTasks(e) {
    const filterText = e.target.value; // Obtém o texto do filtro
    renderTasks(filterText); // Renderiza as tarefas com base no texto do filtro
}

/**
 * Toggles the theme of the webpage between light and dark modes.
 * Updates the button text to reflect the current theme.
 * Saves the current theme preference to localStorage.
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme'); // Alterna a classe 'dark-theme' no corpo do documento
    const isDark = document.body.classList.contains('dark-theme'); // Verifica se o tema escuro está ativo
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙'; // Altera o texto do botão de alternância de tema
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); // Salva o tema atual no localStorage
}

/**
 * Loads the theme from local storage and applies it to the document body.
 * If the stored theme is 'dark', it adds the 'dark-theme' class to the body
 * and sets the theme toggle button text to '☀️'. Otherwise, it sets the 
 * theme toggle button text to '🌙'.
 */
function loadTheme() {
    const storedTheme = localStorage.getItem('theme'); // Obtém o tema armazenado no localStorage
    if (storedTheme === 'dark') {
        document.body.classList.add('dark-theme'); // Adiciona a classe 'dark-theme' se o tema armazenado for escuro
        themeToggleBtn.textContent = '☀️'; // Define o texto do botão de alternância de tema para sol
    } else {
        themeToggleBtn.textContent = '🌙'; // Define o texto do botão de alternância de tema para lua
    }
}

// Event Listeners
taskForm.addEventListener('submit', addTask); // Adiciona um ouvinte de evento para submeter o formulário de tarefas
filterInput.addEventListener('input', filterTasks); // Adiciona um ouvinte de evento para filtrar as tarefas
themeToggleBtn.addEventListener('click', toggleTheme); // Adiciona um ouvinte de evento para alternar o tema

// Inicialização
loadTasks(); // Carrega as tarefas do localStorage ou usa os dados fictícios
renderTasks(); // Renderiza as tarefas na lista
loadTheme(); // Carrega o tema do localStorage