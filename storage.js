/* ============================================================
   storage.js — Banco de Dados Local do EnglishPlay
   Sistema seguro, organizado e expansível.
============================================================ */

/* --------------------------
   CARREGAR BANCO
-------------------------- */
function load(key, defaultValue = null) {
    try {
        let data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.warn("Erro ao carregar:", key, e);
        return defaultValue;
    }
}

/* --------------------------
   SALVAR NO BANCO
-------------------------- */
function save(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("Erro ao salvar:", key, e);
    }
}

/* --------------------------
   BANCO PRINCIPAL
-------------------------- */
let DB = {
    users: load("users", {}),

    session: load("session", null),

    saveUsers() {
        save("users", this.users);
    },

    saveSession() {
        save("session", this.session);
    },

    /* --------------------------
       Criar novo usuário
    -------------------------- */
    createUser(name) {
        this.users[name] = {
            name,
            avatar: "logo.png",
            xp: 0,
            streak: 0,
            lessonsUnlocked: 1,
            questionnaireDone: false,
            friends: [],
            requests: [],
            nameChanges: 0
        };

        this.saveUsers();
        this.session = this.users[name];
        this.saveSession();
    },

    /* --------------------------
       Verificar se existe
    -------------------------- */
    exists(name) {
        return !!this.users[name];
    },

    /* --------------------------
       Login
    -------------------------- */
    login(name) {
        if (!this.users[name]) return false;
        this.session = this.users[name];
        this.saveSession();
        return true;
    },

    /* --------------------------
       Logout
    -------------------------- */
    logout() {
        this.session = null;
        this.saveSession();
    },

    /* --------------------------
       Reset total (opcional)
    -------------------------- */
    reset() {
        localStorage.clear();
        this.users = {};
        this.session = null;
    }
};
