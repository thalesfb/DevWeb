const content = document.getElementById('content');
const themeButton = document.getElementById('toggle-theme');

/**
 * Loads a new page by updating the browser's history state and rendering the specified page.
 *
 * @param {string} page - The identifier of the page to load.
 */
function loadPage(page) {
    history.pushState({ page }, '', `#${page}`);
    renderPage(page);
}

/**
 * Renders the specified page content into the `content` element.
 *
 * @param {string} page - The name of the page to render. Valid values are 'home', 'sobre', and 'contato'.
 */
function renderPage(page) {
    switch (page) {
        case 'home':
            content.innerHTML = `
        <section>
          <h2>Home</h2>
          <img src="sua-foto.jpg" alt="Sua foto" />
          <p>Nome: Thales</p>
          <p>Curso: Ciência da Computação</p>
          <p>Semestre: 6º</p>
          <p>E-mail: <a href="mailto:thales_fb2014@hotmail.com">thales_fb2014@hotmail.com</a></p>
          <p><a href="https://www.linkedin.com/in/thalesfb96/" target="_blank">LinkedIn</a></p>
          <p><a href="https://github.com/thalesfb/" target="_blank">GitHub</a></p>
        </section>
      `;
            break;
        case 'sobre':
            content.innerHTML = `
        <section>
          <h2>Sobre</h2>
          <p>Apaixonado por computação e matemática, tenho me dedicado ao contínuo aprimoramento das minhas habilidades técnicas e de negócios.</p>
        </section>
      `;
            break;
        case 'contato':
            content.innerHTML = `
        <section>
          <h2>Contato</h2>
          <form id="contact-form">
            <label for="nome">Nome:</label>
            <input type="text" id="nome" name="nome" required />
            <label for="email">E-mail:</label>
            <input type="email" id="email" name="email" required />
            <label for="assunto">Assunto:</label>
            <input type="text" id="assunto" name="assunto" required />
            <label for="mensagem">Mensagem:</label>
            <textarea id="mensagem" name="mensagem" required></textarea>
            <button type="submit">Enviar</button>
          </form>
        </section>
      `;
            // Adicionar evento de submissão do formulário
            const contactForm = document.getElementById('contact-form');
            contactForm.addEventListener('submit', handleFormSubmit);
            break;
        default:
            renderPage('home');
            break;
    }
}

/**
 * Event listener to handle the navigation links.
 * 
 * @event click
 * @callback
 * @param {Event} event - The event object representing the click.
 * @returns {void}
 * @listens nav a#click
 */
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = event.target.getAttribute('data-link');
        loadPage(page);
    });
});

/**
 * Handles the form submission event.
 *
 * @param {Event} event - The event object representing the form submission.
 * @returns {void}
 */
function handleFormSubmit(event) {
    event.preventDefault();
    // Validação adicional se necessário
    alert('Mensagem enviada com sucesso!');
    event.target.reset();
}

/**
 * Event listener to toggle the dark theme.
 * 
 * @event click
 * @callback
 * @param {Event} event - The event object representing the click.
 * @returns {void}
 * @listens themeButton#click
 */
themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

(function loadTheme() {
    /**
     * Retrieves the current theme from local storage.
     * 
     * @constant {string|null} theme - The current theme stored in local storage, or null if not set.
     */
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
})();

/** 
 * Event listener to load the initial page.
 * 
 * @event load
 */
window.addEventListener('load', () => {
    const page = location.hash.substring(1) || 'home';
    renderPage(page);
});

/**
 * Event listener to handle the back and forward navigation.
 * 
 * @event popstate
 */
window.addEventListener('popstate', (event) => {
    const page = event.state ? event.state.page : 'home';
    renderPage(page);
});
