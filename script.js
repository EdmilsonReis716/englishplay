/* ============================================
   SISTEMA GLOBAL – LOCALSTORAGE MANAGER
=============================================== */

const LS = {
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    load(key, def = null) {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : def;
    }
};


/* ============================================
   USUÁRIO ATUAL
=============================================== */

let currentUser = LS.load("currentUser", null);
let users = LS.load("users", {});


/* ============================================
   MOSTRAR / ESCONDER TELAS
=============================================== */

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}


/* ============================================
   LOGIN E CADASTRO
=============================================== */

function openLogin() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function login() {
    const name = document.getElementById("loginName").value;

    if (!users[name]) {
        alert("Usuário não encontrado!");
        return;
    }

    currentUser = users[name];
    LS.save("currentUser", currentUser);

    closeLogin();
    loadMain();
}

function register() {
    const name = document.getElementById("registerName").value;

    if (users[name]) {
        alert("Este nome já está em uso!");
        return;
    }

    users[name] = {
        name,
        xp: 0,
        streak: 0,
        lessonsUnlocked: 1,
        questionnaireDone: false
    };

    LS.save("users", users);

    alert("Conta criada!");
    document.getElementById("registerModal").style.display = "none";
}


/* ============================================
   LOGOUT
=============================================== */

function logout() {
    currentUser = null;
    LS.save("currentUser", null);
    showScreen("loginScreen");
}


/* ============================================
   QUESTIONÁRIO
=============================================== */

function openQuestionnaire() {
    document.getElementById("questionnaireModal").style.display = "flex";
}

function saveQuestionnaire() {
    if (!currentUser) return;

    currentUser.questionnaireDone = true;
    LS.save("currentUser", currentUser);

    document.getElementById("questionnaireModal").style.display = "none";
    loadMain();
}


/* ============================================
   CARREGAR PRINCIPAL
=============================================== */

function loadMain() {
    if (!currentUser) {
        showScreen("loginScreen");
        return;
    }

    if (!currentUser.questionnaireDone) {
        openQuestionnaire();
        return;
    }

    // Atualizar UI
    document.getElementById("navUser").innerText = currentUser.name;
    document.getElementById("profileName").innerText = currentUser.name;
    document.getElementById("xpCount").innerText = currentUser.xp;
    document.getElementById("streakCount").innerText = currentUser.streak;

    generateSessions();
    showScreen("mainScreen");
}


/* ============================================
   GERAR SESSÕES E LIÇÕES
=============================================== */

const sessionsData = [
    {
        title: "Fundamentos",
        lessons: 20
    },
    {
        title: "Vocabulário Básico",
        lessons: 20
    },
    {
        title: "Frases Comuns",
        lessons: 20
    },
    {
        title: "Gramática I",
        lessons: 20
    },
    {
        title: "Prática Escrita",
        lessons: 20
    },
    {
        title: "Conversação",
        lessons: 20
    },
    {
        title: "Intermediário I",
        lessons: 20
    },
    {
        title: "Intermediário II",
        lessons: 20
    },
    {
        title: "Avançado I",
        lessons: 20
    },
    {
        title: "Avançado II",
        lessons: 20
    }
];

function generateSessions() {
    const container = document.getElementById("sessionsContainer");
    container.innerHTML = "";

    let lessonNumber = 1;

    sessionsData.forEach((session, sIndex) => {
        const div = document.createElement("div");
        div.className = "section-box";

        div.innerHTML = `
            <h2 class="section-title">📘 Sessão ${sIndex + 1} — ${session.title}</h2>
            <div class="lessons-grid" id="sess${sIndex}"></div>
        `;

        const grid = div.querySelector(".lessons-grid");

        for (let i = 1; i <= session.lessons; i++) {
            const unlocked = lessonNumber <= currentUser.lessonsUnlocked;

            const circle = document.createElement("div");
            circle.className = "lesson-circle " + (unlocked ? "unlocked" : "");

            circle.innerHTML = unlocked ? lessonNumber : `<span class="lock-icon">🔒</span>`;

            if (unlocked) {
                circle.onclick = () => openLesson(lessonNumber);
            }

            grid.appendChild(circle);
            lessonNumber++;
        }

        container.appendChild(div);
    });
}


/* ============================================
   LIÇÕES
=============================================== */

function openLesson(n) {
    currentLesson = n;
    showScreen("lessonScreen");
    loadLesson(n);
}

let currentLesson = 1;

function loadLesson(n) {
    const title = document.getElementById("lessonTitle");
    title.innerText = `Lição ${n}`;

    // Randomizar tipo de lição:
    const types = ["arrastar", "escrever", "escolha"];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "arrastar") loadDragLesson();
    if (type === "escrever") loadWriteLesson();
    if (type === "escolha") loadChoiceLesson();
}


/* -------- LIÇÃO DE ARRASTAR PALAVRAS -------- */

function loadDragLesson() {
    const el = document.getElementById("lessonContent");
    const answer = "I like apples";

    const words = ["I", "like", "apples", "banana", "cat"];

    el.innerHTML = `
        <h3>Monte a frase correta:</h3>
        <div id="dragWords"></div>
        <div id="dropArea" class="drop-area"></div>
        <button class="btn-main" onclick="checkDrag('${answer}')">Verificar</button>
    `;

    const drag = document.getElementById("dragWords");

    words.forEach(w => {
        const b = document.createElement("div");
        b.className = "word-bubble";
        b.draggable = true;
        b.innerText = w;

        b.ondragstart = e => {
            e.dataTransfer.setData("text", w);
        };

        drag.appendChild(b);
    });

    const drop = document.getElementById("dropArea");

    drop.ondragover = e => e.preventDefault();
    drop.ondrop = e => {
        e.preventDefault();
        const w = e.dataTransfer.getData("text");
        drop.innerHTML += `<span class="word-bubble">${w}</span>`;
    };
}

function checkDrag(correct) {
    const result = [...document.querySelectorAll("#dropArea .word-bubble")]
        .map(e => e.innerText)
        .join(" ");

    feedback(result === correct);
}


/* -------- LIÇÃO DE ESCREVER -------- */

function loadWriteLesson() {
    const el = document.getElementById("lessonContent");

    el.innerHTML = `
        <h3>Traduza: "Gato"</h3
