/* ============================================================
   storage.js — Sistema de armazenamento central do EnglishPlay
   Gerencia:
   ✔ Usuários
   ✔ Sessão atual
   ✔ Progresso de aulas
   ✔ XP, streak
   ✔ Amigos e pedidos
============================================================ */


/* ------------------------------
   Atalhos úteis
------------------------------ */

const Store = {
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    load(key, fallback = null) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    }
};


/* ------------------------------
   Usuários e Sessão
------------------------------ */

// Todos os usuários registrados
let USERS = Store.load("users", {});

// Usuário logado atualmente
let SESSION = Store.load("currentUser", null);


/* ------------------------------
   Funções essenciais
------------------------------ */

function saveSession() {
    Store.save("currentUser", SESSION);
}

function saveUsers() {
    Store.save("users", USERS);
}

function getUser(name) {
    return USERS[name] || null;
}

function isLogged() {
    return SESSION !== null;
}


/* ============================================================
   LOGIN
============================================================ */

function loginUser(username) {
    if (!USERS[username]) return false;

    SESSION = USERS[username];
    saveSession();
    return true;
}


/* ============================================================
   REGISTRO
============================================================ */

function registerUser(username) {

    // Bloquear nomes repetidos
    if (USERS[username]) return false;

    USERS[username] = {
        name: username,
        avatar: "logo.png",
        xp: 0,
        streak: 0,
        lessonsUnlocked: 1,
        questionnaireDone: false,
        friends: [],
        requests: [],
        nameChanges: 0
    };

    saveUsers();

    SESSION = USERS[username];
    saveSession();

    return true;
}


/* ============================================================
   LOGOUT
============================================================ */

function logout() {
    SESSION = null;
    Store.save("currentUser", null);
    window.location.href = "auth.html";
}


/* ============================================================
   PROGRESSO DE AULAS
============================================================ */

function addXP(amount) {
    if (!SESSION) return;

    SESSION.xp += amount;
    USERS[SESSION.name] = SESSION;

    saveSession();
    saveUsers();
}

function unlockLesson(n) {
    if (!SESSION) return;

    SESSION.lessonsUnlocked = Math.max(SESSION.lessonsUnlocked, n);
    USERS[SESSION.name] = SESSION;

    saveSession();
    saveUsers();
}


/* ============================================================
   AMIGOS
============================================================ */

function sendFriendRequest(toUser) {
    if (!SESSION) return false;
    if (!USERS[toUser]) return false;

    let target = USERS[toUser];
    target.requests = target.requests || [];

    if (!target.requests.includes(SESSION.name)) {
        target.requests.push(SESSION.name);
        saveUsers();
    }

    return true;
}

function acceptFriendRequest(fromUser) {
    if (!SESSION) return false;

    SESSION.requests = SESSION.requests.filter(r => r !== fromUser);
    SESSION.friends.push(fromUser);

    USERS[fromUser].friends.push(SESSION.name);

    saveSession();
    saveUsers();
}


/* ============================================================
   NOME & AVATAR
============================================================ */

function updateAvatar(url) {
    if (!SESSION) return false;

    SESSION.avatar = url;
    USERS[SESSION.name] = SESSION;

    saveSession();
    saveUsers();
    return true;
}

function changeName(newName) {
    if (!SESSION) return false;

    // Nome já existe
    if (USERS[newName]) return "exists";

    // Limite de 3 trocas
    if (SESSION.nameChanges >= 3) return "limit";

    // Remover entrada antiga
    delete USERS[SESSION.name];

    SESSION.nameChanges++;
    SESSION.name = newName;

    USERS[newName] = SESSION;

    saveSession();
    saveUsers();

    return true;
}


/* ============================================================
   QUESTIONÁRIO
============================================================ */

function completeQuestionnaire() {
    if (!SESSION) return;

    SESSION.questionnaireDone = true;
    USERS[SESSION.name] = SESSION;

    saveSession();
    saveUsers();
}


/* Expor funções globalmente */

window.StorageEP = {
    USERS,
    SESSION,
    loginUser,
    registerUser,
    logout,
    addXP,
    unlockLesson,
    sendFriendRequest,
    acceptFriendRequest,
    updateAvatar,
    changeName,
    completeQuestionnaire
};
