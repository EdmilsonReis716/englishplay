/* EnglishPlay - static frontend (localStorage) */
/* Main ideas:
 - Users saved in localStorage 'englishplay_db' { users: [...], lessons: {...}, globalMessage }
 - Session in 'englishplay_session'
 - Admin user: username exactly "Administrador.EnglishPlay" becomes isAdmin & verified
 - Payment simulated: opens modal, "Simular pagamento" will mark unlockedLessons and show confetti + lock animation
 - Sr.TV chat: will call OpenAI only if user pastes OPENAI key in Settings (stored in localStorage as 'englishplay_openai_key')
*/

console.log("EnglishPlay static loaded");

///// Utilities /////
const DB_KEY = 'englishplay_db';
const SESS_KEY = 'englishplay_session';
const OPENAI_KEY = 'englishplay_openai_key';
const PIX_KEY = "00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson dos Reis Lima6009SAO PAULO621405102mUMXXZDnB63047198";

function loadDB(){ try{ return JSON.parse(localStorage.getItem(DB_KEY)) }catch(e){ return {users:[],preferences:{},lessons:{},globalMessage:null} } }
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)) }
function getSession(){ return JSON.parse(localStorage.getItem(SESS_KEY) || 'null') }
function setSession(u){ localStorage.setItem(SESS_KEY, JSON.stringify(u)) }
function clearSession(){ localStorage.removeItem(SESS_KEY) }
function openOverlay(){ document.getElementById('overlay').classList.remove('hidden') }
function closeOverlay(){ document.getElementById('overlay').classList.add('hidden') }
function showBanner(text){ const b = document.getElementById('globalBanner'); b.innerText = text; b.classList.remove('hidden'); setTimeout(()=>b.classList.add('hidden'), 8000) }

///// Init DB if missing /////
(function initDB(){
  const db = loadDB();
  if(!db.users) db.users = [];
  if(!db.lessons) db.lessons = {};
  if(!db.preferences) db.preferences = {};
  // preload sample user for demo (non-admin)
  if(!db.users.find(u=>u.username==='Junior')) db.users.push({id:Date.now()+1,username:'Junior',name:'Junior',verified:false,isAdmin:false,banned:false,unlockedLessons:5,friends:[],friendRequests:[],points:0,streak:0});
  saveDB(db);
})();

///// UI wiring /////
const main = document.getElementById('main');
const userArea = document.getElementById('userArea');
const overlay = document.getElementById('overlay');

overlay.addEventListener('click', ()=>{ closePayment(); closeChat(); });

document.getElementById('searchInput').addEventListener('input', onSearchInput);
document.getElementById('notifBtn').addEventListener('click', ()=>{ alert("Notificações: (simulado)"); });

/* payment modal controls */
const paymentModal = document.getElementById('paymentModal');
const pixBox = document.getElementById('pixBox');
const copyPixBtn = document.getElementById('copyPix');
const simulatePayBtn = document.getElementById('simulatePay');
const closePaymentBtn = document.getElementById('closePayment');
copyPixBtn.addEventListener('click', ()=>{ navigator.clipboard?.writeText(PIX_KEY).then(()=>alert('Chave PIX copiada')) });
closePaymentBtn.addEventListener('click', ()=>closePayment());
simulatePayBtn.addEventListener('click', ()=>simulatePayment());

/* chat controls */
const chatModal = document.getElementById('chatModal');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChat');
const closeChatBtn = document.getElementById('closeChat');
const openSettingsBtn = document.getElementById('openSettings');
sendChatBtn.addEventListener('click', sendChatMessage);
closeChatBtn.addEventListener('click', closeChat);
openSettingsBtn.addEventListener('click', openOpenAISettings);

let currentPaymentLesson = null;

