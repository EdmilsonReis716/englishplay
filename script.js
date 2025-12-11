/* ============================================================
   ENGLISHPLAY — SISTEMA DE AULAS ESTILO DUOLINGO
   PARTE 1/3 — ENGINE, CARREGAMENTO DA AULA, ESTRUTURA BASE
   ============================================================ */

(function () {

    /* =======================
       UTILITÁRIOS
    ======================= */

    function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        }[c]));
    }

    // carregar DB
    function dbLoad() {
        try {
            return JSON.parse(localStorage.getItem("englishplay_db_v3")) || {};
        } catch (e) {
            return {};
        }
    }

    // carregar sessão
    function getSession() {
        try {
            return JSON.parse(localStorage.getItem("englishplay_session_v3"));
        } catch (e) {
            return null;
        }
    }

    // atualizar sessão
    function setSession(s) {
        localStorage.setItem("englishplay_session_v3", JSON.stringify(s));
    }

    // salvar DB
    function dbSave(db) {
        localStorage.setItem("englishplay_db_v3", JSON.stringify(db));
    }

    /* =======================
       VARIÁVEIS DA AULA
    ======================= */

    let db = dbLoad();
    let session = getSession();

    let exerciseContainer;
    let verifyBtn;
    let progressBar;

    let lessonId = null;
    let currentExerciseIndex = 0;
    let exercises = [];

    /* =======================
       DEFINIÇÃO DOS TIPOS DE EXERCÍCIO
    ======================= */

    const LESSON_TEMPLATES = {

        // ✔ múltipla escolha
        multiple_choice: (question, options, answer) => ({
            type: "multiple_choice",
            question,
            options,
            answer
        }),

        // ✔ completar frase
        fill_blank: (sentence, answer) => ({
            type: "fill_blank",
            sentence,
            answer
        }),

        // ✔ arrastar e soltar (montar frase)
        drag_drop: (sentence, words) => ({
            type: "drag_drop",
            sentence,
            words,
            answer: sentence.split(" ")
        }),

        // ✔ tradução
        translate: (original, answer) => ({
            type: "translate",
            original,
            answer
        }),

        // ✔ ouvir e selecionar
        listen_choice: (text, options, answer) => ({
            type: "listen_choice",
            text,
            options,
            answer
        })
    };

    /* =======================
       GERAR EXERCÍCIOS PARA A AULA
    ======================= */

    function generateExercisesForLesson(lessonId) {

        // você pode mudar o conteúdo aqui depois
        return [
            LESSON_TEMPLATES.multiple_choice(
                "How are you?",
                ["Como vai você?", "Onde você mora?", "Qual é seu nome?", "Você está estudando?"],
                "Como vai você?"
            ),

            LESSON_TEMPLATES.fill_blank(
                "I ___ a student.",
                "am"
            ),

            LESSON_TEMPLATES.drag_drop(
                "I like learning English",
                ["English", "like", "learning", "I"]
            ),

            LESSON_TEMPLATES.listen_choice(
                "Good morning",
                ["Boa noite", "Bom dia", "Até logo"],
                "Bom dia"
            ),

            LESSON_TEMPLATES.translate(
                "I have a dog",
                "eu tenho um cachorro"
            )
        ];
    }

    /* =======================
       CARREGAR A AULA
    ======================= */

    function loadLesson() {

        if (!location.pathname.includes("lesson.html")) return;

        const params = new URLSearchParams(location.search);
        lessonId = Number(params.get("id"));

        exerciseContainer = document.getElementById("exerciseContainer");
        verifyBtn = document.getElementById("verifyBtn");
        progressBar = document.getElementById("progressBar");

        // gerar exercícios
        exercises = generateExercisesForLesson(lessonId);
        currentExerciseIndex = 0;

        renderExercise();
        updateProgress();
    }

    /* =======================
       ATUALIZAR BARRA DE PROGRESSO
    ======================= */

    function updateProgress() {
        const percent = ((currentExerciseIndex) / exercises.length) * 100;
        progressBar.style.width = percent + "%";
    }

    /* =======================
       RENDERIZAR EXERCÍCIO ATUAL
    ======================= */

    function renderExercise() {

        verifyBtn.disabled = true;
        const ex = exercises[currentExerciseIndex];

        switch (ex.type) {

            case "multiple_choice":
                renderMultipleChoice(ex);
                break;

            case "fill_blank":
                renderFillBlank(ex);
                break;

            case "drag_drop":
                renderDragDrop(ex);
                break;

            case "translate":
                renderTranslate(ex);
                break;

            case "listen_choice":
                renderListenChoice(ex);
                break;

            default:
                exerciseContainer.innerHTML = "Exercício inválido.";
        }
    }

    /* ============================================================
       A PARTIR DAQUI (PARTE 2), ENVIAREI OS RENDERIZADORES:
       - múltipla escolha
       - completar frase
       - drag & drop
       - tradução
       - ouvir e responder
       - sistema de verificação
       ============================================================ */

    window._lessonEngine = {
        loadLesson,
        renderExercise,
        updateProgress
    };

    // iniciar automaticamente
    loadLesson();

})();
/* ============================================================
   PARTE 2/3 — RENDERIZAÇÃO DOS EXERCÍCIOS
   ============================================================ */

