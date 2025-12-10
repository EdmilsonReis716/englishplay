/* =========================================================
   ENGLISHPLAY — SCRIPT PRINCIPAL
   Compatível com GitHub Pages (sem backend)
   Inclui:
   ✔ Cadastro / Login
   ✔ Questionário
   ✔ Perfil
   ✔ Amizades + Melhor Amigo
   ✔ Aulas + desbloqueio com “pagamento simulado”
   ✔ Sr.TV IA Offline (SEM API KEY)
   ✔ Admin (ban, mensagens, editar aulas, estatísticas)
   ✔ Confete + cadeado abrindo
   ========================================================= */

console.log("EnglishPlay v3 Loaded ✔");

/* =========================================================
   CONSTANTES E UTILIDADES
   ========================================================= */

const DB_KEY = "englishplay_db_v3";
const SESS_KEY = "englishplay_session_v3";

function dbLoad() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)); }
    catch { return { users: [], lessons: {}, globalMessage: null }; }
}

function dbSave(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function sessionGet() {
    return JSON.parse(localStorage.getItem(SESS_KEY) || "null");
}

function sessionSet(u) {
    localStorage.setItem(SESS_KEY, JSON.stringify(u));
}

function sessionClear() {
    localStorage.removeItem(SESS_KEY);
}

function escapeHtml(s) {
    if (!s) return "";
    return s.replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[c]));
}

/* =========================================================
   INICIALIZAÇÃO DO BANCO
   ========================================================= */
(function init() {
    let db = dbLoad();
    if (!db.users) db.users = [];
    if (!db.lessons) db.lessons = {};
    if (!db.globalMessage) db.globalMessage = null;

    // Usuário de teste padrão
    if (!db.users.find(u => u.username === "Junior")) {
        db.users.push({
            id: 1001,
            username: "Junior",
            name: "Junior",
            password: "123",
            verified: false,
            isAdmin: false,
            banned: false,
            unlockedLessons: 5,
            friends: [],
            friendRequests: [],
            points: 0,
            streak: 0
        });
    }
    dbSave(db);
})();

/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const main = document.getElementById("main");
const userArea = document.getElementById("userArea");
const overlay = document.getElementById("overlay");

overlay.addEventListener("click", () => {
    closeChat();
    closePayment();
});

/* =========================================================
   TELA DE LOGIN
   ========================================================= */

function renderAuth() {
    main.innerHTML = `
    <div class="card">
        <h2>Login</h2>
        <input id="loginUser" placeholder="Usuário ou Email">
        <input id="loginPass" type="password" placeholder="Senha">
        <div style="margin-top:10px;">
            <button class="btn" onclick="login()">Entrar</button>
            <button class="btn ghost" onclick="renderRegister()">Criar Conta</button>
        </div>
    </div>`;
    renderHeader();
}

/* =========================================================
   CADASTRO
   ========================================================= */

function renderRegister() {
    main.innerHTML = `
    <div class="card">
        <h2>Cadastrar</h2>
        <input id="regUser" placeholder="Nome de usuário">
        <input id="regName" placeholder="Seu nome (apelido)">
        <input id="regPass" type="password" placeholder="Senha">
        <input id="regPass2" type="password" placeholder="Confirmar senha">
        <div style="margin-top:10px;">
            <button class="btn" onclick="register()">Criar</button>
            <button class="btn ghost" onclick="renderAuth()">Voltar</button>
        </div>
    </div>`;
    renderHeader();
}

function register() {
    let username = document.getElementById("regUser").value.trim();
    let name = document.getElementById("regName").value.trim();
    let pw = document.getElementById("regPass").value;
    let pw2 = document.getElementById("regPass2").value;

    if (!username || !pw) return alert("Preencha todos os campos.");
    if (pw !== pw2) return alert("Senhas não coincidem.");

    let db = dbLoad();

    if (db.users.some(u => u.username === username))
        return alert("Esse nome de usuário já existe.");

    let isAdmin = username === "Administrador.EnglishPlay";

    let user = {
        id: Date.now(),
        username,
        name,
        password: pw,
        verified: isAdmin,
        isAdmin,
        banned: false,
        unlockedLessons: 5,
        friends: [],
        friendRequests: [],
        points: 0,
        streak: 0
    };

    db.users.push(user);
    dbSave(db);

    sessionSet(user);
    renderQuestionnaire();
}

/* =========================================================
   LOGIN
   ========================================================= */