///// Header user area render /////
function renderHeader(){
  const u = getSession();
  if(!u){
    userArea.innerHTML = `<button class="btn small" onclick="renderAuth()">Entrar / Cadastrar</button>`;
  } else {
    userArea.innerHTML = `<span style="margin-right:12px">Olá, <strong>${escapeHtml(u.username)}</strong> ${u.verified? '✔':''}</span>
      <button class="btn small" onclick="renderProfile()">Perfil</button>
      <button class="btn small" onclick="openChat()">Falar (Sr.TV)</button>
      <button class="btn small" onclick="logout()">Sair</button>`;
  }
}
renderHeader();

///// Routing-ish functions (render screens) /////
function renderAuth(){
  main.innerHTML = `
    <div class="card">
      <h2>Login</h2>
      <input id="loginUser" placeholder="Email ou nome de usuário" />
      <div style="margin-top:8px">
        <button class="btn" onclick="login()">Entrar</button>
        <button class="btn ghost" onclick="renderRegister()">Cadastrar</button>
      </div>
    </div>
  `;
}

function renderRegister(){
  main.innerHTML = `
    <div class="card">
      <h2>Cadastro</h2>
      <input id="regEmail" placeholder="Email (opcional)" />
      <input id="regPhone" placeholder="Telefone (opcional)" />
      <input id="regUsername" placeholder="Nome de usuário (único)" />
      <input id="regName" placeholder="Nome (apelido)" />
      <input id="regPass" placeholder="Senha" type="password" />
      <input id="regPass2" placeholder="Confirmar senha" type="password" />
      <div style="margin-top:8px">
        <button class="btn" onclick="register()">Criar conta</button>
        <button class="btn ghost" onclick="renderAuth()">Voltar</button>
      </div>
    </div>
  `;
}

function renderQuestionnaire(){
  main.innerHTML = `
    <div class="card">
      <h2>Questionário</h2>
      <label>Como você ficou sabendo do EnglishPlay?</label>
      <input id="q_source" placeholder="Ex: Instagram" />
      <label>Meta diária de dias consecutivos?</label>
      <input id="q_streak" placeholder="Ex: 7" />
      <label>Por que deseja aprender inglês?</label>
      <input id="q_reason" placeholder="Trabalho / Estudo / Viagem" />
      <label>Quanto entende de inglês?</label>
      <select id="q_level">
        <option value="nada">Não sei nada</option>
        <option value="pouco">Pouco</option>
        <option value="basico">Conversas básicas</option>
        <option value="fluente">Fluente</option>
      </select>
      <div style="margin-top:10px;text-align:right">
        <button class="btn" onclick="finishQuestionnaire()">Finalizar</button>
      </div>
    </div>
  `;
}

function renderHome(){
  const u = getSession();
  if(!u) return renderAuth();

  // show global message if any
  const db = loadDB();
  if(db.globalMessage && db.globalMessage.active) showBanner(db.globalMessage.text);

  main.innerHTML = `
    <div class="card">
      <h2>Bem-vindo, ${escapeHtml(u.username)} ${u.verified? '✔':''}</h2>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" onclick="renderProfile()">Perfil</button>
        ${u.isAdmin? `<button class="btn" onclick="renderAdmin()">Admin</button>` : ''}
        <button class="btn" onclick="openChat()">Falar (Sr.TV)</button>
        <button class="btn ghost" onclick="logout()">Sair</button>
      </div>
    </div>

    <div class="card">
      <h3>Aulas (200)</h3>
      <div id="lessonArea" class="lesson-grid"></div>
    </div>

    <div class="card">
      <h3>Pesquisa de usuários</h3>
      <input id="searchBox" placeholder="Pesquisar nome..." oninput="onSearchBox(this.value)"/>
      <div id="searchResults" style="margin-top:10px"></div>
    </div>
  `;

  renderLessonGrid();
}

function renderLessonGrid(){
  const lessonArea = document.getElementById('lessonArea');
  const u = getSession();
  let html = '';
  for(let i=1;i<=200;i++){
    const unlocked = i <= (u.unlockedLessons || 0);
    html += `<button class="${unlocked? '':'small'}" onclick="onLessonClick(${i})">${unlocked? 'Aula '+i : 'Bloqueada '+i}</button>`;
  }
  lessonArea.innerHTML = html;
}

