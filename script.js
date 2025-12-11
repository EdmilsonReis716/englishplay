/* EnglishPlay — Front-end localStorage
   - Modais 100% corrigidos (nunca sobrepõem)
   - Layout alinhado
   - Pesquisa de amigos
   - Aulas com redirecionamento
   - Questionário com opções
   - Avatar personalizável
   - Desbloqueio de aulas com modal
*/

(() => {

  const DB_KEY = "englishplay_db_v3";
  const SESS_KEY = "englishplay_session_v3";

  // DOM
  const userArea = document.getElementById("userArea");
  const sidebar = document.getElementById("sidebar");
  const lessonsGrid = document.getElementById("lessonsGrid");

  const searchInput = document.getElementById("searchUsers");
  const searchResults = document.getElementById("searchResults");

  const overlay = document.getElementById("overlay");
  const authModal = document.getElementById("authModal");
  const questionModal = document.getElementById("questionModal");
  const paymentModal = document.getElementById("paymentModal");

  const authLoginBtn = document.getElementById("authLoginBtn");
  const authRegisterBtn = document.getElementById("authRegisterBtn");

  const finishQuestionBtn = document.getElementById("finishQuestion");

  let unlockTarget = null;

  // ------------ DATABASE ------------

  function defaultDB() {
    const lessons = {};
    for (let i = 1; i <= 200; i++) {
      lessons[i] = {
        id: i,
        title: "Aula " + i,
        content: "Conteúdo de exemplo da aula " + i
      };
    }
    return {
      users: [],
      lessons
    };
  }

  function dbLoad() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB();
    } catch (e) {
      return defaultDB();
    }
  }

  function dbSave(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESS_KEY));
    } catch (e) {
      return null;
    }
  }

  function setSession(u) {
    localStorage.setItem(SESS_KEY, JSON.stringify(u));
  }

  function clearSession() {
    localStorage.removeItem(SESS_KEY);
  }

  let db = dbLoad();
  let session = getSession();

  // ---------------- MODAL SYSTEM (CORRIGIDO) ----------------

  function closeAllModals() {
    authModal.classList.add("hidden");
    questionModal.classList.add("hidden");
    paymentModal.classList.add("hidden");
    overlay.classList.add("hidden");
  }

  function openModal(modal) {
    closeAllModals();
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  function openAuthModal() {
    openModal(authModal);
  }

  function openQuestionnaire() {
    openModal(questionModal);
  }

  function openPaymentModal() {
    openModal(paymentModal);
  }

  // ---------------- HEADER ----------------

  function renderHeader() {
    if (!session) {
      userArea.innerHTML = `
        <button class="nav-btn" id="topLoginBtn">Entrar</button>
      `;
      document.getElementById("topLoginBtn").onclick = openAuthModal;
      return;
    }

    userArea.innerHTML = `
      <span style="margin-right:8px">Olá, <b>${escape(session.username)}</b></span>
      <button class="nav-btn" id="profileBtn">Perfil</button>
      <button class="nav-btn" id="logoutBtn">Sair</button>
    `;

    document.getElementById("logoutBtn").onclick = () => {
      clearSession();
      session = null;
      renderAll();
    };
  }

  // ---------------- FRIEND SEARCH ----------------

  searchInput.addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      searchResults.classList.add("hidden");
      searchResults.innerHTML = "";
      return;
    }

    const matches = db.users.filter(u =>
      u.username.toLowerCase().includes(q)
    );

    searchResults.innerHTML = matches
      .map(
        u => `
      <div class="search-item">
        <div>
          <b>${escape(u.username)}</b>
        </div>
        <div>
          ${renderFriendButton(u)}
        </div>
      </div>
    `
      )
      .join("");

    searchResults.classList.remove("hidden");
  });

  function renderFriendButton(user) {
    if (!session) return `<button class="btn ghost" onclick="openAuthModal()">Entrar</button>`;
    if (session.id === user.id) return `<span style="color:#888">Você</span>`;

    const isFriend = session.friends?.includes(user.id);

    if (isFriend) {
      return `<button class="btn ghost">Amigo</button>`;
    }

    return `<button class="btn" onclick="sendFriendRequest(${user.id})">Adicionar</button>`;
  }

  window.sendFriendRequest = function (id) {
    if (!session) return openAuthModal();

    const user = db.users.find(u => u.id === id);
    if (!user) return;

    session.friends = session.friends || [];
    user.friends = user.friends || [];

    if (!session.friends.includes(id)) session.friends.push(id);
    if (!user.friends.includes(session.id)) user.friends.push(session.id);

    dbSave(db);
    setSession(session);
    renderAll();
  };

  // ---------------- REGISTER / LOGIN ----------------

  authLoginBtn.addEventListener("click", () => {
    const u = document.getElementById("authUser").value.trim();
    const p = document.getElementById("authPass").value.trim();

    if (!u || !p) return alert("Preencha tudo.");

    const user = db.users.find(x => x.username === u && x.password === p);
    if (!user) return alert("Usuário ou senha incorretos.");

    session = user;
    setSession(user);
    closeAllModals();
    renderAll();
  });

  authRegisterBtn.addEventListener("click", () => {
    const u = document.getElementById("authUser").value.trim();
    const p = document.getElementById("authPass").value.trim();

    if (!u || !p) return alert("Preencha tudo.");
    if (db.users.some(x => x.username === u)) return alert("Nome já existe.");

    const newUser = {
      id: Date.now(),
      username: u,
      password: p,
      avatar: null,
      unlocked: 5,
      completed: [],
      friends: []
    };

    db.users.push(newUser);
    dbSave(db);

    session = newUser;
    setSession(newUser);

    openQuestionnaire();
  });

  // ---------------- QUESTIONÁRIO ----------------

  finishQuestionBtn.addEventListener("click", () => {
    session.questionnaire = {
      source: document.getElementById("q_source").value,
      days: document.getElementById("q_days").value,
      reason: document.getElementById("q_reason").value,
      level: document.querySelector("input[name='q_level']:checked").value
    };

    dbSave(db);
    closeAllModals();
    renderAll();
  });

  // ---------------- LESSON GRID ----------------

  function renderLessons(filter = "all") {
    lessonsGrid.innerHTML = "";

    for (let i = 1; i <= 200; i++) {
      const lesson = db.lessons[i];
      const unlocked = session ? session.unlocked >= i : i <= 5;
      const done = session?.completed?.includes(i);

      if (filter === "locked" && unlocked) continue;
      if (filter === "done" && !done) continue;

      const div = document.createElement("div");
      div.className = "lesson-card" + (!unlocked ? " locked" : "") + (done ? " done" : "");

      div.innerHTML = `
        <div class="lesson-num">${unlocked ? i : "🔒"}</div>
        <div>${escape(lesson.title)}</div>
      `;

      div.onclick = () => {
        if (!unlocked) {
          unlockTarget = i;
          openPaymentModal();
          return;
        }
        location.href = "lesson.html?id=" + i;
      };

      lessonsGrid.appendChild(div);
    }
  }

  document.getElementById("viewFilter").addEventListener("change", e => {
    renderLessons(e.target.value);
  });

  // ---------------- PAGAMENTO SIMULADO ----------------

  document.getElementById("simulatePayBtn").onclick = () => {
    if (!session) return alert("Faça login antes.");

    session.unlocked = Math.max(session.unlocked, unlockTarget);
    dbSave(db);
    setSession(session);

    unlockTarget = null;
    closeAllModals();
    renderAll();
  };

  document.getElementById("closePayBtn").onclick = () => {
    unlockTarget = null;
    closeAllModals();
  };

  // ---------------- SIDEBAR ----------------

  function renderSidebar() {
    if (!session) {
      sidebar.innerHTML = `
        <div class="card">
          <h3>Bem-vindo!</h3>
          <p>Crie uma conta para salvar seu progresso.</p>
        </div>
      `;
      return;
    }

    sidebar.innerHTML = `
      <div class="card">
        <img src="${session.avatar || "logo.png"}" class="profile-avatar" />
        <h3>${escape(session.username)}</h3>
        <p>Aulas liberadas: ${session.unlocked}</p>
        <p>Concluídas: ${session.completed.length}</p>
        <button class="btn" id="changeAvatarBtn">Trocar foto</button>
      </div>
    `;

    document.getElementById("changeAvatarBtn").onclick = changeAvatar;
  }

  function changeAvatar() {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = e => {
      const f = e.target.files[0];
      if (!f) return;

      const r = new FileReader();
      r.onload = () => {
        session.avatar = r.result;
        dbSave(db);
        setSession(session);
        renderAll();
      };
      r.readAsDataURL(f);
    };
    inp.click();
  }

  // ---------------- HELPERS ----------------

  function escape(s) {
    return String(s).replace(/[&<>"]/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[c]));
  }

  // ---------------- RENDER ALL ----------------

  function renderAll() {
    db = dbLoad();
    session = getSession();
    renderHeader();
    renderSidebar();
    renderLessons();
  }

  // ---------------- INIT ----------------

  document.getElementById("btnCreate").onclick = openAuthModal;
  document.getElementById("btnLogin").onclick = openAuthModal;

  renderAll();

})();
// ==================================================
// ===============  LESSON PAGE HANDLER  ============
// ==================================================