function login() {
    let user = document.getElementById("loginUser").value.trim();
    let pass = document.getElementById("loginPass").value;

    let db = dbLoad();
    let u = db.users.find(
        x => (x.username === user || x.email === user) && x.password === pass
    );

    if (!u) return alert("Usuário ou senha incorretos.");
    if (u.banned) return alert("Sua conta está banida.");

    sessionSet(u);
    renderHome();
}

/* =========================================================
   QUESTIONÁRIO
   ========================================================= */

function renderQuestionnaire() {
    main.innerHTML = `
    <div class="card">
        <h2>Questionário</h2>

        <label>Como conheceu o EnglishPlay?</label>
        <input id="q1">

        <label>Meta diária (dias)?</label>
        <input id="q2">

        <label>Por que quer aprender inglês?</label>
        <input id="q3">

        <label>Nível atual:</label>
        <select id="q4">
            <option value="nada">Não sei nada</option>
            <option value="pouco">Pouco</option>
            <option value="basico">Conversas básicas</option>
            <option value="fluente">Fluente</option>
        </select>

        <div style="margin-top:10px;">
            <button class="btn" onclick="finishQuestionnaire()">Finalizar</button>
        </div>
    </div>`;
}

function finishQuestionnaire() {
    let db = dbLoad();
    let s = sessionGet();
    let u = db.users.find(x => x.id === s.id);

    u.q = {
        source: q1.value,
        goal: q2.value,
        reason: q3.value,
        level: q4.value
    };

    dbSave(db);
    sessionSet(u);

    renderHome();
}

/* =========================================================
   HOME
   ========================================================= */

function renderHome() {
    let u = sessionGet();
    if (!u) return renderAuth();

    let db = dbLoad();

    // banner admin
    if (db.globalMessage?.active) showBanner(db.globalMessage.text);

    let html = `
    <div class="card">
        <h2>Bem-vindo, ${escapeHtml(u.username)} ${u.verified ? "✔" : ""}</h2>
        <button class="btn small" onclick="renderProfile()">Perfil</button>
        ${u.isAdmin ? `<button class="btn small" onclick="renderAdmin()">Admin</button>` : ""}
        <button class="btn small" onclick="openChat()">Sr.TV</button>
        <button class="btn small" onclick="logout()">Sair</button>
    </div>

    <div class="card">
        <h3>Aulas</h3>
        <div id="lessonGrid" class="lesson-grid"></div>
    </div>`;

    main.innerHTML = html;
    renderLessons();
    renderHeader();
}

/* =========================================================
   AULAS (200)
   ========================================================= */

function renderLessons() {
    let grid = document.getElementById("lessonGrid");
    let u = sessionGet();
    let html = "";

    for (let i = 1; i <= 200; i++) {
        let unlocked = i <= (u.unlockedLessons || 0);
        html += `<button class="lesson-btn ${unlocked ? "" : "locked"}" onclick="lessonClick(${i})">${unlocked ? "Aula " + i : "Bloqueada " + i}</button>`;
    }
    grid.innerHTML = html;
}

function lessonClick(n) {
    let u = sessionGet();

    if (n <= u.unlockedLessons) {
        alert("Conteúdo da aula " + n + " (aulas reais serão adicionadas depois)");
        return;
    }

    openPayment(n);
}

/* =========================================================
   PAGAMENTO SIMULADO
   ========================================================= */

let currentLesson = null;

