/* script.js — EnglishPlay (all-in-one front-end engine) */

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const now = () => Date.now();

function dbLoad(){ try{ return JSON.parse(localStorage.getItem('englishplay_db')) || { users: [] }; } catch(e){ return { users: [] }; } }
function dbSave(db){ localStorage.setItem('englishplay_db', JSON.stringify(db)); }
function sessionLoad(){ try{ return JSON.parse(localStorage.getItem('englishplay_session')); } catch(e){ return null; } }
function sessionSave(s){ localStorage.setItem('englishplay_session', JSON.stringify(s)); }

/* ---------- App state ---------- */
let DB = dbLoad();
let session = sessionLoad();

/* ---------- UI references ---------- */
const authModal = $('authModal');
const overlay = $('overlay');
const navRight = $('navRight');
const sidebar = $('sidebar');
const sessionsArea = $('sessionsArea');
const searchUsers = $('searchUsers');
const searchResults = $('searchResults');
const pixModal = $('pixModal');
const pixKeyEl = $('pixKey');

/* ---------- Helpers UI ---------- */
function openModal(el){ overlay.classList.remove('hidden'); el.classList.remove('hidden'); }
function closeAll(){ document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')); overlay.classList.add('hidden'); }
function toast(msg){ alert(msg); } // simple for now

/* ---------- Render nav / sidebar ---------- */
function renderNav(){
  const right = $('navRight');
  if(!session){
    right.innerHTML = `<button id="openAuthBtn" class="btn ghost">Entrar / Criar</button>`;
    $('openAuthBtn').onclick = ()=> openModal(authModal);
  } else {
    right.innerHTML = `<button id="profileBtn" class="btn ghost">${session.username}</button>`;
    $('profileBtn').onclick = ()=> window.location.href='profile.html';
  }
}

function renderSidebar(){
  sidebar.innerHTML = '';
  const box = document.createElement('div');
  box.className='card';
  box.style.padding='12px';
  const avatar = session ? session.avatar || 'logo.png' : 'logo.png';
  box.innerHTML = `
    <img src="${avatar}" class="profile-avatar" />
    <h3 style="text-align:center;margin:6px 0">${session ? session.username : 'Visitante'}</h3>
    <p style="text-align:center;color:var(--yellow)">🔥 ${session ? session.streak||0 : 0} dias</p>
    <p style="text-align:center;color:var(--accent)">⭐ ${session ? session.xp||0 : 0} XP</p>
    <div style="margin-top:12px;text-align:center">
      <button class="btn ghost" id="openProfileBtn">Perfil</button>
    </div>
  `;
  sidebar.appendChild(box);
  $('openProfileBtn').onclick = ()=> window.location.href='profile.html';
}

/* ---------- Sessions / lessons generation ---------- */
const SESSION_INFO = [
  {icon:'⭐', title:'Fundamentos'},
  {icon:'📘', title:'Vocabulário Básico'},
  {icon:'🔤', title:'Gramática Inicial'},
  {icon:'🎧', title:'Listening'},
  {icon:'✍', title:'Writing'},
  {icon:'💬', title:'Conversação'},
  {icon:'🚀', title:'Intermediário'},
  {icon:'🔥', title:'Intermediário Avançado'},
  {icon:'🎯', title:'Pré-Fluência'},
  {icon:'👑', title:'Domínio do Inglês'}
];

function renderSessions(){
  sessionsArea.innerHTML = '';
  let lessonNum = 1;
  for(let s=0;s<10;s++){
    const card = document.createElement('div');
    card.className='session-card';
    card.innerHTML = `<div class="session-title"><span>${SESSION_INFO[s].icon}</span> Sessão ${s+1} — ${SESSION_INFO[s].title}</div><div id="tree-${s}" class="lesson-tree"></div>`;
    sessionsArea.appendChild(card);
    const tree = $(`tree-${s}`);
    for(let i=0;i<20;i++){
      const circle = document.createElement('div');
      circle.className='lesson-circle';
      circle.textContent = lessonNum;
      const unlocked = session && (lessonNum===1 || session.completed?.includes(lessonNum-1));
      if(!unlocked){ circle.classList.add('lesson-locked'); circle.innerHTML='🔒'; }
      if(session && session.completed && session.completed.includes(lessonNum)){ circle.classList.add('lesson-done'); circle.innerHTML='✔'; }
      circle.onclick = () => {
        if(circle.classList.contains('lesson-locked')) {
          // open PIX unlock flow for the whole session: ask to unlock session s
          if(!session){ toast('Faça login para desbloquear.'); return; }
          openPixModalForSession(s);
          return;
        }
        // go to lesson page
        pageTransition(`lesson.html?id=${lessonNum}`);
      };
      tree.appendChild(circle);
      lessonNum++;
    }
  }
}

/* ---------- PIX flow (manual) ---------- */
let _unlockSessionTarget = null;
function openPixModalForSession(sessionIndex){
  _unlockSessionTarget = sessionIndex;
  openModal(pixModal);
  // set pix key shown
  const example = "00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson...";
  pixKeyEl.textContent = example;
}
function copyPixKey(){
  navigator.clipboard?.writeText(pixKeyEl.textContent).then(()=>toast('PIX copiado.'));
}
function confirmPixPayment(){
  // manual confirm: unlock all lessons in session _unlockSessionTarget
  if(_unlockSessionTarget === null){ toast('Erro'); return; }
  const start = _unlockSessionTarget*20 + 1;
  const end = start + 19;
  // mark as unlocked by setting an "unlockedSessions" array in session
  session.unlockedSessions = session.unlockedSessions || [];
  session.unlockedSessions.push(_unlockSessionTarget);
  session.unlockedSessions = [...new Set(session.unlockedSessions)];
  // unlock lessons in DB? We'll allow unlockedSessions to bypass lock
  sessionSave(session);
  // close
  closeAll();
  renderSessions();
  toast('Sessão desbloqueada manualmente. Agora você pode acessar as aulas.');
}

/* ---------- Friends system ---------- */
function addFriend(username){
  if(!session){ toast('Faça login'); return; }
  const target = DB.users.find(u => u.username === username);
  if(!target){ toast('Usuário não encontrado'); return; }
  // send request: push to target.requests
  target.requests = target.requests || [];
  if(target.requests.includes(session.username)){ toast('Pedido já enviado'); return; }
  target.requests.push(session.username);
  dbSave(DB);
  toast('Pedido de amizade enviado.');
}
function acceptFriendRequest(fromUsername){
  if(!session) return;
  // add to session.friends
  session.friends = session.friends || [];
  session.friends.push(fromUsername);
  session.friends = [...new Set(session.friends)];
  // remove request
  const idx = DB.users.findIndex(u=>u.id===session.id);
  if(idx>=0) DB.users[idx] = session;
  // add session to other user's friends
  const other = DB.users.find(u=>u.username===fromUsername);
  if(other){
    other.friends = other.friends || [];
    other.friends.push(session.username);
  }
  dbSave(DB);
  sessionSave(session);
  renderSidebar();
  toast('Amizade aceita.');
}

/* ---------- Auth / Register / Questionnaire redirect ---------- */
$('authRegisterBtn').onclick = () => {
  const user = $('authUser').value.trim();
  const pass = $('authPass').value.trim();
  if(user.length < 3) return toast('Nome muito curto');
  if(pass.length < 3) return toast('Senha muito curta');
  if(DB.users.find(u=>u.username===user)) return toast('Nome já existe');
  const newUser = { id: now(), username:user, pass:pass, completed:[], streak:0, xp:0, friends:[], requests:[], unlockedSessions:[] };
  DB.users.push(newUser);
  dbSave(DB);
  session = newUser; sessionSave(session);
  closeAll();
  // go to questionnaire page (separate)
  window.location.href = 'questionnaire.html';
};

$('authLoginBtn').onclick = () => {
  const user = $('authUser').value.trim();
  const pass = $('authPass').value.trim();
  const found = DB.users.find(u=>u.username===user && u.pass===pass);
  if(!found) return toast('Usuário ou senha incorretos');
  session = found; sessionSave(session);
  closeAll();
  renderNav(); renderSidebar(); renderSessions();
};

/* close modal */
$('authClose').onclick = closeAll;
$('overlay').onclick = closeAll;

/* PIX modal buttons */
$('copyPix').onclick = copyPixKey;
$('confirmPix').onclick = confirmPixPayment;
$('closePix').onclick = closeAll;

/* search users */
searchUsers.oninput = () => {
  const q = searchUsers.value.trim().toLowerCase();
  if(!q){ searchResults.classList.add('hidden'); return; }
  const filtered = DB.users.filter(u=>u.username.toLowerCase().includes(q)).slice(0,8);
  searchResults.innerHTML = filtered.map(u=>`<div class="sres"><b>${u.username}</b> <button class="btn ghost" onclick="addFriend('${u.username}')">Adicionar</button></div>`).join('');
  searchResults.classList.remove('hidden');
};

/* page transition helper */
function pageTransition(href){
  document.body.style.opacity = '0';
  setTimeout(()=> window.location.href = href, 240);
}

/* ---------- Initialization ---------- */
function init(){
  DB = dbLoad();
  session = sessionLoad();
  renderNav();
  renderSidebar();
  renderSessions();
}
init();

/* expose some helpers for console */
window._EP = { DB, session, addFriend, acceptFriendRequest, renderSessions };

// End of script.js