function renderProfile(){
  const u = getSession();
  if(!u) return renderAuth();
  const db = loadDB();
  const best = u.bestFriendId ? (db.users.find(x=>x.id===u.bestFriendId)?.username || '-') : '-';
  main.innerHTML = `
    <div class="card">
      <h2>Perfil</h2>
      <p>Usuário: ${escapeHtml(u.username)} ${u.verified? '✔':''}</p>
      <p>Dias consecutivos: ${u.streak || 0}</p>
      <p>Pontos: ${u.points || 0}</p>
      <p>Melhor amigo: ${escapeHtml(best)}</p>
      <div style="margin-top:12px">
        <button class="btn" onclick="renderHome()">Voltar</button>
      </div>
    </div>
  `;
}

function renderAdmin(){
  const u = getSession(); if(!u || !u.isAdmin) return renderHome();
  const db = loadDB();

  let usersHtml = db.users.map(us=>{
    return `<div class="user-row">
      <div><strong>${escapeHtml(us.username)}</strong> ${us.verified? '✔':''} ${us.banned? '<span style="color:#ff7b7b">(Banido)</span>':''}</div>
      <div>
        ${us.banned? `<button class="btn small ghost" onclick="unban(${us.id})">Desbanir</button>` : `<button class="btn small" onclick="ban(${us.id})">Banir</button>`}
      </div>
    </div>`;
  }).join('');

  main.innerHTML = `
    <div class="card">
      <h2>Painel Admin</h2>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" onclick="renderHome()">Voltar</button>
      </div>
      <h3 style="margin-top:14px">Usuários</h3>
      ${usersHtml}
      <h3 style="margin-top:14px">Mensagens Globais</h3>
      <textarea id="adminGlobalText" style="width:100%;height:80px"></textarea>
      <div style="margin-top:8px"><button class="btn" onclick="publishGlobalMessage()">Publicar</button></div>
      <h3 style="margin-top:14px">Editar Aulas (JSON)</h3>
      <textarea id="adminAulas" style="width:100%;height:140px">${JSON.stringify(loadDB().lessons||{},null,2)}</textarea>
      <div style="margin-top:8px"><button class="btn" onclick="saveLessonsEdits()">Salvar aulas</button></div>
      <h3 style="margin-top:14px">Estatísticas</h3>
      <div id="adminStats"></div>
    </div>
  `;
  loadAdminStats();
}

///// Actions /////
function register(){
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const name = document.getElementById('regName').value.trim();
  const pw = document.getElementById('regPass').value;
  const pw2 = document.getElementById('regPass2').value;
  if(!username || !pw) return alert('Por favor preencha usuário e senha');
  if(pw !== pw2) return alert('Senhas não conferem');
  const db = loadDB();
  if(db.users.some(u=>u.username===username)) return alert('Nome de usuário já existe');
  const isAdmin = username === 'Administrador.EnglishPlay';
  const user = { id: Date.now(), username, email, phone, name, password:pw, isAdmin, verified:isAdmin, banned:false, unlockedLessons:5, friends:[],friendRequests:[],points:0,streak:0 };
  db.users.push(user); saveDB(db);
  setSession(user);
  showConfetti();
  renderQuestionnaire();
}

function finishQuestionnaire(){
  // store answers (demo - stored in user object)
  const db = loadDB(); const u = getSession();
  const user = db.users.find(x=>x.id===u.id);
  if(!user) return renderHome();
  user.q = {
    source: document.getElementById('q_source').value,
    goal: document.getElementById('q_streak').value,
    reason: document.getElementById('q_reason').value,
    level: document.getElementById('q_level').value
  };
  saveDB(db);
  setSession(user);
  renderHome();
}

function login(){
  const name = document.getElementById('loginUser').value.trim();
  const db = loadDB(); const u = db.users.find(x=> (x.email===name||x.username===name) );
  if(!u) return alert('Credenciais inválidas');
  if(u.banned) return alert('Você está banido');
  setSession(u); renderHeader(); renderHome();
}

