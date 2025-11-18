// Simple SPA logic storing data in localStorage. This is a starter template.
// Many features are implemented as front-end placeholders; for production you must implement server-side auth, secure payments, OpenAI integration, and database storage.

const PIX_KEY = "00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson dos Reis Lima6009SAO PAULO621405102mUMXXZDnB63047198";

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

const templates = {
  login: document.getElementById('loginTpl').content,
  questionnaire: document.getElementById('questionnaireTpl').content,
  home: document.getElementById('homeTpl').content,
  profile: document.getElementById('profileTpl').content
};

const main = qs('#main');
const menuDrawer = qs('#menuDrawer');
const profileBtn = qs('#profileBtn');
const notifyBtn = qs('#notifyBtn');
const menuBtn = qs('#menuBtn');
const logoImg = qs('#logoImg');

let state = {
  user: null,
  users: JSON.parse(localStorage.getItem('ep_users')||'{}'),
  notificationsOn: true,
};

function saveUsers(){ localStorage.setItem('ep_users', JSON.stringify(state.users)); }

function showLogin(){
  main.innerHTML='';
  const node = templates.login.cloneNode(true);
  main.appendChild(node);
  const toLogin = qs('#toLogin');
  const toSignup = qs('#toSignup');
  const loginForm = qs('#loginForm');
  const signupForm = qs('#signupForm');
  toLogin.onclick = ()=>{ toLogin.classList.add('active'); toSignup.classList.remove('active'); loginForm.classList.remove('hidden'); signupForm.classList.add('hidden'); };
  toSignup.onclick = ()=>{ toSignup.classList.add('active'); toLogin.classList.remove('active'); signupForm.classList.remove('hidden'); loginForm.classList.add('hidden'); };

  qs('#doLogin').onclick = ()=> {
    const id = qs('#loginEmail').value.trim();
    const pw = qs('#loginPassword').value;
    if(!id || !pw){ alert('Preencha os campos'); return; }
    const u = Object.values(state.users).find(x => (x.contact===id||x.username===id) && x.password===pw);
    if(!u){ alert('Usuário ou senha incorretos'); return; }
    state.user = u;
    localStorage.setItem('ep_logged', u.username);
    renderHome();
  };

  qs('#doSignup').onclick = ()=> {
    const contact = qs('#signupContact').value.trim();
    const name = qs('#signupName').value.trim();
    const pw = qs('#signupPassword').value;
    const pwc = qs('#signupPasswordConfirm').value;
    if(!contact||!name||!pw){ alert('Preencha tudo'); return; }
    if(pw!==pwc){ alert('Senhas não conferem'); return; }
    if(state.users[name]){ alert('Nome já existe, escolha outro nome de usuário'); return; }
    // create user
    const user = {
      username: name,
      contact,
      password: pw,
      photo: 'assets/default-avatar.png',
      friends: [],
      bestFriend: null,
      streak: 0,
      points: 0,
      unlocked: 5, // first 5 free
      nameChangesLeft: 3,
      question: {}
    };
    state.users[name]=user;
    saveUsers();
    // move to questionnaire
    state.user = user;
    localStorage.setItem('ep_logged', user.username);
    renderQuestionnaire();
  };
}

function renderQuestionnaire(){
  main.innerHTML='';
  const node = templates.questionnaire.cloneNode(true);
  main.appendChild(node);
  qs('#finishQuestionnaire').onclick = ()=>{
    const q = {
      source: qs('#q_source').value,
      goal: qs('#q_goal').value,
      reason: qs('#q_reason').value,
      level: qs('#q_level').value
    };
    state.user.question = q;
    state.users[state.user.username]=state.user;
    saveUsers();
    renderHome();
  };
}

function renderHome(){
  main.innerHTML='';
  const node = templates.home.cloneNode(true);
  main.appendChild(node);
  qs('#streak').textContent = `Consecutivos: ${state.user.streak||0}`;
  qs('#friendCount').textContent = `Amigos: ${state.user.friends.length||0}`;
  // build 200 lessons
  const grid = qs('#lessonsGrid');
  for(let i=1;i<=200;i++){
    const btn = document.createElement('button');
    btn.className = 'lesson-btn ' + (i<=state.user.unlocked? 'unlocked':'locked');
    btn.innerHTML = `<strong>Aula ${i}</strong><small>20 lições</small>`;
    if(i>state.user.unlocked){
      btn.onclick = ()=> openPaymentModal(i);
      btn.dataset.locked = '1';
    } else {
      btn.onclick = ()=> openLesson(i);
      btn.dataset.locked = '0';
    }
    grid.appendChild(btn);
  }
}

