/* EnglishPlay — updated front-end (localStorage)
   - cleaned accounts (DB starts empty)
   - removed IA
   - added friend search bar
   - lessons redirect to lesson.html?id=N
   - questionnaire uses options
   - more filled layout + animations
*/

(() => {
  const DB_KEY = 'englishplay_db_user_v2';
  const SESS_KEY = 'englishplay_session_v2';

  // DOM
  const userArea = document.getElementById('userArea');
  const searchInput = document.getElementById('searchUsers');
  const searchResults = document.getElementById('searchResults');
  const lessonsGrid = document.getElementById('lessonsGrid');
  const sidebar = document.getElementById('sidebar');
  const authModal = document.getElementById('authModal');
  const questionModal = document.getElementById('questionModal');

  // buttons
  document.getElementById('btnCreate').addEventListener('click', openAuthModal);
  document.getElementById('btnLogin').addEventListener('click', openAuthModal);

  const authLoginBtn = document.getElementById('authLoginBtn');
  const authRegisterBtn = document.getElementById('authRegisterBtn');

  const finishQuestionBtn = document.getElementById('finishQuestion');

  // payment modal controls
  const paymentModal = document.getElementById('paymentModal');
  const overlay = document.getElementById('overlay');

  // init db (empty users)
  function defaultDB(){
    const lessons = {};
    for(let i=1;i<=200;i++){
      lessons[i] = { id:i, title:`Aula ${i}`, content:`Conteúdo de exemplo da Aula ${i}` };
    }
    return { users: [], lessons, globalMessage: null };
  }
  function dbLoad(){ try { return JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB(); } catch { return defaultDB(); } }
  function dbSave(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  function sessionGet(){ try { return JSON.parse(localStorage.getItem(SESS_KEY)); } catch { return null; } }
  function sessionSet(u){ localStorage.setItem(SESS_KEY, JSON.stringify(u)); }
  function sessionClear(){ localStorage.removeItem(SESS_KEY); }

  let db = dbLoad();
  let session = sessionGet();

  // render header area (login/profile)
  function renderHeaderArea(){
    if(!session){
      userArea.innerHTML = `<button class="nav-btn" id="openAuthTop">Entrar / Cadastrar</button>`;
      document.getElementById('openAuthTop').onclick = openAuthModal;
    } else {
      userArea.innerHTML = `
        <span style="margin-right:8px">Olá, <b>${escapeHtml(session.username)}</b> ${session.verified? '✔':''}</span>
        <button class="nav-btn" id="openProfile">Perfil</button>
        <button class="nav-btn" id="logoutBtn">Sair</button>
      `;
      document.getElementById('openProfile').onclick = renderProfile;
      document.getElementById('logoutBtn').onclick = () => { sessionClear(); session=null; renderAll(); };
    }
  }

  // search friends
  searchInput.addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q){ searchResults.classList.add('hidden'); searchResults.innerHTML=''; return; }
    const matches = db.users.filter(u => u.username.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q)));
    if(matches.length === 0){
      searchResults.innerHTML = `<div>Nenhum usuário encontrado</div>`;
    } else {
      searchResults.innerHTML = matches.map(u => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:6px">
          <div><strong>${escapeHtml(u.username)}</strong><div style="font-size:12px;color:#9aa0a6">${escapeHtml(u.name||'')}</div></div>
          <div>${renderFriendButton(u)}</div>
        </div>
      `).join('');
    }
    searchResults.classList.remove('hidden');
  });

  function renderFriendButton(user){
    if(!session) return `<button class="btn ghost" onclick="openAuthModal()">Entrar</button>`;
    if(user.id === session.id) return '<span style="color:#9aa0a6">Você</span>';
    const isFriend = session.friends && session.friends.includes(user.id);
    if(isFriend) return `<button class="btn ghost" onclick="messageFriend(${user.id})">Mensagem</button>`;
    const requested = user.friendRequests && user.friendRequests.includes(session.id);
    if(requested) return `<button class="btn ghost">Pedido enviado</button>`;
    return `<button class="btn" onclick="sendFriendRequest(${user.id})">Adicionar</button>`;
  }

  window.sendFriendRequest = function(targetId){
    if(!session) return openAuthModal();
    const target = db.users.find(u => u.id === targetId);
    if(!target) return alert('Usuário não encontrado.');
    target.friendRequests = target.friendRequests || [];
    if(target.friendRequests.includes(session.id)) return alert('Pedido já enviado.');
    target.friendRequests.push(session.id);
    dbSave(db);
    alert('Pedido enviado (local).');
    renderAll();
  };

  window.messageFriend = function(id){
    alert('Mensagem local: função de chat real não implementada (demo).');
  };

  // open auth modal
  function openAuthModal(){
    authModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }
  function closeAuthModal(){ authModal.classList.add('hidden'); overlay.classList.add('hidden'); }

  // hook auth actions
  authLoginBtn && authLoginBtn.addEventListener('click', ()=>{
    const user = document.getElementById('authUser').value.trim();
    const pass = document.getElementById('authPass').value;
    if(!user || !pass) return alert('Preencha ambos');
    const u = db.users.find(x => (x.username===user || x.email===user) && x.password === pass);
    if(!u) return alert('Usuário ou senha incorretos');
    if(u.banned) return alert('Conta banida');
    session = u;
    sessionSet(session);
    closeAuthModal();
    renderAll();
  });

  authRegisterBtn && authRegisterBtn.addEventListener('click', ()=>{
    const user = document.getElementById('authUser').value.trim();
    const pass = document.getElementById('authPass').value;
    if(!user || !pass) return alert('Preencha ambos');
    if(db.users.some(u => u.username === user)) return alert('Nome de usuário já existe');
    const newUser = { id: Date.now(), username:user, name:'', password:pass, verified:false, isAdmin:false, banned:false, unlockedLessons:5, friends:[], friendRequests:[], bestFriendId:null, points:0, streak:0, avatar:null };
    db.users.push(newUser); dbSave(db);
    session = newUser; sessionSet(session);
    closeAuthModal();
    // show questionnaire modal
    document.getElementById('questionModal').classList.remove('hidden');
    overlay.classList.remove('hidden');
  });

  // finish questionnaire
  finishQuestionBtn && finishQuestionBtn.addEventListener('click', ()=>{
    if(!session) return;
    const q = document.getElementById('q_source').value;
    const days = document.getElementById('q_days').value;
    const reason = document.getElementById('q_reason').value;
    const level = Array.from(document.getElementsByName('q_level')).find(x=>x.checked).value;
    session.questionnaire = { source:q, days, reason, level };
    const idx = db.users.findIndex(u=>u.id===session.id);
    if(idx>=0) db.users[idx] = session;
    dbSave(db);
    document.getElementById('questionModal').classList.add('hidden');
    overlay.classList.add('hidden');
    renderAll();
  });

  // render lessons grid
  function renderLessons(filter='all'){
    const container = document.getElementById('lessonsGrid');
    container.innerHTML = '';
    for(let i=1;i<=200;i++){
      const lesson = db.lessons[i];
      const unlocked = session ? (session.unlockedLessons >= i) : (i<=5);
      const done = session && session.completed && session.completed.includes(i);
      if(filter==='locked' && unlocked) continue;
      if(filter==='done' && !done) continue;
      const card = document.createElement('div');
      card.className = 'lesson-card' + (done? ' done':'') + (unlocked? '' : ' locked');
      card.innerHTML = `<div class="lesson-num">${unlocked? i : '🔒'}</div><div class="lesson-title">${escapeHtml(lesson.title)}</div>`;
      card.onclick = () => {
        if(!unlocked){
          // open payment modal
          openPayment(i);
          return;
        }
        // redirect to lesson page
        location.href = `lesson.html?id=${i}`;
      };
      container.appendChild(card);
    }
  }

  // payment simulation
  let unlockTarget = null;
  function openPayment(i){
    unlockTarget = i;
    paymentModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }
  function closePayment(){
    unlockTarget = null;
    paymentModal.classList.add('hidden');
    overlay.classList.add('hidden');
  }
  document.getElementById('simulatePayBtn').addEventListener('click', ()=>{
    if(!session) return alert('Faça login para desbloquear.');
    if(!unlockTarget) return;
    session.unlockedLessons = Math.max(session.unlockedLessons, unlockTarget);
    const idx = db.users.findIndex(u=>u.id===session.id);
    if(idx>=0) db.users[idx] = session;
    dbSave(db);
    closePayment();
    renderAll();
    showConfetti();
  });
  document.getElementById('closePayBtn').addEventListener('click', closePayment);

  // render sidebar (profile / progress)
  function renderSidebar(){
    sidebar.innerHTML = '';
    if(!session){
      sidebar.innerHTML = `<div class="card"><h3>Bem-vindo</h3><p>Crie conta para salvar progresso.</p></div>`;
      return;
    }
    const completed = (session.completed || []).length;
    const unlocked = session.unlockedLessons || 5;
    sidebar.innerHTML = `
      <div class="card">
        <img src="${session.avatar || 'logo.png'}" class="profile-avatar" id="sidebarAvatar" />
        <h3>${escapeHtml(session.username)} ${session.verified? '✔':''}</h3>
        <p>Pontos: ${session.points || 0}</p>
        <p>Consecutivos: ${session.streak || 0}</p>
        <p>Destravadas: ${unlocked}</p>
        <p>Concluídas: ${completed}</p>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:center">
          <button class="btn" id="editAvatar">Trocar foto</button>
          <button class="btn ghost" id="viewFriends">Amigos</button>
        </div>
      </div>
    `;
    document.getElementById('editAvatar').addEventListener('click', ()=> avatarUpload());
    document.getElementById('viewFriends').addEventListener('click', renderFriends);
  }

  // avatar upload (DataURL)
  function avatarUpload(){
    const input = document.createElement('input');
    input.type='file'; input.accept='image/*';
    input.onchange = e => {
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = () => {
        session.avatar = r.result;
        const idx = db.users.findIndex(u=>u.id===session.id);
        if(idx>=0) db.users[idx] = session;
        dbSave(db);
        renderSidebar();
        renderHeaderArea();
      };
      r.readAsDataURL(f);
    };
    input.click();
  }

  function renderFriends(){
    if(!session) return openAuthModal();
    const friendsList = (session.friends || []).map(id => {
      const u = db.users.find(x=>x.id===id);
      return `<div style="display:flex;justify-content:space-between;padding:6px 8px">${escapeHtml(u.username)} <button class="btn ghost" onclick="removeFriend(${u.id})">Remover</button></div>`;
    }).join('') || '<div>Nenhum amigo</div>';
    sidebar.innerHTML = `<div class="card"><h3>Amigos</h3>${friendsList}<div style="margin-top:8px"><button class="btn" onclick="renderHomeInline()">Voltar</button></div></div>`;
  }
  window.removeFriend = function(id){
    session.friends = (session.friends||[]).filter(x=>x!==id);
    const idx = db.users.findIndex(u=>u.id===session.id);
    if(idx>=0) db.users[idx] = session;
    dbSave(db); renderSidebar();
  };

  // render profile quick
  function renderProfile(){
    if(!session) return openAuthModal();
    const best = session.bestFriendId ? (db.users.find(u=>u.id===session.bestFriendId)?.username || '-') : '-';
    main.innerHTML = `<div class="card"><h2>Perfil</h2><img src="${session.avatar||'logo.png'}" class="profile-avatar"/><p>Usuário: ${escapeHtml(session.username)}</p><p>Melhor amigo: ${escapeHtml(best)}</p><div style="margin-top:10px"><button class="btn" onclick="renderAll()">Voltar</button></div></div>`;
  }

  window.renderHomeInline = function(){ renderAll(); };

  // small helpers
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // confetti
  function showConfetti(){
    for(let i=0;i<20;i++){
      const el = document.createElement('div');
      el.style.position='fixed'; el.style.left = (10 + Math.random()*80) + '%';
      el.style.top = '0px'; el.style.width='8px'; el.style.height='12px';
      el.style.background = ['#ffd54a','#f5c518','#00ff80'][Math.floor(Math.random()*3)];
      el.style.zIndex = 9999; document.body.appendChild(el);
      setTimeout(()=>{ el.style.transition='1.2s'; el.style.transform = `translateY(${window.innerHeight}px)`; el.style.opacity=0; setTimeout(()=>el.remove(),1200); },20);
    }
  }

  // open/close modals - generic (overlay)
  function openAuthModal(){ authModal.classList.remove('hidden'); overlay.classList.remove('hidden'); }
  function closeAuthModal(){ authModal.classList.add('hidden'); overlay.classList.add('hidden'); }

  // render all main UI
  function renderAll(){
    db = dbLoad();
    renderHeaderArea();
    renderSidebar();
    renderLessons(document.getElementById('viewFilter') ? document.getElementById('viewFilter').value : 'all');
  }

  // view filter change
  document.getElementById('viewFilter').addEventListener('change', (e)=> renderLessons(e.target.value));

  // initial boot: ensure db exists
  (function boot(){
    if(!db || !db.lessons) db = defaultDB();
    // NOTE: db.users is empty by design (you asked to remove default accounts)
    // but keep an admin helper available if you create 'Administrador.EnglishPlay' manually
    dbSave(db);
    renderAll();
  })();

  // public actions for onclick strings
  window.openAuthModal = openAuthModal;
  window.renderAll = renderAll;
  window.renderProfile = renderProfile;
  window.openPayment = openPayment;
  window.sendFriendRequest = sendFriendRequest;

  // redirect helper: the click handles redirect to lesson.html?id=N
})();
