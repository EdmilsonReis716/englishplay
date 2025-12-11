/* ============================================================
   ENGLISHPLAY — SCRIPT FINAL SEM BUGS (2025)
   ============================================================ */

function $(id){ return document.getElementById(id); }

/* ============================================================
   BANCO DE DADOS LOCAL
   ============================================================ */

function dbLoad(){
    try { return JSON.parse(localStorage.getItem("englishplay_db")) || { users:[] }; }
    catch { return { users:[] }; }
}

function dbSave(db){ localStorage.setItem("englishplay_db", JSON.stringify(db)); }

function getSession(){
    try { return JSON.parse(localStorage.getItem("englishplay_session")); }
    catch { return null; }
}

function setSession(s){ localStorage.setItem("englishplay_session", JSON.stringify(s)); }


let db = dbLoad();
let session = getSession();

/* ============================================================
   UI HELPERS
   ============================================================ */

function closeAllModals(){
    document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
    $("overlay").classList.add("hidden");
}

function openModal(id){
    closeAllModals();
    $("overlay").classList.remove("hidden");
    $(id).classList.remove("hidden");
}

function renderUserArea(){
    const ua = $("userArea");

    if(!session){
        ua.innerHTML = `<button onclick="openModal('authModal')">Entrar</button>`;
        return;
    }

    ua.innerHTML = `
        <button onclick="logout()">Sair</button>
    `;
}

function renderSidebar(){
    const sb = $("sidebar");
    if(!session){
        sb.innerHTML = `
            <img src="logo.png" class="profile-avatar">
            <h3 style="color:var(--yellow)">Visitante</h3>
            <p>Faça login para ver seu progresso.</p>
        `;
        return;
    }

    sb.innerHTML = `
        <img src="logo.png" class="profile-avatar">
        <h3>${session.username}</h3>
        <p style="color:var(--yellow)">🔥 ${session.streak || 0} dias</p>
        <p style="color:var(--accent)">⭐ ${session.xp || 0} XP</p>
    `;
}

/* ============================================================
   LOGIN + CADASTRO
   ============================================================ */

$("authLoginBtn").onclick = () => {
    const user = $("authUser").value.trim();
    const pass = $("authPass").value.trim();

    const found = db.users.find(u => u.username === user && u.pass === pass);

    if(!found){
        alert("Usuário ou senha incorretos");
        return;
    }

    session = found;
    setSession(found);
    closeAllModals();
    renderUserArea();
    renderSidebar();
    renderSessions();
};

$("authRegisterBtn").onclick = () => {
    const user = $("authUser").value.trim();
    const pass = $("authPass").value.trim();

    if(user.length < 3) return alert("Nome muito curto");
    if(pass.length < 3) return alert("Senha muito curta");

    if(db.users.find(u => u.username === user)){
        alert("Este nome já existe!");
        return;
    }

    const newUser = {
        id: Date.now(),
        username: user,
        pass: pass,
        streak: 0,
        xp: 0,
        completed: [],
        questionnaire: null
    };

    db.users.push(newUser);
    dbSave(db);

    session = newUser;
    setSession(newUser);

    closeAllModals();
    openModal("questionModal"); // CORRIGIDO: só abre ele
};

function logout(){
    session = null;
    localStorage.removeItem("englishplay_session");
    renderUserArea();
    renderSidebar();
    renderSessions();
}

/* ============================================================
   QUESTIONÁRIO
   ============================================================ */

$("finishQuestion").onclick = () => {
    if(!session) return;

    session.questionnaire = {
        source: $("q_source").value,
        days: $("q_days").value,
        reason: $("q_reason").value,
        level: [...document.getElementsByName("q_level")].find(r=>r.checked).value
    };

    const i = db.users.findIndex(u => u.id === session.id);
    db.users[i] = session;
    dbSave(db);

    closeAllModals();
    renderSessions();
};

/* ============================================================
   SESSÕES DE AULA (10 × 20)
   ============================================================ */

const SESSION_INFO = [
    { icon:"⭐", title:"Fundamentos" },
    { icon:"📘", title:"Vocabulário Básico" },
    { icon:"🔤", title:"Gramática Inicial" },
    { icon:"🎧", title:"Listening" },
    { icon:"✍", title:"Writing" },
    { icon:"💬", title:"Conversação" },
    { icon:"🚀", title:"Intermediário" },
    { icon:"🔥", title:"Intermediário Avançado" },
    { icon:"🎯", title:"Pré-Fluência" },
    { icon:"👑", title:"Domínio do Inglês" },
];

/* ============================================================
   GERA TODAS AS SESSÕES
   ============================================================ */

function renderSessions(){
    const area = $("sessionsArea");
    area.innerHTML = "";

    let lessonNum = 1;

    for(let s = 0; s < 10; s++){
        const card = document.createElement("div");
        card.className = "session-card";

        card.innerHTML = `
            <h2 class="session-title">
                <span class="icon">${SESSION_INFO[s].icon}</span>
                Sessão ${s+1} — ${SESSION_INFO[s].title}
            </h2>

            <div class="lesson-tree" id="tree${s}"></div>
        `;

        area.appendChild(card);

        const tree = card.querySelector(".lesson-tree");

        for(let i = 0; i < 20; i++){
            const row = document.createElement("div");
            row.className = "lesson-row";

            const circle = document.createElement("div");
            circle.className = "lesson-circle";
            circle.textContent = lessonNum;

            const unlocked =
                session &&
                (lessonNum === 1 || session.completed.includes(lessonNum - 1));

            if(!unlocked){
                circle.classList.add("lesson-locked");
                circle.innerHTML = "🔒";
            }

            if(session && session.completed.includes(lessonNum)){
                circle.classList.add("lesson-done");
                circle.innerHTML = "✔";
            }

            circle.onclick = () => {
                if(circle.classList.contains("lesson-locked")) return;
                goToLesson(lessonNum);
            };

            row.appendChild(circle);
            tree.appendChild(row);

            lessonNum++;
        }
    }
}

/* ============================================================
   TRANSIÇÃO PARA A AULA
   ============================================================ */

function goToLesson(id){
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = `lesson.html?id=${id}`;
    }, 250);
}

/* Fade-out style injection */
const style = document.createElement("style");
style.innerHTML = `
.fade-out {
    opacity: 0;
    transition: opacity .25s ease-in-out;
}
`;
document.head.appendChild(style);

/* ============================================================
   PESQUISA DE USUÁRIOS
   ============================================================ */

$("searchUsers").oninput = () => {
    const text = $("searchUsers").value.trim().toLowerCase();
    const box = $("searchResults");

    if(text.length === 0){
        box.classList.add("hidden");
        return;
    }

    const filtered = db.users.filter(u => u.username.toLowerCase().includes(text));

    box.innerHTML = filtered.map(u=>`
        <div style="padding:8px;border-bottom:1px solid #222;">${u.username}</div>
    `).join("");

    box.classList.remove("hidden");
};

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

renderUserArea();
renderSidebar();
renderSessions();

/* ============================================================
   FIM DO SCRIPT
   ============================================================ */