if (location.pathname.includes("lesson.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const id = Number(params.get("id"));

    const titleEl = document.getElementById("lessonTitle");
    const contentEl = document.getElementById("lessonContent");
    const finishBtn = document.getElementById("finishLesson");

    let db = dbLoad();
    let session = getSession();

    if (!id || !db.lessons[id]) {
      titleEl.textContent = "Aula não encontrada";
      return;
    }

    titleEl.textContent = db.lessons[id].title;
    contentEl.textContent = db.lessons[id].content;

    // concluir aula
    finishBtn.onclick = () => {
      if (!session) {
        alert("Você precisa fazer login!");
        return;
      }

      session.completed = session.completed || [];
      if (!session.completed.includes(id)) {
        session.completed.push(id);
      }

      dbSave(db);
      setSession(session);

      // animação de confete ao finalizar
      fireConfetti();

      setTimeout(() => {
        location.href = "index.html";
      }, 1500);
    };
  });
}

// ==================================================
// ===============  CONFETTI EFFECT  =================
// ==================================================

function fireConfetti() {
  const body = document.body;
  const conf = document.createElement("div");
  conf.className = "confetti-container";

  for (let i = 0; i < 35; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    conf.appendChild(piece);
  }

  body.appendChild(conf);

  setTimeout(() => {
    conf.remove();
  }, 2000);
}

// ==================================================
// ===============  FIRE ANIMATION  ==================
// ==================================================

function renderFire() {
  const f = document.getElementById("fireIcon");

  if (!
// ==================================================
// ===============  UI / ANIMAÇÕES  =================
// ==================================================

// animação suave nos botões
document.addEventListener("mouseover", e => {
  if (e.target.classList.contains("btn")) {
    e.target.style.transform = "scale(1.06)";
  }
});
document.addEventListener("mouseout", e => {
  if (e.target.classList.contains("btn")) {
    e.target.style.transform = "scale(1)";
  }
});

// expandir / recolher sidebar (mobile)
const menuToggle = document.getElementById("toggleMenu");
if (menuToggle) {
  menuToggle.onclick = () => {
    sidebar.classList.toggle("open");
  };
}

// ==================================================
// ===============  CLOSE MODALS =====================
// ==================================================

overlay.onclick = () => {
  closeAllModals();
};

document.querySelectorAll(".closeModal").forEach(btn => {
  btn.onclick = closeAllModals;
});

// ==================================================
// ===============  FINAL INIT CHECK =================
// ==================================================

renderFire(); // animação inicial

console.log("%cEnglishPlay carregado com sucesso!", "color: yellow; font-size:16px");

