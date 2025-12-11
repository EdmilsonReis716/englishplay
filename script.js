/* ============================================================
   ENGLISHPLAY — SCRIPT FINAL (SESSÕES + ZIG-ZAG)
   ============================================================ */

/* ====== UTILITÁRIOS ====== */

function $(id){ return document.getElementById(id); }

function dbLoad(){
    try{ return JSON.parse(localStorage.getItem("englishplay_db")) || { users:[] }; }
    catch{ return { users:[] }; }
}
function dbSave(db){ localStorage.setItem("englishplay_db", JSON.stringify(db)); }

function getSession(){
    try{ return JSON.parse(localStorage.getItem("englishplay_session")); }
    catch{ return null; }
}
function setSession(s){ localStorage.setItem("englishplay_session", JSON.stringify(s)); }

/* ============================================================
   VARIÁVEIS GLOBAIS
   ============================================================ */

let db = dbLoad();
let session = getSession();

/* ============================================================
   LOGIN / CADASTRO
   ============================================================ */

function openAuth(){
    $("overlay").classList.remove("hidden");
    $("authModal").classList.remove("hidden");
}

function closeAllModals(){
    document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"));
    $("overlay").classList.add("hidden");
}

function renderUserArea(){
    const ua = $("userArea");

    if(!session){
        ua.innerHTML = `<button onclick="openAuth()">Entrar</button>`;
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
            <h3 style="color:var(--yellow)">Visitante</h3>
            <p>Entre para ver sua conta.</p>
        `;
        return;
    }

    sb.innerHTML = `
        <img src="logo.png" class="profile-avatar">
        <h3>${session.username}</h3>
        <p style="color:var(--yellow)">🔥 ${session.streak || 0} dias</p>
        <p style="color:var(--accent)">⭐ XP: ${session.xp || 0}</p>
    `;
}

$("authLoginBtn").onclick = () => {
    const user = $("authUser").value.trim();
    const pass = $("authPass").value.trim();

    const found = db.users.find(u => u.username === user && u.pass === pass);

    if(!found){
        alert("Usuário ou senha incorretos");
        return;
    }

    session = found;
    setSession(session);
    closeAllModals();
    renderUserArea();
    renderSidebar();
    renderSessions();
};

$("authRegisterBtn").onclick = () => {
    const user = $("authUser").value.trim();
    const pass = $("authPass").value.trim();

    if(db.users.find(u=>u.username===user)){
        alert("Este nome já existe!");
        return;
    }

    const newUser = {
        id: Date.now(),
        username: user,
        pass: pass,
        completed: [],
        streak: 0,
        xp: 0,
        questionnaire: null
    };

    db.users.push(newUser);
    dbSave(db);

    session = newUser;
    setSession(session);

    closeAllModals();
    openQuestionnaire();
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

function openQuestionnaire(){
    $("overlay").classList.remove("hidden");
    $("questionModal").classList.remove("hidden");
}

$("finishQuestion").onclick = () => {
    session.questionnaire = {
        source: $("q_source").value,
        days: $("q_days").value,
        reason: $("q_reason").value,
        level: [...document.getElementsByName("q_level")].find(r=>r.checked).value
    };

    const idx = db.users.findIndex(u=>u.id===session.id);
    db.users[idx] = session;
    dbSave(db);

    closeAllModals();
    renderSessions();
};

/* ============================================================
   SISTEMA DE SESSÕES (10 × 20 AULAS)
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
   GERAR TODAS AS AULAS DO SITE
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

            <div class="lesson-tree" id="session${s}"></div>
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
                (
                    lessonNum === 1 ||
                    session.completed.includes(lessonNum - 1)
                );

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
                pageTransition("lesson.html?id="+lessonNum);
            };

            row.appendChild(circle);
            tree.appendChild(row);

            lessonNum++;
        }
    }
}

/* ============================================================
   TRANSIÇÃO ENTRE PÁGINAS
   ============================================================ */

function pageTransition(url){
    document.body.classList.add("fade-out");
    setTimeout(()=>{ location.href = url; }, 300);
}

/* adicionar estilo fade-out */
const style = document.createElement("style");
style.innerHTML = `
.fade-out {
    opacity: 0;
    transition: opacity .3s ease;
}
`;
document.head.appendChild(style);

/* ============================================================
   PESQUISA DE AMIGOS (VISUAL)
   ============================================================ */

$("searchUsers").oninput = () => {
    const box = $("searchUsers").value.trim().toLowerCase();
    const results = $("searchResults");

    if(box.length === 0){
        results.classList.add("hidden");
        return;
    }

    const filtered = db.users.filter(u=>u.username.toLowerCase().includes(box));

    results.innerHTML = filtered.map(u=>`
        <div style="padding:6px 10px;border-bottom:1px solid #222;">
            ${u.username}
        </div>
    `).join("");

    results.classList.remove("hidden");
};

/* ============================================================
   INIT
   ============================================================ */

renderUserArea();
renderSidebar();
renderSessions();

/* ============================================================
   FIM DO SCRIPT
   ============================================================ */
