from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# ── Configuração ──────────────────────────────────────────────────────────────

BASE = "https://tiagorodr1gues.github.io/TestesWeb"

options = Options()
# options.add_argument("--headless")  # descomenta se não quiseres ver o browser

driver = webdriver.Chrome(options=options)
driver.implicitly_wait(8)

passed = 0
failed = 0

def passou(msg):
    global passed
    print(f"  ✅ {msg}")
    passed += 1

def falhou(msg):
    global failed
    print(f"  ❌ {msg}")
    failed += 1

def secao(titulo):
    print(f"\n── {titulo} ──")

# ── 1. Carregamento de páginas ────────────────────────────────────────────────

secao("1. CARREGAMENTO DE PÁGINAS")

paginas = {
    "Homepage":           f"{BASE}/index.html",
    "Prepare-se":         f"{BASE}/HTML/Prepare-se.html",
    "Durante o Caminho":  f"{BASE}/HTML/Durante-o-Caminho.html",
    "Santiago e Galiza":  f"{BASE}/HTML/Santiago-e-Galiza.html",
    "Recomendações":      f"{BASE}/HTML/recomendacoes.html",
    "Contactos":          f"{BASE}/HTML/contacto.html",
    "Criar Conta":        f"{BASE}/HTML/criar-conta.html",
}

for nome, url in paginas.items():
    driver.get(url)
    titulo = driver.title.lower()
    body   = driver.find_element(By.TAG_NAME, "body").text.strip()
    if "404" in titulo or "not found" in titulo:
        falhou(f"{nome} — página retornou 404")
    elif len(body) < 50:
        falhou(f"{nome} — body quase vazio ({len(body)} chars)")
    else:
        passou(f"{nome} carregou corretamente")

# ── 2. Títulos de página ──────────────────────────────────────────────────────

secao("2. TÍTULOS DE PÁGINA")

for nome, url in paginas.items():
    driver.get(url)
    if driver.title.strip():
        passou(f"{nome} — título: '{driver.title}'")
    else:
        falhou(f"{nome} — título vazio")

# ── 3. Navegação pelo menu ────────────────────────────────────────────────────

secao("3. NAVEGAÇÃO")

links_menu = ["Prepare-se", "Durante o Caminho", "Contactos"]

for texto in links_menu:
    driver.get(f"{BASE}/index.html")
    try:
        link = driver.find_element(By.PARTIAL_LINK_TEXT, texto)
        link.click()
        time.sleep(1.5)
        passou(f"Navegação '{texto}' OK → {driver.current_url}")
    except:
        falhou(f"Navegação '{texto}' — link não encontrado no menu")

# ── 4. Conteúdo da Homepage ───────────────────────────────────────────────────

secao("4. CONTEÚDO DA HOMEPAGE")

driver.get(f"{BASE}/index.html")
body = driver.find_element(By.TAG_NAME, "body").text.lower()

# H1
h1s = driver.find_elements(By.TAG_NAME, "h1")
if h1s and h1s[0].text.strip():
    passou(f"Homepage — H1: '{h1s[0].text}'")
else:
    falhou("Homepage — sem <h1>")

# CTA
if "começar" in body or "preparar" in body or "caminho" in body:
    passou("Homepage — texto CTA encontrado")
else:
    falhou("Homepage — texto CTA não encontrado")

# Link Criar Conta
criar = driver.find_elements(By.PARTIAL_LINK_TEXT, "Criar conta")
if criar:
    passou("Homepage — link 'Criar conta' encontrado")
else:
    falhou("Homepage — link 'Criar conta' não encontrado")

# Footer links
footer_links = driver.find_elements(By.CSS_SELECTOR, "footer a")
sem_href = [l.get_attribute("href") for l in footer_links
            if not l.get_attribute("href") or l.get_attribute("href").endswith("#")]
if not sem_href:
    passou("Homepage — todos os links do footer têm href válido")
else:
    falhou(f"Homepage — {len(sem_href)} link(s) do footer sem href válido")

# ── 5. Formulário de Contacto ─────────────────────────────────────────────────

secao("5. FORMULÁRIO DE CONTACTO")

driver.get(f"{BASE}/HTML/contacto.html")
campos = driver.find_elements(By.CSS_SELECTOR, "input, textarea")

if len(campos) >= 2:
    passou(f"Contacto — formulário tem {len(campos)} campo(s)")
else:
    falhou(f"Contacto — só tem {len(campos)} campo(s), esperados ≥2")

url_antes = driver.current_url
btns = driver.find_elements(By.CSS_SELECTOR, "button, input[type='submit']")
if btns:
    btns[0].click()
    time.sleep(1)
    if driver.current_url == url_antes:
        passou("Contacto — submissão vazia ficou na mesma página (validação OK)")
    else:
        falhou(f"Contacto — submeteu sem validação, foi para: {driver.current_url}")
else:
    falhou("Contacto — botão de submit não encontrado")

# ── 6. Formulário Criar Conta ─────────────────────────────────────────────────

secao("6. FORMULÁRIO CRIAR CONTA")

driver.get(f"{BASE}/HTML/criar-conta.html")
campos = driver.find_elements(By.CSS_SELECTOR, "input")

if len(campos) >= 2:
    passou(f"Criar Conta — formulário tem {len(campos)} campo(s)")
else:
    falhou(f"Criar Conta — só tem {len(campos)} campo(s), esperados ≥2")

# ── 7. Imagens ────────────────────────────────────────────────────────────────

secao("7. IMAGENS")

paginas_imgs = {
    "Homepage":        f"{BASE}/index.html",
    "Prepare-se":      f"{BASE}/HTML/Prepare-se.html",
    "Durante Caminho": f"{BASE}/HTML/Durante-o-Caminho.html",
}

for nome, url in paginas_imgs.items():
    driver.get(url)
    imgs = driver.find_elements(By.TAG_NAME, "img")
    sem_src = [i for i in imgs if not i.get_attribute("src")]
    sem_alt = [i for i in imgs if i.get_attribute("alt") is None]

    if not sem_src:
        passou(f"{nome} — todas as {len(imgs)} imagem(ns) têm src")
    else:
        falhou(f"{nome} — {len(sem_src)} imagem(ns) sem src")

    if not sem_alt:
        passou(f"{nome} — todas as imagens têm alt (acessibilidade OK)")
    else:
        falhou(f"{nome} — {len(sem_alt)} imagem(ns) sem atributo alt")

# ── 8. Responsividade ─────────────────────────────────────────────────────────

secao("8. RESPONSIVIDADE")

viewports = [("Mobile", 375, 812), ("Tablet", 768, 1024), ("Desktop", 1280, 900)]

for label, w, h in viewports:
    driver.set_window_size(w, h)
    driver.get(f"{BASE}/index.html")
    time.sleep(1)
    scroll_w = driver.execute_script("return document.body.scrollWidth")
    client_w = driver.execute_script("return document.documentElement.clientWidth")
    driver.set_window_size(1280, 900)
    if scroll_w <= client_w + 5:
        passou(f"Responsividade {label} ({w}px) — sem overflow horizontal")
    else:
        falhou(f"Responsividade {label} ({w}px) — overflow! scrollWidth={scroll_w} > clientWidth={client_w}")

# ── Resultado Final ───────────────────────────────────────────────────────────

print("\n========================================")
print("   RESULTADO FINAL")
print("========================================")
print(f"✅ Passou:  {passed}")
print(f"❌ Falhou:  {failed}")
print(f"📊 Total:   {passed + failed}")
print("========================================")

driver.quit()