function logout(){ clearSession(); renderHeader(); renderAuth(); }

function onLessonClick(n){
  const u = getSession(); if(!u) return renderAuth();
  if(n <= (u.unlockedLessons||0)) {
    // open lesson content (if admin edited, show JSON content)
    const lessons = loadDB().lessons || {};
    const content = lessons[n] || (`Conteúdo da aula ${n} — (versão estática)`);
    showModalContent(`Aula ${n}`, `<pre style="white-space:pre-wrap;color:#ddd">${escapeHtml(content)}</pre>`);
  } else {
    // open payment modal
    currentPaymentLesson = n;
    openPayment(n);
  }
}

function openPayment(n){
  document.getElementById('pm_title').innerText = 'Desbloquear Aula ' + n;
  pixBox.innerText = PIX_KEY;
  paymentModal.classList.remove('hidden'); overlay.classList.remove('hidden');
}

function closePayment(){
  paymentModal.classList.add('hidden'); overlay.classList.add('hidden'); currentPaymentLesson = null;
}

// simulate payment flow (in static version) -> unlock for current user
function simulatePayment(){
  if(!currentPaymentLesson) return;
  const db = loadDB();
  const sess = getSession();
  // mark preference (simulated)
  const prefId = 'pref_'+Date.now();
  db.preferences = db.preferences || {};
  db.preferences[prefId] = { userId: sess.id, lesson: currentPaymentLesson, status:'approved', created:Date.now() };
  // unlock user locally
  const u = db.users.find(x=>x.id===sess.id);
  if(u) u.unlockedLessons = Math.max(u.unlockedLessons||0, currentPaymentLesson);
  saveDB(db);
  setSession(u);
  // animation/confetti + lock open
  showConfetti();
  showLockOpen();
  closePayment();
  renderHome();
  alert('Pagamento simulado: aula desbloqueada!');
}

/* admin actions */
function ban(id){
  const db = loadDB(), sess = getSession(); if(!sess || !sess.isAdmin) return alert('Somente admin');
  const user = db.users.find(x=>x.id===id);
  if(user){ user.banned = true; saveDB(db); renderAdmin(); }
}
function unban(id){
  const db = loadDB(), sess = getSession(); if(!sess || !sess.isAdmin) return alert('Somente admin');
  const user = db.users.find(x=>x.id===id);
  if(user){ user.banned = false; saveDB(db); renderAdmin(); }
}
function publishGlobalMessage(){
  const text = document.getElementById('adminGlobalText').value.trim();
  const db = loadDB(); db.globalMessage = { text, active: true, created: Date.now() }; saveDB(db); showBanner(text); alert('Mensagem publicada'); }
function saveLessonsEdits(){
  try{
    const raw = document.getElementById('adminAulas').value;
    const parsed = JSON.parse(raw);
    const db = loadDB(); db.lessons = parsed; saveDB(db); alert('Aulas salvas');
  }catch(e){ alert('JSON inválido') }
}
function loadAdminStats(){
  const db = loadDB();
  const stats = { totalUsers: db.users.length, banned: db.users.filter(u=>u.banned).length, totalUnlocked: db.users.reduce((s,u)=>(s+(u.unlockedLessons||0)),0), totalPrefs: Object.keys(db.preferences||{}).length }
  const el = document.getElementById('adminStats'); if(el) el.innerHTML = `<div>Total usuários: ${stats.totalUsers}</div><div>Banidos: ${stats.banned}</div><div>Somatório unlocked: ${stats.totalUnlocked}</div><div>Preferências criadas(sim): ${stats.totalPrefs}</div>`
}

/* search */
function onSearchInput(e){ const q = e.target.value.trim(); if(!q){document.getElementById('searchResults')?.remove();return} /* live not used */ }
function onSearchBox(q){ const db = loadDB(); const res = db.users.filter(u=>u.username.toLowerCase().includes(q.toLowerCase())); const el = document.getElementById('searchResults'); el.innerHTML = res.map(r=>`<div class="user-row"><div>${escapeHtml(r.username)} ${r.verified? '✔': ''}</div><div><button class="btn small" onclick="sendFriendRequest(${r.id})">Adicionar amizade</button></div></div>`).join(''); }