let userAnswer = null;
let dragDropSlots = [];
let dragDropBank = [];

/* ============================
   1) MÚLTIPLA ESCOLHA
============================ */

function renderMultipleChoice(ex) {
    exerciseContainer.innerHTML = `
        <h2>${escapeHTML(ex.question)}</h2>
        <div class="options-grid" id="optionsGrid"></div>
    `;

    const grid = document.getElementById("optionsGrid");

    ex.options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = option;

        btn.onclick = () => {
            document.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            userAnswer = option;
            verifyBtn.disabled = false;
        };

        grid.appendChild(btn);
    });
}

/* ============================
   2) COMPLETAR FRASE
============================ */

function renderFillBlank(ex) {
    exerciseContainer.innerHTML = `
        <h2>Complete:</h2>
        <div class="fill-container">
            <span>${ex.sentence.replace("___", `<input id="fillInput" class='fill-input'>`)}</span>
        </div>
    `;

    const input = document.getElementById("fillInput");

    input.oninput = () => {
        userAnswer = input.value.trim().toLowerCase();
        verifyBtn.disabled = userAnswer === "";
    };
}

/* ============================
   3) DRAG & DROP — ARRANJAR PALAVRAS
============================ */

function renderDragDrop(ex) {
    exerciseContainer.innerHTML = `
        <h2>Monte a frase:</h2>

        <div class="drag-target" id="dragTarget"></div>
        <div class="drag-bank" id="dragBank"></div>
    `;

    dragDropSlots = [];
    dragDropBank = [];

    const target = document.getElementById("dragTarget");
    const bank = document.getElementById("dragBank");

    // embaralhar palavras
    const shuffled = [...ex.words].sort(() => Math.random() - 0.5);

    // slots alvo
    ex.answer.forEach(() => {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.dataset.filled = "false";
        target.appendChild(slot);
        dragDropSlots.push(slot);
    });

    // palavras clicáveis
    shuffled.forEach(word => {
        const w = document.createElement("div");
        w.className = "drag-word";
        w.textContent = word;

        w.onclick = () => {
            const emptySlot = dragDropSlots.find(s => s.dataset.filled === "false");
            if (!emptySlot) return;

            emptySlot.textContent = word;
            emptySlot.dataset.filled = "true";
            w.remove();

            checkDragStatus(ex);
        };

        bank.appendChild(w);
        dragDropBank.push(w);
    });
}

function checkDragStatus(ex) {
    const arr = dragDropSlots.map(s => s.textContent);
    if (arr.every(Boolean)) {
        userAnswer = arr.join(" ");
        verifyBtn.disabled = false;
    }
}

/* ============================
   4) TRADUÇÃO
============================ */

function renderTranslate(ex) {
    exerciseContainer.innerHTML = `
        <h2>Traduza:</h2>
        <p class="translate-original">${escapeHTML(ex.original)}</p>
        <textarea id="translateInput" class="translate-box" placeholder="Digite sua resposta..."></textarea>
    `;

    const input = document.getElementById("translateInput");

    input.oninput = () => {
        userAnswer = input.value.trim().toLowerCase();
        verifyBtn.disabled = userAnswer.length === 0;
    };
}

/* ============================
   5) OUVIR E RESPONDER
============================ */

