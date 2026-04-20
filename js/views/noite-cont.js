// Alternar os temas
const btn = document.getElementById('themeToggle');
btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
      btn.textContent = '☀️';
      } else {
        btn.textContent = '🌑';
        }
});

// Mensagem após o enviar
const form = document.getElementById('contactForm');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('A sua mensagem foi enviada com sucesso! Obrigado por entrar em contacto.');
    form.submit();
});