function sendFriendRequest(userId){
  const sess = getSession(); if(!sess) return alert('Entre primeiro');
  if(sess.id === userId) return alert('Você não pode adicionar a si mesmo');
  const db = loadDB(); const target = db.users.find(u=>u.id===userId);
  if(!target) return alert('Usuário não encontrado');
  target.friendRequests = target.friendRequests || [];
  if(target.friendRequests.includes(sess.id)) return alert('Pedido já enviado');
  target.friendRequests.push(sess.id);
  saveDB(db); alert('Pedido enviado');
}

/* friends accept flow in profile (simple) */
function acceptFriend(id){
  const sess = getSession(); const db = loadDB(); const me = db.users.find(u=>u.id===sess.id); const other=db.users.find(u=>u.id===id);
  if(!other) return;
  // add both ways
  me.friends = me.friends || []; other.friends = other.friends || [];
  if(!me.friends.includes(id)) me.friends.push(id);
  if(!other.friends.includes(me.id)) other.friends.push(me.id);
  // remove request
  other.friendRequests = (other.friendRequests||[]).filter(x=>x!==me.id);
  saveDB(db); setSession(me); alert('Amizade aceita'); renderProfile();
}

///// Chat + Sr.TV (OpenAI optional) /////
function openChat(){
  chatModal.classList.remove('hidden'); overlay.classList.remove('hidden');
  chatBox.innerHTML = '';
  appendChatAi("Olá! Eu sou o Sr. TV — me peça ajuda com dúvidas de inglês, suporte do app, ou peça explicações.");
}
function closeChat(){ chatModal.classList.add('hidden'); overlay.classList.add('hidden'); }
function appendChatUser(text){ const d = document.createElement('div'); d.className='chat-bubble chat-user'; d.innerText=text; chatBox.appendChild(d); chatBox.scrollTop = chatBox.scrollHeight; }
function appendChatAi(text){ const d = document.createElement('div'); d.className='chat-bubble chat-ai'; d.innerText=text; chatBox.appendChild(d); chatBox.scrollTop = chatBox.scrollHeight; }

async function sendChatMessage(){
  const txt = chatInput.value.trim(); if(!txt) return;
  appendChatUser(txt); chatInput.value='';
  // try OpenAI if key configured
  const key = localStorage.getItem(OPENAI_KEY);
  if(key){
    appendChatAi('Pensando...');
    try{
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
        body: JSON.stringify({model:'gpt-4o-mini', messages:[{role:'user',content:txt}], max_tokens:600})
      });
      const j = await res.json();
      const text = j?.choices?.[0]?.message?.content || j?.error?.message || 'Sem resposta';
      // replace previous "Pensando..." bubble
      const last = chatBox.querySelectorAll('.chat-ai'); last[last.length-1].innerText = text;
    }catch(e){
      appendChatAi('Erro ao conectar OpenAI. Verifique chave em Configurações.');
    }
  } else {
    // fallback simple simulated responses
    setTimeout(()=>appendChatAi("Simulação: " + cannedResponse(txt)), 700);
  }
}

function openOpenAISettings(){
  const prev = localStorage.getItem(OPENAI_KEY) || '';
  const key = prompt("Cole aqui sua OpenAI API Key (opcional, se deixar vazio irá usar respostas simuladas):", prev);
  if(key !== null){
    if(key.trim()) localStorage.setItem(OPENAI_KEY, key.trim());
    else localStorage.removeItem(OPENAI_KEY);
    alert('Configuração salva localmente.');
  }
}

function cannedResponse(q){
  q = q.toLowerCase();
  if(q.includes('hello')||q.includes('olá')) return 'Hello! How can I help you?';
  if(q.includes('grammar')||q.includes('gramática')) return 'Explicação simples: sujeito + verbo + complemento. Ex: I eat apples.';
  return 'Desculpe, não entendi exatamente. Pergunte sobre vocabulário, gramática ou uso de frases.';
}

