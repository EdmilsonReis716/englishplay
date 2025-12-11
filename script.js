/* ============================================================
   SISTEMA DE ARMAZENAMENTO (Banco Local)
============================================================ */

let USERS = JSON.parse(localStorage.getItem("users")) || {};
let SESSION = JSON.parse(localStorage.getItem("session")) || null;

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(USERS));
}

function saveSession() {
    localStorage.setItem("session", JSON.stringify(SESSION));
}


/* ============================================================
   LOGIN
============================================================ */

function openLoginModal() {
    createModal(`
        <h2>Entrar na Conta</h2>
        <input id="loginName" placeholder="Nome de usuário">
        <button class="btn-main" onclick="login()">Entrar</button>
        <p style="margin-top:8px; text-align:center;">ou</p>
        <button class="btn-main" onclick="openRegisterModal()">Criar Conta</button>
    `);
}

function login() {
    let name = document.getElementById("loginName").value.trim();

    if (!USERS[name]) {
        alert("Usuário não encontrado!");
        return;
    }

    SESSION = USERS[name];
    saveSession();

    closeModal();
    loadUserData();
}


/* ============================================================
   CADASTRO
============================================================ */

function openRegisterModal() {
    createModal(`
        <h2>Criar Conta</h2>
        <input id="regName" placeholder="Nome único (ex: Joao123)">
        <button class="btn-main" onclick="register()">Cadastrar</button>
    `);
}

function register() {
    let name = document.getElementById("regName").value.trim();

    if (name.length < 3) {
        alert("Nome muito curto!");
        return;
    }
    if (USERS[name]) {
        alert("Este nome já existe!");
        return;
    }

    USERS[name] = {
        name,
        avatar: "logo.png",
        xp: 0,
        streak: 0,
        lessonsUnlocked: 1,
        questionnaireDone: false,
        friends: [],
        requests: []
    };

    saveUsers();

    SESSION = USERS[name];
    saveSession();

    closeModal();
    openQuestionnaire();
}


/* ============================================================
   QUESTIONÁRIO
============================================================ */

function openQuestionnaire() {
    window.location.href = "questionario.html";
}


/* ============================================================
   LOGOUT
============================================================ */

function logout() {
    SESSION = null;
    saveSession();
    window.location.href = "auth.html";
}


/* ============================================================
   CARREGAR PERFIL LATERAL NO INDEX
============================================================ */

function loadUserData() {
    if (!SESSION) {
        openLoginModal();
        return;
    }

    document.getElementById("profilePic").src = SESSION.avatar || "logo.png";
    document.getElementById("profileName").innerText = SESSION.name;
    document.getElementById("fire").innerText = `🔥 ${SESSION.streak} dias`;
    document.getElementById("xp").innerText = `⭐ ${SESSION.xp} XP`;

    generateSessions();
}

document.addEventListener("DOMContentLoaded", loadUserData);


/* ============================================================
   GERAR SESSÕES E AULAS
============================================================ */

const SESSOES = [
    { nome: "Fundamentos", total: 20 },
    { nome: "Vocabulário", total: 20 },
    { nome: "Frases Úteis", total: 20 },
    { nome: "Gramática 1", total: 20 },
    { nome: "Gramática 2", total: 20 },
    { nome: "Conversação", total: 20 },
    { nome: "Intermediário 1", total: 20 },
    { nome: "Intermediário 2", total: 20 },
    { nome: "Avançado 1", total: 20 },
    { nome: "Avançado 2", total: 20 }
];

function generateSessions() {
    let container = document.getElementById("sessionsContainer");
    container.innerHTML = "";

    let lessonCounter = 1;

    SESSOES.forEach((sessao, index) => {
        let div = document.createElement("div");
        div.className = "section-box";

        div.innerHTML = `
            <h2 class="section-title">📘 Sessão ${index + 1} — ${sessao.nome}</h2>
            <div class="lessons-grid" id="sess_${index}"></div>
        `;

        let grid = div.querySelector(".lessons-grid");

        for (let i = 1; i <= sessao.total; i++) {
            let unlocked = lessonCounter <= SESSION.lessonsUnlocked;

            let circle = document.createElement("div");
            circle.className = "lesson-circle " + (unlocked ? "unlocked" : "");
            circle.innerHTML = unlocked ? lessonCounter : `<span class='lock-icon'>🔒</span>`;

            if (unlocked) {
                circle.onclick = () => {
                    window.location.href = `lesson.html?id=${lessonCounter}`;
                };
            }

            grid.appendChild(circle);
            lessonCounter++;
        }

        container.appendChild(div);
    });
}


/* ============================================================
   MODAL SISTEMA
============================================================ */

function createModal(html) {
    let modal = document.createElement("div");
    modal.className = "modal-bg";
    modal.style.display = "flex";

    modal.innerHTML = `
        <div class="modal-box">
            ${html}
            <button class="btn-main" onclick="closeModal()" style="background:#333; color:white; margin-top:10px;">Fechar</button>
        </div>
    `;

    document.getElementById("modalArea").appendChild(modal);
}

function closeModal() {
    document.getElementById("modalArea").innerHTML = "";
}


/* ============================================================
   PESQUISA DE USUÁRIOS
============================================================ */

function searchUsers() {
    let text = document.getElementById("searchUsers").value.toLowerCase();
    if (text.length < 1) return;

    let results = Object.keys(USERS).filter(n => n.toLowerCase().includes(text));

    createModal(`
        <h2>Resultados:</h2>
        ${results.map(r => `<p>${r}</p>`).join("") || "<p>Nenhum usuário encontrado</p>"}
    `);
}
