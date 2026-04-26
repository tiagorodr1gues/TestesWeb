/* ============================================================
   SENDA — JAVASCRIPT GLOBAL
   Auth com localStorage + Navbar + Tema
   ============================================================ */

// ── AUTH ────────────────────────────────────────────────────
const Auth = {
  USERS_KEY: 'senda_users',
  SESSION_KEY: 'senda_session',

  getUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getSession() {
    return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
  },

  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  isAdmin() {
    const s = this.getSession();
    return s && s.admin === true;
  },

  register(nome, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { ok: false, erro: 'Este email já está registado.' };
    }
    const novoUser = {
      id: Date.now(),
      nome,
      email,
      password,
      admin: users.length === 0, // Primeiro utilizador é admin
      data: new Date().toISOString()
    };
    users.push(novoUser);
    this.saveUsers(users);
    return { ok: true, user: novoUser };
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, erro: 'Email ou senha incorretos.' };
    this.setSession(user);
    return { ok: true, user };
  },

  logout() {
    this.clearSession();
    window.location.href = this._root() + 'index.html';
  },

  _root() {
    // Determina o caminho relativo até à raiz
    const p = window.location.pathname;
    return p.includes('/HTML/') ? '../' : './';
  }
};

// ── TEMA ────────────────────────────────────────────────────
const Tema = {
  CHAVE: 'senda_tema',

  init() {
    if (localStorage.getItem(this.CHAVE) === 'escuro') {
      document.body.classList.add('dark');
    }
    const btn = document.getElementById('btn-tema');
    if (btn) {
      this._atualizar(btn);
      btn.addEventListener('click', () => this.toggle(btn));
    }
  },

  toggle(btn) {
    document.body.classList.toggle('dark');
    const escuro = document.body.classList.contains('dark');
    localStorage.setItem(this.CHAVE, escuro ? 'escuro' : 'claro');
    this._atualizar(btn);
  },

  _atualizar(btn) {
    btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    btn.setAttribute('title', document.body.classList.contains('dark') ? 'Modo claro' : 'Modo escuro');
  }
};

// ── NAVBAR ──────────────────────────────────────────────────
const Navbar = {
  init() {
    this._ativarLink();
    this._hamburger();
    this._atualizarAuth();
  },

  _ativarLink() {
    const atual = window.location.pathname.split('/').pop();
    document.querySelectorAll('.navbar__menu a').forEach(a => {
      const href = a.getAttribute('href').split('/').pop();
      if (href === atual || (atual === '' && href === 'index.html')) {
        a.classList.add('ativo');
      }
    });
  },

  _hamburger() {
    const btn = document.getElementById('hamburger');
    const menu = document.querySelector('.navbar__menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      menu.classList.toggle('aberto');
      btn.setAttribute('aria-expanded', menu.classList.contains('aberto'));
    });
    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('aberto');
      }
    });
  },

  _atualizarAuth() {
    const session = Auth.getSession();
    const area = document.getElementById('area-auth');
    if (!area) return;

    if (session) {
      // Utilizador logado
      area.innerHTML = `
        <button class="btn-login" id="btn-perfil">👤 ${session.nome.split(' ')[0]}</button>
        <div class="perfil-dropdown" id="perfil-dropdown">
          <div class="perfil-dropdown__header">
            <div class="nome">${session.nome}</div>
            <div class="email">${session.email}</div>
          </div>
          ${session.admin ? `<a href="${Auth._root()}HTML/admin.html">⚙️ Painel Admin</a>` : ''}
          <button class="logout" id="btn-logout">🚪 Terminar sessão</button>
        </div>
      `;
      document.getElementById('btn-perfil').addEventListener('click', e => {
        e.stopPropagation();
        document.getElementById('perfil-dropdown').classList.toggle('aberto');
      });
      document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());
      document.addEventListener('click', e => {
        const d = document.getElementById('perfil-dropdown');
        if (d && !d.contains(e.target) && e.target !== document.getElementById('btn-perfil')) {
          d.classList.remove('aberto');
        }
      });
    } else {
      // Não logado
      area.innerHTML = `
        <button class="btn-login" id="btn-entrar">Entrar</button>
        <div class="login-dropdown" id="login-dropdown">
          <h3>Entrar na conta</h3>
          <p id="login-erro"></p>
          <label>Email</label>
          <input type="email" id="login-email" placeholder="o.seu@email.com" />
          <label>Senha</label>
          <input type="password" id="login-pass" placeholder="••••••••" />
          <button class="btn-submit" id="login-submit">Entrar</button>
          <div class="link-criar">Não tem conta? <a href="${Auth._root()}HTML/criar-conta.html">Crie uma aqui</a></div>
        </div>
      `;
      const btnEntrar = document.getElementById('btn-entrar');
      const dropdown = document.getElementById('login-dropdown');

      btnEntrar.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('aberto');
      });
      document.addEventListener('click', e => {
        if (!dropdown.contains(e.target) && e.target !== btnEntrar) {
          dropdown.classList.remove('aberto');
        }
      });
      document.getElementById('login-submit').addEventListener('click', () => {
        const email = document.getElementById('login-email').value.trim();
        const pass  = document.getElementById('login-pass').value;
        const erro  = document.getElementById('login-erro');
        const res = Auth.login(email, pass);
        if (res.ok) {
          dropdown.classList.remove('aberto');
          Navbar._atualizarAuth();
        } else {
          erro.textContent = res.erro;
          erro.style.display = 'block';
        }
      });
      // Enter no campo senha
      document.getElementById('login-pass')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('login-submit').click();
      });
    }
  }
};

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Tema.init();
  Navbar.init();
});
