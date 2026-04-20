// Alternar tema claro / escuro
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function updateThemeIcon() {
    themeToggle.textContent = body.classList.contains('dark-theme') ? '☀️' : '🌑';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    updateThemeIcon();
});

updateThemeIcon();

// Mostrar/ocultar dropdown login
const loginBtn = document.getElementById('login-btn');
const loginDropdown = document.getElementById('login-dropdown');

loginBtn.addEventListener('click', () => {
    const expanded = loginBtn.getAttribute('aria-expanded') === 'true';
    loginBtn.setAttribute('aria-expanded', String(!expanded));
    loginDropdown.classList.toggle('active');
});

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    if (!loginDropdown.contains(e.target) && e.target !== loginBtn) {
      loginDropdown.classList.remove('active');
      loginBtn.setAttribute('aria-expanded', 'false');
    }
});

// Evitar submissão real do formulário (demo)
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Login enviado!');
    loginDropdown.classList.remove('active');
    loginBtn.setAttribute('aria-expanded', 'false');
});