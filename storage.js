/* ============================================================
   SISTEMA DE STORAGE — ENGLISHPLAY
   Totalmente refeito e otimizado
============================================================ */

/* ===========================
   CHAVES DO LOCALSTORAGE
=========================== */

const KEY_USERS = "englishplay_users";
const KEY_LOGGED = "englishplay_logged_user";

/* ===========================
   FUNÇÕES BÁSICAS
=========================== */

function loadUsers() {
    return JSON.parse(localStorage.getItem(KEY_USERS)) || {};
}

function saveUsers(obj) {
    localStorage.setItem(KEY_USERS, JSON.stringify(obj));
}

function getLoggedUser() {
    return localStorage.getItem(KEY_LOGGED);
}

function setLoggedUser(username) {
    localStorage.setItem(KEY_LOGGED, username);
}

function logout() {
    localStorage.removeItem(KEY_LOGGED);
    window.location.href = "auth.html";
}

/* ===========================
   CRIAÇÃO DE CONTA
=========================== */

function createUser(username) {
    let users = loadUsers();

    if (users[username]) {
        return { ok: false, message: "Nome já existe!" };
    }

    users[username] = {
        name: username,
        xp: 0,
        streak: 0,
        lastLogin: null,
        lessonsUnlocked: { "1": true }, // Sempre começa com lição 1 liberada
        completedLessons: {},
        questionario: null,
        friends: [],
        mascot: "default", // usado depois
        createdAt: Date.now()
    };

    saveUsers(users);

    return { ok: true };
}

/* ===========================
   LOGIN
=========================== */

function loginUser(username) {
    const users = loadUsers();

    if (!users[username]) {
        return { ok: false, message: "Usuário não encontrado" };
    }

    // Atualizar streak
    let user = users[username];
    let today = new Date().toDateString();

    if (user.lastLogin !== today) {
        let yesterday = new Date(Date.now() - 86400000).toDateString();

        // Se logou ontem → streak+
        if (user.lastLogin === yesterday) {
            user.streak += 1;
        } else {
            user.streak = 1;
        }
        user.lastLogin = today;
    }

    saveUsers(users);

    setLoggedUser(username);
    return { ok: true };
}

/* ===========================
   QUESTIONÁRIO
=========================== */

function saveQuestionario(answers) {
    let users = loadUsers();
    let user = users[getLoggedUser()];

    if (!user) return;

    user.questionario = answers;
    saveUsers(users);
}

/* ===========================
   SISTEMA DE LIÇÕES
=========================== */

function unlockLesson(user, lessonId) {
    let users = loadUsers();
    let u = users[user];

    u.lessonsUnlocked[lessonId] = true;
    saveUsers(users);
}

function completeLesson(lessonId, gainedXP = 10) {
    let users = loadUsers();
    let user = users[getLoggedUser()];
    if (!user) return;

    user.completedLessons[lessonId] = true;
    user.xp += gainedXP;

    // desbloqueia a próxima lição automaticamente
    let next = Number(lessonId) + 1;
    user.lessonsUnlocked[next] = true;

    saveUsers(users);
}

/* ===========================
   AMIZADES
=========================== */

function addFriend(friendName) {
    let users = loadUsers();
    let me = users[getLoggedUser()];

    if (!users[friendName]) {
        return { ok: false, message: "Usuário não existe!" };
    }

    if (me.friends.includes(friendName)) {
        return { ok: false, message: "Já é seu amigo!" };
    }

    me.friends.push(friendName);
    saveUsers(users);

    return { ok: true };
}

/* ===========================
   PERIL E RANKING
=========================== */

function getUserData(username) {
    let users = loadUsers();
    return users[username] || null;
}

function getRanking() {
    let users = loadUsers();
    let arr = Object.values(users);
    arr.sort((a, b) => b.xp - a.xp);
    return arr;
}

/* ===========================
   SISTEMA DE MASCOTES
=========================== */

function setMascot(name) {
    let users = loadUsers();
    let user = users[getLoggedUser()];
    if (!user) return;
    
    user.mascot = name;
    saveUsers(users);
}

/* ===========================
   DEBUG (opcional)
=========================== */

function resetAll() {
    localStorage.removeItem(KEY_USERS);
    localStorage.removeItem(KEY_LOGGED);
    location.reload();
}