function renderListenChoice(ex) {
    exerciseContainer.innerHTML = `
        <h2>Ouça e escolha a tradução correta:</h2>

        <button class="listen-btn" id="listenBtn">▶ Ouvir</button>

        <div class="options-grid" id="listenOptions"></div>
    `;

    const listenBtn = document.getElementById("listenBtn");

    listenBtn.onclick = () => speakText(ex.text);

    const grid = document.getElementById("listenOptions");

    ex.options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "opt-btn";
        btn.textContent = option;

        btn.onclick = () => {
            document.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            userAnswer = option;
            verifyBtn.disabled = false;
        };

        grid.appendChild(btn);
    });
}

/* ============================
   SISTEMA DE FALA (TTS)
============================ */

function speakText(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    window.speechSynthesis.speak(msg);
}

/* ============================================================
   NA PARTE 3/3:
   ✔ Sistema de verificação (correto/errado)
   ✔ Sons ✔ e ✘
   ✔ Próximo exercício
   ✔ Finalização da aula (confete + registrar progresso)
   ============================================================ */
/* ============================================================
   PARTE 3/3 — VERIFICAÇÃO, AVANÇO E FINALIZAÇÃO
   ============================================================ */

/* ============================
   SOM DE ACERTO E ERRO
============================ */

const correctSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"
);
const wrongSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/1384/1384-preview.mp3"
);

/* ============================
   VERIFICAR RESPOSTA
============================ */

verifyBtn.onclick = () => verifyAnswer();

function verifyAnswer() {

    const exercise = exercises[currentExerciseIndex];
    let correct = false;

    switch (exercise.type) {

        case "multiple_choice":
        case "listen_choice":
            correct = (userAnswer === exercise.answer);
            break;

        case "fill_blank":
            correct = (userAnswer === exercise.answer.toLowerCase());
            break;

        case "drag_drop":
            correct = (userAnswer === exercise.answer.join(" "));
            break;

        case "translate":
            correct = (userAnswer === exercise.answer.toLowerCase());
            break;
    }

    if (correct) {
        showCorrectFeedback();
    } else {
        showWrongFeedback();
    }
}

/* ============================
   FEEDBACK DE ACERTO
============================ */

function showCorrectFeedback() {

    correctSound.currentTime = 0;
    correctSound.play();

    exerciseContainer.classList.add("correctFlash");

    setTimeout(() => {
        exerciseContainer.classList.remove("correctFlash");
        nextExercise();
    }, 900);
}

/* ============================
   FEEDBACK DE ERRO
============================ */

function showWrongFeedback() {

    wrongSound.currentTime = 0;
    wrongSound.play();

    exerciseContainer.classList.add("wrongFlash");

    setTimeout(() => {
        exerciseContainer.classList.remove("wrongFlash");
    }, 900);
}

/* ============================
   IR PARA O PRÓXIMO EXERCÍCIO
============================ */

function nextExercise() {

    currentExerciseIndex++;

    if (currentExerciseIndex >= exercises.length) {
        finishLesson();
    } else {
        userAnswer = null;
        verifyBtn.disabled = true;
        renderExercise();
        updateProgress();
    }
}

/* ============================
   FINALIZAR AULA
============================ */

function finishLesson() {

    // registrar no progresso do usuário
    if (session) {
        session.completed = session.completed || [];

        if (!session.completed.includes(lessonId)) {
            session.completed.push(lessonId);
        }

        setSession(session);

        let db = dbLoad();
        let idx = db.users.findIndex(u => u.id === session.id);
        if (idx >= 0) db.users[idx] = session;
        dbSave(db);
    }

    // confete
    fireConfetti();

    exerciseContainer.innerHTML = `
        <h2 class="lesson-finished-title">Parabéns! 🎉</h2>
        <p class="lesson-finished-text">Você concluiu esta aula.</p>
        <button class="btn big-btn" onclick="location.href='index.html'">
            Voltar ao início
        </button>
    `;

    verifyBtn.style.display = "none";
}

/* ============================
   CONFETTI
============================ */

function fireConfetti() {
    const conf = document.createElement("div");
    conf.className = "confetti";

    for (let i = 0; i < 40; i++) {
        const p = document.createElement("div");
        p.className = "confetti-piece";
        p.style.left = Math.random() * 100 + "%";
        p.style.background = ["#f5c518", "#00ff80", "#fff"][Math.floor(Math.random() * 3)];
        conf.appendChild(p);
    }

    document.body.appendChild(conf);

    setTimeout(() => conf.remove(), 2000);
}

/* ============================
   FIM DA PARTE 3/3
============================ */

console.log("%cAula carregada com sucesso — Engine Duolingo ativada.", "color: yellow; font-size: 14px");