function openLesson(i){
  // simple lesson placeholder
  main.innerHTML = `<section class="lesson"><button id="backBtn" class="btn ghost">← Voltar</button><h2>Aula ${i}</h2>
    <p>Professor: <strong>${getTeacherForLesson(i)}</strong></p>
    <p>Esta é uma lição de demonstração. Cada aula tem 20 lições (não implementadas neste pacote inicial).</p>
    <button id="completeLesson" class="btn">Marcar aula como completa (+ pontos)</button>
  </section>`;
  qs('#backBtn').onclick = ()=> renderHome();
  qs('#completeLesson').onclick = ()=>{
    state.user.points = (state.user.points||0) + 10;
    state.user.streak = (state.user.streak||0)+1;
    state.users[state.user.username]=state.user;
    saveUsers();
    alert('Parabéns! Você ganhou 10 pontos.');
    renderHome();
  };
}

function getTeacherForLesson(i){
  // Cycle teachers: Sr TV, Joe, Cassia
  const arr = ['Sr TV','Joe','Cassia'];
  return arr[(i-1)%3];
}

function openPaymentModal(lessonIndex){
  const modal = qs('#paymentModal');
  modal.classList.remove('hidden');
  qs('#pixKey').textContent = PIX_KEY;
  qs('#copyPix').onclick = async () => {
    try{
      await navigator.clipboard.writeText(PIX_KEY);
      alert('Chave PIX copiada!');
    }catch(e){ alert('Não foi possível copiar.'); }
  };
  qs('#simulatePay').onclick = ()=>{
    // simulate unlocking starting from lessonIndex - unlock all remaining
    state.user.unlocked = 200;
    state.users[state.user.username]=state.user;
    saveUsers();
    modal.classList.add('hidden');
    // celebration animation (simple)
    document.body.insertAdjacentHTML('beforeend', `<div id="confetti" class="confetti">🎉🎉🎉</div>`);
    setTimeout(()=>{ const c = qs('#confetti'); if(c) c.remove(); renderHome(); }, 1600);
  };
  qs('#closePay').onclick = ()=> modal.classList.add('hidden');
}

function renderProfile(){
  main.innerHTML='';
  const node = templates.profile.cloneNode(true);
  main.appendChild(node);
  qs('#profileName').textContent = state.user.username;
  qs('#profilePhoto').src = state.user.photo || 'assets/default-avatar.png';
  qs('#infoName').textContent = state.user.username;
  qs('#infoContact').textContent = state.user.contact;
  qs('#infoStreak').textContent = state.user.streak;
  qs('#infoFriends').textContent = state.user.friends.length;
  qs('#infoBestFriend').textContent = state.user.bestFriend || '—';
  qs('#nameChanges').textContent = state.user.nameChangesLeft || 3;

  qs('#changeNameBtn').onclick = ()=>{
    if((state.user.nameChangesLeft||3)<=0){ alert('Não pode mais alterar o nome.'); return; }
    const n = prompt('Novo nome (apenas 3 alterações permitidas):', state.user.username);
    if(!n) return;
    if(state.users[n]){ alert('Nome já existe'); return; }
    // change username: remove old key
    delete state.users[state.user.username];
    state.user.username = n;
    state.user.nameChangesLeft = (state.user.nameChangesLeft||3)-1;
    state.users[state.user.username] = state.user;
    saveUsers();
    alert('Nome alterado. Faça login novamente caso necessário.');
    renderProfile();
  };

  qs('#profileChangeFile').onchange = (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      state.user.photo = ev.target.result;
      state.users[state.user.username]=state.user;
      saveUsers();
      renderProfile();
    };
    reader.readAsDataURL(f);
  };
}

// menu & header actions
menuBtn.onclick = ()=> menuDrawer.classList.toggle('hidden');
notifyBtn.onclick = ()=> alert('Notificações (placeholder).');
profileBtn.onclick = ()=> renderProfile();

qs('#search').addEventListener('keyup', (e)=>{
  const q = e.target.value.toLowerCase();
  // simple search across usernames
  if(!q) return;
  const matches = Object.keys(state.users).filter(k => k.toLowerCase().includes(q));
  alert('Usuários encontrados: ' + (matches.length? matches.join(', '): 'nenhum'));
});

// Drawer actions
qs('#editData').onclick = ()=>{ menuDrawer.classList.add('hidden'); renderProfile(); };
qs('#notifToggle').onclick = ()=>{
  state.notificationsOn = !state.notificationsOn;
  qs('#notifState').textContent = state.notificationsOn? 'ON' : 'OFF';
};
qs('#logoutBtn').onclick = ()=> {
  localStorage.removeItem('ep_logged');
  state.user = null;
  showLogin();
};

// initial boot
function boot(){
  // load uploaded users if exists
  const logged = localStorage.getItem('ep_logged');
  if(logged && state.users[logged]){
    state.user = state.users[logged];
    renderHome();
  } else {
    showLogin();
  }
}

boot();
