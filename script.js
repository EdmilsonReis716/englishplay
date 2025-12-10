/* =========================================================
   EnglishPlay — Interface-only package (front-end)
   - Zig-zag tree (one node per row)
   - Sr.TV offline chat (closes & replies)
   - Avatar upload (local)
   - Payment simulated (local)
   - Progress saved to localStorage (per browser)
   ========================================================= */

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const DATA_KEY = "englishplay_data_v1";

function saveState(state){
  localStorage.setItem(DATA_KEY, JSON.stringify(state));
}
function loadState(){
  try { return JSON.parse(localStorage.getItem(DATA_KEY)) } catch { return null }
}
function ensureState(){
  let st = loadState();
  if(!st){
    st = {
      users: [], // visual-only users if you create them
      currentUser: null,
      lessons: Array.from({length:200}, (_,i)=>({
        id: i+1,
        unlocked: i < 5, // first 5 unlocked
        done: false
      })),
      globalMessage: null
    };
    saveState(st);
  }
  return st;
}
let state = ensureState();

/* ---------- Initial UI wiring ---------- */
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

overlay.addEventListener('click', ()=>{ closeChat(); closePayment(); });
closeChatBtn?.addEventListener('click', closeChat);
sendChatBtn?.addEventListener('click', handleSendChat);
simulatePayBtn?.addEventListener('click', simulatePayment);
closePayBtn?.addEventListener('click', closePayment);
avatarFile?.addEventListener('change', handleAvatarFile);

/* ---------- Render header / user area ---------- */
function renderHeader(){
  const u = state.currentUser;
  if(!u){
    userArea.innerHTML = `<button class="nav-btn" id="enterBtn">Entrar / Cadastrar</button>`;
    $('enterBtn').onclick = () => renderAuth();
    return;
  }
  userArea.innerHTML = `
    <span style="margin-right:8px">Olá, <strong>${u.username}</strong> ${u.verified? '✔':''}</span>
    <button class="nav-btn" id="btnProfile">Perfil</button>
    <button class="nav-btn" id="btnChat">Sr.TV</button>
    <button class="nav-btn" id="btnLogout">Sair</button>
  `;
  $('btnProfile').onclick = renderProfile;
  $('btnChat').onclick = openChat;
  $('btnLogout').onclick = () => { state.currentUser = null; saveState(state); renderAuth(); renderHeader(); }
}

/* ---------- Auth screens (visual-only) ---------- */
function renderAuth(){
  main.innerHTML = `
    <div class="card">
      <h2>Entrar / Cadastrar</h2>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input id="authUser" placeholder="Nome de usuário">
        <button class="nav-btn" id="authLoginBtn">Entrar</button>
        <button class="nav-btn" id="authRegisterBtn">Cadastrar</button>
      </div>
      <p style="margin-top:12px;color:var(--muted)">Na versão pública as contas são locais ao navegador.</p>
    </div>
  `;
  $('authLoginBtn').onclick = () => {
    const username = $('authUser').value.trim();
    if(!username) return alert('Digite um nome');
    // find or create local visual user
    let user = state.users.find(x=>x.username===username);
    if(!user) return alert('Usuário não achado. Use "Cadastrar" para criar.');
    state.currentUser = user;
    saveState(state);
    renderHome();
    renderHeader();
  };
  $('authRegisterBtn').onclick = () => {
    const username = $('authUser').value.trim();
    if(!username) return alert('Digite um nome');
    if(state.users.find(x=>x.username===username)) return alert('Nome já existe');
    const newUser = { username, avatar: 'logo.png', verified: username==='Administrador.EnglishPlay', isAdmin: username==='Administrador.EnglishPlay' };
    state.users.push(newUser);
    state.currentUser = newUser;
    saveState(state);
    renderHeader(); renderQuestionnaire();
  };
  renderHeader();
}

/* ---------- Questionnaire ---------- */
function renderQuestionnaire(){
  main.innerHTML = `
    <div class="card">
      <h2>Questionário</h2>
      <label>Como ficou sabendo?</label><input id="q1" placeholder="Ex: Instagram">
      <label>Meta diária (dias)</label><input id="q2" placeholder="Ex: 7">
      <label>Por que aprender?</label><input id="q3" placeholder="Ex: Trabalho">
      <label>Nível</label>
      <select id="q4"><option value="nada">Não sei nada</option><option value="pouco">Pouco</option><option value="basico">Básico</option><option value="fluente">Fluente</option></select>
      <div style="margin-top:10px;text-align:right"><button class="nav-btn" id="finishQBtn">Finalizar</button></div>
    </div>
  `;
  $('finishQBtn').onclick = () => {
    const u = state.currentUser;
    if(!u) return renderAuth();
    u.q = {source:$('q1').value, goal:$('q2').value, reason:$('q3').value, level:$('q4').value};
    saveState(state);
    renderHome();
  };
}