///// Animations and sounds /////
function showConfetti(){
  // quick simple confetti: create many small divs
  for(let i=0;i<30;i++){
    const el = document.createElement('div'); el.style.position='fixed'; el.style.zIndex=9999;
    el.style.left = (50 + (Math.random()*400-200)) + 'px'; el.style.top = (20 + (Math.random()*200))+'px';
    el.style.width = '8px'; el.style.height='12px'; el.style.background = ['#ffd54a','#f5c518','#fff'][Math.floor(Math.random()*3)];
    el.style.opacity = '0.95'; el.style.transform = 'rotate('+Math.random()*360+'deg)';
    document.body.appendChild(el);
    (function(e){ setTimeout(()=>{ e.style.transition='all 1200ms ease'; e.style.top = (window.innerHeight - 200 + Math.random()*200)+'px'; e.style.left = (Math.random()*window.innerWidth)+'px'; e.style.opacity = 0; setTimeout(()=>e.remove(),1300); },10) })(el);
  }
  // small success tone
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.value = 800; o.connect(g); g.connect(ctx.destination);
    g.gain.value = 0.0001;
    o.start(); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    setTimeout(()=>o.stop(),400);
  }catch(e){ /* ignore */ }
}

function showLockOpen(){
  // small visual: create lock icon and animate
  const div = document.createElement('div'); div.className = 'modal'; div.style.zIndex=1100;
  const card = document.createElement('div'); card.className='modal-card'; card.style.display='flex'; card.style.flexDirection='column'; card.style.alignItems='center';
  card.innerHTML = `<svg class="lock-svg" viewBox="0 0 24 24" width="96" height="96" fill="none" stroke="${'#f5c518'}" stroke-width="1.6"><rect x="3" y="10" width="18" height="11" rx="2"/><path id="shack" d="M7 10V7a5 5 0 0 1 10 0v3"/></svg><div style="margin-top:10px">Aula desbloqueada!</div>`;
  div.appendChild(card); document.body.appendChild(div);
  setTimeout(()=>{ const sh = document.getElementById('shack'); const lock = card.querySelector('.lock-svg'); if(lock) lock.style.transform = 'translateY(-10px) rotate(-25deg)'; },80);
  setTimeout(()=>{ document.body.removeChild(div) },1800);
}

function showModalContent(title, html){
  const div = document.createElement('div'); div.className='modal'; div.style.zIndex=1100;
  const card = document.createElement('div'); card.className='modal-card'; card.innerHTML = `<h3>${title}</h3><div style="max-height:400px;overflow:auto;margin-top:10px">${html}</div><div style="text-align:right;margin-top:8px"><button class="btn ghost" id="closeTemp">Fechar</button></div>`;
  div.appendChild(card); document.body.appendChild(div);
  document.getElementById('closeTemp').addEventListener('click', ()=>{ document.body.removeChild(div) });
}

/* small escape helper */
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c])); }

///// Init app on load
function initApp(){
  const sess = getSession();
  if(sess) { renderHeader(); renderHome(); } else { renderAuth(); renderHeader(); }
}
initApp();

///// small helpers for external clicks from html attributes (global)
window.renderAuth = renderAuth;
window.renderRegister = renderRegister;
window.renderQuestionnaire = renderQuestionnaire;
window.renderHome = renderHome;
window.renderProfile = renderProfile;
window.renderAdmin = renderAdmin;
window.register = register;
window.login = login;
window.logout = logout;
window.onLessonClick = onLessonClick;
window.openChat = openChat;
window.ban = ban;
window.unban = unban;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriend = acceptFriend;
window.openPayment = openPayment;
window.closePayment = closePayment;
window.simulatePayment = simulatePayment;
window.publishGlobalMessage = publishGlobalMessage;
window.saveLessonsEdits = saveLessonsEdits;
window.onSearchBox = onSearchBox;
window.openOpenAISettings = openOpenAISettings;

/* EOF */