function openPayment(n) {
    currentLesson = n;
    paymentModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function closePayment() {
    paymentModal.classList.add("hidden");
    overlay.classList.add("hidden");
}

function simulatePayment() {
    let db = dbLoad();
    let u = sessionGet();
    let user = db.users.find(x => x.id === u.id);

    user.unlockedLessons = Math.max(user.unlockedLessons, currentLesson);
    dbSave(db);
    sessionSet(user);

    showConfetti();
    showUnlockAnimation();

    closePayment();
    renderHome();
}

/* =========================================================
   PERFIL
   ========================================================= */

function renderProfile() {
    let u = sessionGet();
    if (!u) return renderAuth();

    let db = dbLoad();
    let best = "-";
    if (u.bestFriendId) {
        let friend = db.users.find(x => x.id === u.bestFriendId);
        best = friend ? friend.username : "-";
    }

    main.innerHTML = `
    <div class="card">
        <h2>Perfil</h2>

        <p>Nome: ${escapeHtml(u.username)} ${u.verified ? "✔" : ""}</p>
        <p>Dias consecutivos: ${u.streak}</p>
        <p>Pontos acumulados: ${u.points}</p>
        <p>Melhor amigo: ${best}</p>

        <button class="btn" onclick="renderHome()">Voltar</button>
    </div>`;
}

/* =========================================================
   ADMIN
   ========================================================= */

function renderAdmin() {
    let u = sessionGet();
    if (!u?.isAdmin) return renderHome();

    let db = dbLoad();

    let usersHtml = db.users.map(us => `
        <div class="user-row">
            <div>${escapeHtml(us.username)} ${us.verified ? "✔" : ""} ${us.banned ? "<span style='color:red'>(Banido)</span>" : ""}</div>
            <div>
                ${us.banned ?
            `<button class="btn small" onclick="unban(${us.id})">Desbanir</button>` :
            `<button class="btn small" onclick="ban(${us.id})">Banir</button>`}
            </div>
        </div>
    `).join("");

    main.innerHTML = `
    <div class="card">
        <h2>Painel Admin</h2>

        <button class="btn ghost" onclick="renderHome()">Voltar</button>

        <h3 style="margin-top:15px">Usuários</h3>
        ${usersHtml}

        <h3>Mensagem Global</h3>
        <textarea id="globalMsg" style="width:100%;height:80px;">${db.globalMessage?.text || ""}</textarea>
        <button class="btn" onclick="publishGlobal()">Publicar</button>

        <h3 style="margin-top:15px">Editar Aulas (JSON)</h3>
        <textarea id="lessonEdit" style="width:100%;height:140px;">${JSON.stringify(db.lessons, null, 2)}</textarea>
        <button class="btn" onclick="saveLessons()">Salvar</button>

        <h3 style="margin-top:15px">Estatísticas</h3>
        <div id="stats"></div>
    </div>`;

    renderStats();
}

function ban(id) {
    let db = dbLoad();
    let u = db.users.find(x => x.id === id);
    if (!u) return;
    u.banned = true;
    dbSave(db);
    renderAdmin();
}

function unban(id) {
    let db = dbLoad();
    let u = db.users.find(x => x.id === id);
    if (!u) return;
    u.banned = false;
    dbSave(db);
    renderAdmin();
}

function publishGlobal() {
    let txt = document.getElementById("globalMsg").value.trim();
    let db = dbLoad();
    db.globalMessage = { text: txt, active: true };
    dbSave(db);
    alert("Mensagem publicada!");
}

function saveLessons() {
    try {
        let json = JSON.parse(document.getElementById("lessonEdit").value);
        let db = dbLoad();
        db.lessons = json;
        dbSave(db);
        alert("Aulas salvas!");
    } catch {
        alert("JSON inválido");
    }
}

function renderStats() {
    let db = dbLoad();
    stats.innerHTML = `
    <p>Total de usuários: ${db.users.length}</p>
    <p>Banidos: ${db.users.filter(u => u.banned).length}</p>
    <p>Aulas desbloqueadas somadas: ${db.users.reduce((s, u) => s + u.unlockedLessons, 0)}</p>
    `;
}

/* =========================================================
   SISTEMA DE AMIZADES
   ========================================================= */

function sendFriendRequest(id) {
    let u = sessionGet();
    if (!u) return alert("Entre primeiro.");

    if (id === u.id) return alert("Não pode adicionar você mesmo.");

    let db = dbLoad();
    let target = db.users.find(x => x.id === id);

    if (!target) return;

    target.friendRequests ||= [];

    if (target.friendRequests.includes(u.id)) {
        return alert("Pedido já enviado.");
    }

    target.friendRequests.push(u.id);
    dbSave(db);

    alert("Pedido enviado!");
}

function acceptFriend(id) {
    let db = dbLoad();
    let u = sessionGet();

    let me = db.users.find(x => x.id === u.id);
    let other = db.users.find(x => x.id === id);

    me.friends ||= [];
    other.friends ||= [];

    if (!me.friends.includes(id)) me.friends.push(id);
    if (!other.friends.includes(me.id)) other.friends.push(me.id);

    other.friendRequests = other.friendRequests.filter(x => x !== me.id);

    dbSave(db);
    sessionSet(me);

    alert("Agora vocês são amigos!");
}

/* =========================================================
   CHAT — IA OFFLINE SR.TV
   ========================================================= */

function openChat() {
    chatModal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    chatBox.innerHTML = "";
    appendChatAi("📺 Olá! Sou o Sr.TV. Pergunte qualquer coisa sobre inglês ou sobre o app!");
}

function closeChat() {
    chatModal.classList.add("hidden");
    overlay.classList.add("hidden");
}

function appendChatUser(t) {
    let d = document.createElement("div");
    d.classList.add("chat-bubble", "chat-user");
    d.innerText = t;
    chatBox.appendChild(d);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendChatAi(t) {
    let d = document.createElement("div");
    d.classList.add("chat-bubble", "chat-ai");
    d.innerText = t;
    chatBox.appendChild(d);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendChat.addEventListener("click", sendChatMessage);

function sendChatMessage() {
    let text = chatInput.value.trim();
    if (!text) return;

    appendChatUser(text);
    chatInput.value = "";

    setTimeout(() => {
        appendChatAi(srTvBrain(text));
    }, 300);
}

/* =========================================================
   “CÉREBRO” DO SR.TV — IA OFFLINE
   ========================================================= */

function srTvBrain(msg) {
    let t = msg.toLowerCase();

    // Saudações
    if (t.includes("oi") || t.includes("olá") || t.includes("hello")) {
        return "Olá! Como posso te ajudar hoje? 😄";
    }

    // Gramática
    if (t.includes("present perfect")) {
        return "Present Perfect = have/has + particípio.\nEx: I have studied English.";
    }

    if (t.includes("past simple") || t.includes("passado simples")) {
        return "Past Simple fala de ações concluídas no passado.\nEx: I worked yesterday.";
    }

    if (t.includes("future") || t.includes("futuro")) {
        return "Future Simple = will + verbo.\nEx: I will learn English.";
    }

    if (t.includes("do ") || t.includes("does")) {
        return "Use DO com I/you/we/they.\nUse DOES com he/she/it.";
    }

    // Significado
    if (t.includes("o que significa")) {
        let w = msg.replace(/o que significa/i, "").trim();
        return `Significado aproximado de "${w}": ${srTvTranslate(w)}`;
    }

    // Tradução
    if (t.startsWith("traduza") || t.startsWith("traduz")) {
        let w = msg.replace(/traduza|traduz/gi, "").trim();
        return `Tradução de "${w}": ${srTvTranslate(w)}`;
    }

    // Suporte
    if (t.includes("erro") || t.includes("não funciona") || t.includes("bug")) {
        return "Tente atualizar a página (Ctrl+F5). Se continuar, me diga o erro!";
    }

    if (t.includes("pagar") || t.includes("pix")) {
        return "Pagamentos reais não funcionam no GitHub Pages. Aqui é simulação. 😉";
    }

    // fallback
    return "Não entendi muito bem 🤔\nPergunte sobre inglês, gramática, vocabulário, frases ou suporte!";
}

function srTvTranslate(word) {
    let dict = {
        "hello": "olá",
        "car": "carro",
        "dog": "cachorro",
        "cat": "gato",
        "love": "amor",
        "through": "através de",
        "house": "casa",
        "school": "escola"
    };
    return dict[word.toLowerCase()] || "tradução não disponível no modo offline";
}

/* =========================================================
   ANIMAÇÕES
   ========================================================= */

function showConfetti() {
    for (let i = 0; i < 25; i++) {
        let c = document.createElement("div");
        c.style.position = "fixed";
        c.style.top = "20px";
        c.style.left = Math.random() * window.innerWidth + "px";
        c.style.width = "10px";
        c.style.height = "10px";
        c.style.background = ["#f5c518", "#ffd54a", "#fff"][Math.floor(Math.random() * 3)];
        c.style.opacity = "0.9";
        c.style.zIndex = "9999";
        document.body.appendChild(c);

        setTimeout(() => {
            c.style.transition = "1.2s";
            c.style.top = window.innerHeight + "px";
            c.style.opacity = 0;
            setTimeout(() => c.remove(), 1200);
        }, 10);
    }
}

function showUnlockAnimation() {
    let box = document.createElement("div");
    box.className = "modal";
    box.innerHTML = `
        <div class="modal-card" style="text-align:center;padding:20px;">
            <h3>Aula desbloqueada! 🎉</h3>
        </div>`;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1500);
}

/* =========================================================
   HEADER
   ========================================================= */

function renderHeader() {
    let u = sessionGet();

    if (!u) {
        userArea.innerHTML = `<button class="btn small" onclick="renderAuth()">Entrar</button>`;
        return;
    }

    userArea.innerHTML = `
        <span style="margin-right:10px;">${escapeHtml(u.username)} ${u.verified ? "✔" : ""}</span>
        <button class="btn small" onclick="renderProfile()">Perfil</button>
        ${u.isAdmin ? `<button class="btn small" onclick="renderAdmin()">Admin</button>` : ""}
        <button class="btn small" onclick="openChat()">Sr.TV</button>
        <button class="btn small" onclick="logout()">Sair</button>
    `;
}

function logout() {
    sessionClear();
    renderAuth();
}

/* =========================================================
   INICIAR APP
   ========================================================= */

function startApp() {
    let u = sessionGet();
    if (u) renderHome();
    else renderAuth();
}

startApp();