/* ---------- Home + Zig-zag tree ---------- */
function renderHome(){
  const u = state.currentUser;
  if(!u) return renderAuth();
  let html = `<div class="card"><h2>Bem-vindo, ${u.username} ${u.verified? '✔':''}</h2>
    <div style="display:flex;gap:10px;margin-top:8px">
      <button class="nav-btn" onclick="renderProfile()">Perfil</button>
      <button class="nav-btn" onclick="openChat()">Sr.TV</button>
      <button class="nav-btn" onclick="renderAdminVisual()">Admin</button>
    </div></div>`;

  html += `<div class="card"><h3>Árvore de Aulas</h3><div class="lesson-tree" id="treeRoot">`;
  // zig-zag: alternate row alignment (left/right)
  for(let i=0;i<state.lessons.length;i++){
    const lesson = state.lessons[i];
    const left = (i % 2 === 0); // even index on left
    html += `<div class="row" style="justify-content:${left? 'flex-start':'flex-end'}">`;
    // spacer + node
    html += `<div style="width:50px"></div>`;
    html += `<div class="lesson-node ${lesson.done? 'lesson-done':''} ${lesson.unlocked? '':'lesson-locked'}" data-index="${i}" onclick="onNodeClick(${i})">`;
    html += lesson.unlocked ? (lesson.done? '✔':'') : '🔒';
    html += `</div>`;
    html += `</div>`;
    // connector (visual)
    if(i < state.lessons.length-1){
      html += `<div style="height:12px"></div>`;
    }
  }
  html += `</div></div>`;
  main.innerHTML = html;
  renderHeader();
}

/* ---------- clicking a node ---------- */
function onNodeClick(index){
  const lesson = state.lessons[index];
  if(!lesson.unlocked){
    openPayment(index);
    return;
  }
  // open lesson modal (simple)
  const content = state.lessonsContent ? (state.lessonsContent[index+1] || `Conteúdo da aula ${index+1} — demo`) : `Conteúdo da aula ${index+1} — demo`;
  alert(`Aula ${index+1}\n\n${content}`);
  // mark done and unlock next (local)
  lesson.done = true;
  if(state.lessons[index+1]) state.lessons[index+1].unlocked = true;
  saveState(state);
  renderHome();
}

/* ---------- Payment simulated ---------- */
let selectedUnlockIndex = null;
function openPayment(i){
  selectedUnlockIndex = i;
  paymentModal.classList.remove('hidden');
  overlay.classList.remove('hidden');
}
function closePayment(){
  paymentModal.classList.add('hidden');
  overlay.classList.add('hidden');
  selectedUnlockIndex = null;
}
function simulatePayment(){
  if(selectedUnlockIndex==null) return;
  state.lessons[selectedUnlockIndex].unlocked = true;
  saveState(state);
  showConfetti();
  closePayment();
  renderHome();
}

/* ---------- Profile ---------- */
function renderProfile(){
  const u = state.currentUser;
  if(!u) return renderAuth();
  main.innerHTML = `
    <div class="card profile-card center" style="flex-direction:column">
      <img src="${u.avatar||'logo.png'}" class="profile-avatar" id="profileAvatar">
      <h2>${u.username} ${u.verified? '✔':''}</h2>
      <div style="margin-top:12px">
        <button class="nav-btn" id="changeAvatarBtn">Trocar foto</button>
        <button class="nav-btn" id="backHomeBtn">Voltar</button>
      </div>
    </div>
  `;
  $('changeAvatarBtn').onclick = ()=>{ avatarFile.click(); };
  $('backHomeBtn').onclick = renderHome;
}

/* avatar upload handler */
function handleAvatarFile(e){
  const file = e.target.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    const dataUrl = evt.target.result;
    if(state.currentUser){
      state.currentUser.avatar = dataUrl;
      // update in users list
      const idx = state.users.findIndex(u=>u.username===state.currentUser.username);
      if(idx>=0) state.users[idx].avatar = dataUrl;
      saveState(state);
      renderProfile();
      renderHeader();
    }
  }
  reader.readAsDataURL(file);
}

