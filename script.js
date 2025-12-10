/* =========================================================
   EnglishPlay - Front-end complete (localStorage)
   Features:
    - Auth (local visual)
    - Questionnaire
    - Zig-zag lesson tree (200)
    - Sr.TV offline chat + responses
    - Simulated payment unlocking
    - Profile (avatar upload via DataURL)
    - Admin visual (ban/unban, global message, edit lessons)
    - Friends (local) + best friend marker
    - Confetti + unlock animation
   Note: All data stored in localStorage (no backend)
   ========================================================= */

(() => {
  // Storage keys
  const DB_KEY = 'englishplay_db_final_v1';
  const SESS_KEY = 'englishplay_session_final_v1';

  // DOM refs
  const main = document.getElementById('main');
  const userArea = document.getElementById('userArea');
  const overlay = document.getElementById('overlay');
  const chatModal = document.getElementById('chatModal');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const paymentModal = document.getElementById('paymentModal');
  const simulatePayBtn = document.getElementById('simulatePayBtn');
  const closePayBtn = document.getElementById('closePayBtn');
  const avatarFile = document.getElementById('avatarFile');
  const unlockAnim = document.getElementById('unlockAnim');

  // ensure DOM elements exist before using
  function $(id){ return document.getElementById(id); }

  // default db
  function defaultDB(){
    const lessons = {};
    for(let i=1;i<=200;i++) lessons[i] = { id:i, title:`Aula ${i}`, content:`Conteúdo de exemplo da Aula ${i}` };
    return {
      users: [
        { id: 1, username: 'Junior', name:'Junior', password:'123', verified:false, isAdmin:false, banned:false, unlockedLessons:5, friends:[], friendRequests:[], bestFriendId:null, points:0, streak:0, avatar:null }
      ],
      lessons,
      globalMessage: null
    };
  }

  function dbLoad(){
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || defaultDB(); } catch { return defaultDB(); }
  }
  function dbSave(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  function sessionGet(){ try { return JSON.parse(localStorage.getItem(SESS_KEY)); } catch { return null; } }
  function sessionSet(u){ localStorage.setItem(SESS_KEY, JSON.stringify(u)); }
  function sessionClear(){ localStorage.removeItem(SESS_KEY); }

  // global state
  let db = dbLoad();
  let session = sessionGet(); // user object (snapshot)

  // overlay click closes modals
  overlay.addEventListener('click', ()=>{ closeChat(); closePayment(); });

  /* ================= Header / user area ================ */
  function renderHeader(){
    if(!session){
      userArea.innerHTML = `<button class="nav-btn" id="enterBtn">Entrar / Cadastrar</button>`;
      $('enterBtn').onclick = renderAuth;
      return;
    }
    userArea.innerHTML = `
      <span style="margin-right:8px">Olá, <b>${escape(session.username)}</b> ${session.verified? '✔':''}</span>
      <button class="nav-btn" id="btnProfile">Perfil</button>
      ${session.isAdmin? `<button class="nav-btn" id="btnAdmin">Admin</button>` : ''}
      <button class="nav-btn" id="btnChat">Sr.TV</button>
      <button class="nav-btn" id="btnLogout">Sair</button>
    `;
    $('btnProfile').onclick = renderProfile;
    if(session.isAdmin) $('btnAdmin').onclick = renderAdmin;
    $('btnChat').onclick = openChat;
    $('btnLogout').onclick = () => { sessionClear(); session = null; renderAuth(); renderHeader(); };
  }

  /* ================= Utility ================ */
  function escape(s){ return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function saveAll(){ dbSave(db); if(session) sessionSet(session); else sessionClear(); }

  /* ================= Auth / Register ================ */
  function renderAuth(){
    renderHeader();
    main.innerHTML = `
      <div class="card">
        <h2>Login</h2>
        <input id="loginUser" placeholder="Usuário ou email" />
        <input id="loginPass" type="password" placeholder="Senha" />
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn" id="btnLogin">Entrar</button>
          <button class="btn ghost" id="btnToReg">Criar Conta</button>
        </div>
      </div>
    `;
    $('btnToReg').onclick = renderRegister;
    $('btnLogin').onclick = () => {
      const user = $('loginUser').value.trim();
      const pass = $('loginPass').value;
      const u = db.users.find(x => (x.username === user || x.email === user) && x.password === pass);
      if(!u) return alert('Usuário ou senha incorretos.');
      if(u.banned) return alert('Conta banida.');
      session = u;
      sessionSet(session);
      renderHome();
      renderHeader();
    };
  }

  function renderRegister(){
    renderHeader();
    main.innerHTML = `
      <div class="card">
        <h2>Cadastrar</h2>
        <input id="regUser" placeholder="Nome de usuário" />
        <input id="regName" placeholder="Nome (apelido)" />
        <input id="regPass" type="password" placeholder="Senha" />
        <input id="regPass2" type="password" placeholder="Confirmar senha" />
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn" id="btnCreate">Criar</button>
          <button class="btn ghost" id="btnBack">Voltar</button>
        </div>
      </div>
    `;
    $('btnBack').onclick = renderAuth;
    $('btnCreate').onclick = () => {
      const username = $('regUser').value.trim();
      const name = $('regName').value.trim();
      const p1 = $('regPass').value;
      const p2 = $('regPass2').value;
      if(!username || !p1) return alert('Preencha os campos.');
      if(p1 !== p2) return alert('Senhas não coincidem.');
      if(db.users.some(u => u.username === username)) return alert('Usuário já existe.');
      const isAdmin = username === 'Administrador.EnglishPlay';
      const newUser = { id: Date.now(), username, name, password:p1, verified:isAdmin, isAdmin, banned:false, unlockedLessons:5, friends:[], friendRequests:[], bestFriendId:null, points:0, streak:0, avatar:null };
      db.users.push(newUser);
      saveAll();
      session = newUser;
      sessionSet(session);
      // show questionnaire
      renderQuestionnaire();
      renderHeader();
    };
  }

  /* ================= Questionnaire ================ */
  function renderQuestionnaire(){
    main.innerHTML = `
      <div class="card">
        <h2>Questionário</h2>
        <label>Como ficou sabendo do EnglishPlay?</label><input id="q1" placeholder="Ex: Instagram">
        <label>Meta diária de dias consecutivos?</label><input id="q2" placeholder="Ex:7">
        <label>Para que quer aprender inglês?</label><input id="q3" placeholder="Ex: Trabalho">
        <label>Quanto entende de inglês?</label>
        <select id="q4"><option value="nada">Não sei nada</option><option value="pouco">Pouco</option><option value="basico">Conversas básicas</option><option value="fluente">Fluente</option></select>
        <div style="margin-top:10px;text-align:right"><button class="btn" id="finishQ">Finalizar</button></div>
      </div>
    `;
    $('finishQ').onclick = () => {
      const u = session;
      if(!u) return renderAuth();
      u.questionnaire = { source:$('q1').value, goal:$('q2').value, reason:$('q3').value, level:$('q4').value };
      // update db user
      const idx = db.users.findIndex(x=>x.id===u.id);
      if(idx>=0) db.users[idx] = u;
      saveAll();
      renderHome();
    };
  }

  /* ================= Home + Zig-zag tree ================ */
  function renderHome(){
    if(!session) return renderAuth();
    // show banner if global message active
    if(db.globalMessage && db.globalMessage.active){
      main.innerHTML = `<div class="card"><strong style="color:var(--yellow)">Aviso:</strong> ${escapeHtml(db.globalMessage.text)}</div>`;
    } else main.innerHTML = '';

    let html = `
      <div class="card">
        <h2>Bem-vindo, ${escapeHtml(session.username)} ${session.verified? '✔':''}</h2>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="nav-btn" onclick="renderProfile()">Perfil</button>
          ${session.isAdmin? `<button class="nav-btn" onclick="renderAdmin()">Admin</button>` : ''}
          <button class="nav-btn" onclick="openChat()">Falar (Sr.TV)</button>
          <button class="nav-btn" onclick="logout()">Sair</button>
        </div>
      </div>
      <div class="card">
        <h3>Aulas (200)</h3>
        <div id="treeRoot" class="lesson-tree"></div>
      </div>
    `;
    main.insertAdjacentHTML('beforeend', html);
    renderHeader();
    renderTree();
  }

  function renderTree(){
    const root = document.getElementById('treeRoot');
    root.innerHTML = '';
    for(let i=1;i<=200;i++){
      const l = db.lessons[i];
      const left = (i % 2 === 1); // zig-zag: odd left, even right
      const row = document.createElement('div');
      row.className = 'row';
      row.style.justifyContent = left ? 'flex-start' : 'flex-end';
      const spacer = document.createElement('div'); spacer.className = 'spacer';
      const node = document.createElement('div');
      node.className = 'node';
      const unlocked = session.unlockedLessons >= i;
      if(!unlocked) node.classList.add('locked');
      if(session.completed && session.completed.includes(i)) node.classList.add('done');
      node.dataset.idx = i;
      node.innerText = unlocked ? (session.completed && session.completed.includes(i) ? '✔' : String(i)) : '🔒';
      node.onclick = () => onNodeClick(i);
      // assemble
      row.appendChild(spacer);
      row.appendChild(node);
      root.appendChild(row);
      const connector = document.createElement('div');
      connector.className = 'connector';
      root.appendChild(connector);
    }
  }

  function onNodeClick(i){
    const unlocked = session.unlockedLessons >= i;
    if(!unlocked){ openPayment(i); return; }
    // Show lesson content modal (simple alert for now)
    const content = db.lessons[i].content || `Conteúdo da Aula ${i}`;
    // Mark done and unlock next
    if(!session.completed) session.completed = [];
    if(!session.completed.includes(i)) session.completed.push(i);
    if(session.unlockedLessons < 200) session.unlockedLessons = Math.max(session.unlockedLessons, i+1);
    // update db
    const idx = db.users.findIndex(u=>u.id===session.id);
    if(idx>=0) db.users[idx] = session;
    saveAll();
    showCorrectFeedback(() => {
      renderTree();
      renderHeader();
    });
    alert(`Aula ${i}\n\n${content}`);
  }

  /* ================= Payment simulation ================ */
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
  simulatePayBtn && simulatePayBtn.addEventListener('click', ()=> {
    if(!unlockTarget) return;
    // unlock locally
    session.unlockedLessons = Math.max(session.unlockedLessons, unlockTarget);
    // update db
    const idx = db.users.findIndex(u=>u.id===session.id);
    if(idx>=0) db.users[idx] = session;
    saveAll();
    closePayment();
    showConfetti();
    showUnlock();
    renderHome();
  });
  closePayBtn && closePayBtn.addEventListener('click', closePayment);

  /* ================= Profile ================ */
  function renderProfile(){
    if(!session) return renderAuth();
    const bestText = session.bestFriendId ? (db.users.find(u=>u.id===session.bestFriendId)?.username || '-') : '-';
    main.innerHTML = `
      <div class="card profile-card">
        <img src="${session.avatar || 'logo.png'}" class="profile-avatar" id="profileAvatar" onerror="this.style.display='none'"/>
        <h2>${escapeHtml(session.username)} ${session.verified? '✔':''}</h2>
        <p>Status: ${session.banned? 'Banido' : 'Ativo'}</p>
        <p>Dias consecutivos: ${session.streak || 0}</p>
        <p>Pontos: ${session.points || 0}</p>
        <p>Melhor amigo: ${escapeHtml(bestText)}</p>
        <div style="margin-top:12px">
          <button class="nav-btn" id="changeAvatarBtn">Trocar foto</button>
          <button class="nav-btn" id="backHomeBtn">Voltar</button>
        </div>
      </div>
    `;
    document.getElementById('backHomeBtn').onclick = renderHome;
    document.getElementById('changeAvatarBtn').onclick = ()=> avatarFile.click();
  }

  avatarFile && avatarFile.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      session.avatar = reader.result;
      const idx = db.users.findIndex(u=>u.id===session.id);
      if(idx>=0) db.users[idx] = session;
      saveAll();
      renderProfile();
      renderHeader();
    };
    reader.readAsDataURL(f);
  });

  /* ================= Admin (visual) ================ */
  function renderAdmin(){
    if(!session || !session.isAdmin) return alert('Acesso negado: admin.');
    let usersHtml = db.users.map(u=>{
      return `<div class="user-row"><div>${escapeHtml(u.username)} ${u.verified? '✔':''} ${u.banned? '<span style="color:red">(Banido)</span>': ''}</div>
        <div>${u.username!=='Administrador.EnglishPlay' ? (u.banned? `<button class="btn small" onclick="unban(${u.id})">Desbanir</button>` : `<button class="btn small" onclick="ban(${u.id})">Banir</button>`) : ''}</div>
      </div>`;
    }).join('');
    main.innerHTML = `
      <div class="card">
        <h2>Painel Admin</h2>
        <button class="btn ghost" onclick="renderHome()">Voltar</button>
        <h3 style="margin-top:12px">Usuários</h3>
        ${usersHtml}
        <h3 style="margin-top:12px">Mensagem Global</h3>
        <textarea id="globalMsg" style="width:100%;height:80px">${db.globalMessage?.text||''}</textarea>
        <div style="margin-top:8px"><button class="btn" onclick="publishGlobal()">Publicar</button></div>
        <h3 style="margin-top:12px">Editar Aulas (JSON)</h3>
        <textarea id="lessonEdit" style="width:100%;height:160px">${JSON.stringify(db.lessons, null, 2)}</textarea>
        <div style="margin-top:8px"><button class="btn" onclick="saveLessons()">Salvar</button></div>
        <h3 style="margin-top:12px">Estatísticas</h3>
        <div id="statsArea"></div>
      </div>
    `;
    renderStats();
  }

  window.ban = function(id){
    const u = db.users.find(x=>x.id===id);
    if(!u) return;
    u.banned = true;
    dbSave(db);
    renderAdmin();
  };
  window.unban = function(id){
    const u = db.users.find(x=>x.id===id);
    if(!u) return;
    u.banned = false;
    dbSave(db);
    renderAdmin();
  };

  function publishGlobal(){
    db.globalMessage = { text: document.getElementById('globalMsg').value, active: true };
    dbSave(db);
    alert('Mensagem publicada.');
  }
  function saveLessons(){
    try{
      const parsed = JSON.parse(document.getElementById('lessonEdit').value);
      db.lessons = parsed;
      dbSave(db);
      alert('Aulas atualizadas localmente.');
    }catch(e){ alert('JSON inválido'); }
  }
  function renderStats(){
    const stats = document.getElementById('statsArea');
    const total = db.users.length;
    const banned = db.users.filter(u=>u.banned).length;
    const unlockedSum = db.users.reduce((s,u)=>s+(u.unlockedLessons||0),0);
    stats.innerHTML = `<p>Total usuários: ${total}</p><p>Banidos: ${banned}</p><p>Total de aulas desbloqueadas (soma): ${unlockedSum}</p>`;
  }

  /* ================= Friends system (visual) ================ */
  function renderSearchBar(){
    // inserted at top of home optionally: not necessary here
  }
  window.sendFriendRequest = function(targetId){
    const target = db.users.find(u=>u.id===targetId);
    if(!target) return alert('Usuário não encontrado.');
    if(!target.friendRequests) target.friendRequests = [];
    if(target.friendRequests.includes(session.id)) return alert('Pedido já enviado.');
    target.friendRequests.push(session.id);
    dbSave(db);
    alert('Pedido de amizade enviado.');
  };
  window.acceptFriend = function(id){
    const me = db.users.find(u=>u.id===session.id);
    const other = db.users.find(u=>u.id===id);
    if(!me || !other) return;
    me.friends = me.friends || []; other.friends = other.friends || [];
    if(!me.friends.includes(id)) me.friends.push(id);
    if(!other.friends.includes(me.id)) other.friends.push(me.id);
    other.friendRequests = (other.friendRequests||[]).filter(x=>x!==me.id);
    dbSave(db);
    session = me; sessionSet(session);
    alert('Amizade aceita.');
  };

  /* ================= Chat Sr.TV (offline) ================ */
  function openChat(){
    chatMessages.innerHTML = '';
    chatModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    appendAi('Olá! Eu sou o Sr.TV — posso ajudar com gramática, vocabulário, tradução e suporte do app.');
  }
  function closeChat(){
    chatModal.classList.add('hidden');
    overlay.classList.add('hidden');
  }
  function appendUser(msg){
    const el = document.createElement('div'); el.className='msg-user'; el.innerText = msg; chatMessages.appendChild(el); chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function appendAi(msg){
    const el = document.createElement('div'); el.className='msg-ai'; el.innerText = msg; chatMessages.appendChild(el); chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  sendChatBtn && sendChatBtn.addEventListener('click', ()=>{
    const txt = chatInput.value.trim(); if(!txt) return;
    appendUser(txt); chatInput.value='';
    setTimeout(()=> appendAi(srTvBrain(txt)), 250);
  });
  closeChatBtn && closeChatBtn.addEventListener('click', closeChat);

  function srTvBrain(msg){
    const t = msg.toLowerCase();
    if(t.includes('oi')||t.includes('olá')) return 'Olá! Em que posso ajudar?';
    if(t.includes('word')) return "A palavra 'word' significa 'palavra'.";
    if(t.includes('present perfect')) return 'Present perfect = have/has + past participle.';
    if(t.includes('o que significa')) {
      const w = msg.replace(/o que significa/i,'').trim();
      if(!w) return 'Diga "o que significa X".';
      return `Tradução aproximada de "${w}": ${srTvTranslate(w)}`;
    }
    if(t.includes('pagar')||t.includes('pix')) return 'Pagamentos são simulados aqui. Use o modal de desbloqueio.';
    return 'Desculpe, não entendi exatamente. Pergunte sobre vocabulário, gramática ou funcionamento do app.';
  }
  function srTvTranslate(w){
    const d = { hello:'olá', dog:'cachorro', cat:'gato', house:'casa', apple:'maçã', school:'escola' };
    return d[w.toLowerCase()] || 'tradução não disponível no dicionário local.';
  }

  /* ================ Visual feedbacks ================ */
  function showConfetti(){
    for(let i=0;i<20;i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random()*window.innerWidth + 'px';
      el.style.top = '0px';
      el.style.width = '8px';
      el.style.height = '12px';
      el.style.background = ['#ffd54a','#f5c518','#00ff80'][Math.floor(Math.random()*3)];
      el.style.zIndex = 9999;
      document.body.appendChild(el);
      setTimeout(()=>{ el.style.transition='1.2s'; el.style.transform = `translateY(${window.innerHeight}px)`; el.style.opacity=0; setTimeout(()=>el.remove(),1200); },10);
    }
  }
  function showUnlock(){
    unlockAnim.classList.remove('hidden');
    unlockAnim.innerHTML = `<div style="background:var(--card);border:3px solid var(--yellow);padding:18px;border-radius:12px">🔓 Aula desbloqueada!</div>`;
    setTimeout(()=>{ unlockAnim.classList.add('hidden'); unlockAnim.innerHTML=''; },1500);
  }
  function showCorrectFeedback(cb){
    // visual big "Correct" effect
    const div = document.createElement('div');
    div.style.position='fixed'; div.style.left='50%'; div.style.top='20%'; div.style.transform='translateX(-50%)'; div.style.background='var(--accent)'; div.style.color='#00220a'; div.style.padding='18px 24px'; div.style.borderRadius='14px'; div.style.zIndex=9999; div.innerText='✔ Correct!';
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); if(cb) cb(); },900);
  }

  /* ================= Misc ================= */
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function logout(){ sessionClear(); session=null; renderAuth(); renderHeader(); }

  /* ================= Boot ================= */
  function boot(){
    db = dbLoad();
    // ensure admin exists (not creating real credentials)
    if(!db.users.find(u=>u.username==='Administrador.EnglishPlay')) {
      db.users.push({ id: 9999, username:'Administrador.EnglishPlay', name:'Admin', password:'admin', verified:true, isAdmin:true, banned:false, unlockedLessons:200, friends:[], friendRequests:[], bestFriendId:null, points:0, streak:0, avatar:null });
      dbSave(db);
    }
    session = sessionGet();
    renderHeader();
    if(session) renderHome(); else renderAuth();
  }

  window.renderAuth = renderAuth;
  window.renderRegister = renderRegister;
  window.renderHome = renderHome;
  window.renderProfile = renderProfile;
  window.renderAdmin = renderAdmin;
  window.openChat = openChat;
  window.closeChat = closeChat;
  window.sendFriendRequest = sendFriendRequest;
  window.acceptFriend = acceptFriend;

  boot();
})();