/* ---------- Admin (visual) ---------- */
function renderAdminVisual(){
  const u = state.currentUser;
  if(!u || !u.isAdmin){
    alert('Painel admin (visual): somente usuários marcados como Administrador.EnglishPlay terão controles avançados.');
  }
  // admin visual: editing lessons content JSON (local only)
  main.innerHTML = `
    <div class="card">
      <h2>Painel Admin (visual)</h2>
      <div style="margin-top:8px">
        <textarea id="lessonsEditor" style="width:100%;height:200px">${JSON.stringify(state.lessonsContent||{},null,2)}</textarea>
        <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
          <button class="nav-btn" id="saveLessonsBtn">Salvar aulas (local)</button>
          <button class="nav-btn" id="backHomeAdmin">Voltar</button>
        </div>
      </div>
    </div>
  `;
  $('saveLessonsBtn').onclick = ()=>{
    try{
      const parsed = JSON.parse($('lessonsEditor').value);
      state.lessonsContent = parsed;
      saveState(state);
      alert('Aulas salvas localmente.');
    }catch(e){ alert('JSON inválido.'); }
  };
  $('backHomeAdmin').onclick = renderHome;
}

/* ---------- Chat Sr.TV (offline) ---------- */
function openChat(){
  chatModal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  chatMessages.innerHTML = '';
  appendAi("Olá! Eu sou o Sr.TV — posso ajudar com gramática, vocabulário e dúvidas do app.");
}
function closeChat(){
  chatModal.classList.add('hidden');
  overlay.classList.add('hidden');
}
function appendUser(text){
  const d = document.createElement('div'); d.className='msg-user'; d.innerText = text; chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function appendAi(text){
  const d = document.createElement('div'); d.className='msg-ai'; d.innerText = text; chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
}
function handleSendChat(){
  const txt = chatInput.value.trim();
  if(!txt) return;
  appendUser(txt);
  chatInput.value = '';
  setTimeout(()=>{ appendAi(srTvBrain(txt)); }, 400);
}

/* SR.TV brain (offline rules) */
function srTvBrain(msg){
  const t = msg.toLowerCase();
  if(t.includes('oi')||t.includes('olá')) return 'Olá! Em que posso ajudar?';
  if(t.includes('do/does') || t.includes('do does') || t.includes('does')) return 'Use "do" com I/you/we/they e "does" com he/she/it. Ex: Does she work?';
  if(t.includes('present perfect')) return 'Present perfect = have/has + past participle. Ex: I have studied.';
  if(t.includes('traduz') || t.startsWith('tradu') || t.includes('o que significa')) {
    const w = msg.replace(/(traduz(a|e|ir)?|o que significa)/i,'').trim();
    if(!w) return 'Diga "traduz X" ou "o que significa X".';
    return `Tradução aproximada de "${w}": ${srTvTranslate(w)}`;
  }
  if(t.includes('pagar')||t.includes('pix')) return 'Pagamentos são simulados aqui. Use "Desbloquear" no modal de pagamento.';
  if(t.includes('ajuda')||t.includes('help')||t.includes('bug')) return 'Tente atualizar a página (Ctrl+F5). Se o problema persistir, descreva o erro.';
  return "Desculpe, não entendi bem. Pergunte sobre gramática, tradução ou funcionamento do app.";
}
function srTvTranslate(w){
  const d = {hello:'olá', dog:'cachorro', cat:'gato', through:'através de', house:'casa', school:'escola', apple:'maçã'};
  return d[w.toLowerCase()] || 'tradução não disponível no dicionário local.';
}

/* ---------- Confetti (visual) ---------- */
function showConfetti(){
  for(let i=0;i<20;i++){
    const el = document.createElement('div'); el.style.position='fixed'; el.style.left=(50+Math.random()*600-300)+'px'; el.style.top='20px'; el.style.width='8px'; el.style.height='12px';
    el.style.background = ['#ffd54a','#f5c518','#00ff80'][Math.floor(Math.random()*3)];
    el.style.zIndex=9999; document.body.appendChild(el);
    setTimeout(()=>{ el.style.transition='1s'; el.style.top=(window.innerHeight-100+Math.random()*200)+'px'; el.style.opacity=0; setTimeout(()=>el.remove(),1100) },10);
  }
}

/* ---------- Start ---------- */
function boot(){
  state = ensureState();
  // ensure demo user exists
  if(!state.users.find(u=>u.username==='Junior')) state.users.push({username:'Junior',avatar:'logo.png',verified:false,isAdmin:false});
  saveState(state);
  // if currentUser exists in state, set
  if(state.currentUser) state.currentUser = state.users.find(u=>u.username===state.currentUser.username) || state.currentUser;
  renderHeader();
  if(state.currentUser) renderHome(); else renderAuth();
}
boot();

/* expose some functions to html inline handlers */
window.renderHome = renderHome;
window.renderAuth = renderAuth;
window.renderRegister = renderAuth;
window.renderProfile = renderProfile;
window.renderAdminVisual = renderAdminVisual;
window.openChat = openChat;
window.closeChat = closeChat;
window.onNodeClick = onNodeClick;
window.onNodeClick = onNodeClick;
window.simulatePayment = simulatePayment;
window.closePayment = closePayment;
window.onNodeClick = onNodeClick;
