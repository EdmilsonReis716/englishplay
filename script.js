
/* Simplified static version with login, admin, pages stored in localStorage */

const app = document.getElementById('app');

function saveDB(db){ localStorage.setItem('englishplay_db', JSON.stringify(db)); }
function loadDB(){ return JSON.parse(localStorage.getItem('englishplay_db')||'{"users":[]}'); }

function setSession(u){ localStorage.setItem('englishplay_session', JSON.stringify(u)); }
function getSession(){ return JSON.parse(localStorage.getItem('englishplay_session')||'null'); }

function renderLogin(){
  app.innerHTML = `
    <div class='card'>
      <h2>Login</h2>
      <input id='loginUser' placeholder='Usuário'><br>
      <button onclick='doLogin()'>Entrar</button>
      <button onclick='renderRegister()'>Criar conta</button>
    </div>
  `;
}

function renderRegister(){
  app.innerHTML = `
    <div class='card'>
      <h2>Cadastro</h2>
      <input id='regUser' placeholder='Usuário'><br>
      <button onclick='doRegister()'>Criar</button>
      <button onclick='renderLogin()'>Voltar</button>
    </div>
  `;
}

function doRegister(){
  const name = document.getElementById('regUser').value.trim();
  if(!name) return alert("Digite um nome!");
  const db = loadDB();
  if(db.users.find(u=>u.username===name)) return alert("Nome já existe!");
  const isAdmin = name === "Administrador.EnglishPlay";
  const u = { id:Date.now(), username:name, isAdmin, verified:isAdmin, banned:false, unlockedLessons:5 };
  db.users.push(u);
  saveDB(db);
  setSession(u);
  renderHome();
}

function doLogin(){
  const name = document.getElementById('loginUser').value.trim();
  const db = loadDB();
  const u = db.users.find(u=>u.username===name);
  if(!u) return alert("Usuário não encontrado!");
  if(u.banned) return alert("Você está banido.");
  setSession(u);
  renderHome();
}

function renderHome(){
  const u = getSession();
  if(!u) return renderLogin();
  app.innerHTML = `
    <div class='card'>
      <h2>Bem-vindo, ${u.username} ${u.verified? "✔":""}</h2>
      <button onclick='renderHome()'>Home</button>
      <button onclick='renderProfile()'>Perfil</button>
      ${u.isAdmin? "<button onclick='renderAdmin()'>Admin</button>":""}
      <button onclick='logout()'>Sair</button>
    </div>
    <div class='card'>
      <h3>Aulas</h3>
      <div id='lessons'></div>
    </div>
  `;
  const div = document.getElementById('lessons');
  let html = "";
  for(let i=1;i<=10;i++){
    const locked = i>5;
    const unlocked = !locked || u.unlockedLessons>=i;
    html += `<button onclick='openLesson(${i})'>${unlocked? "Aula "+i : "Bloqueada "+i}</button>`;
  }
  div.innerHTML = html;
}

function openLesson(i){
  const u = getSession();
  if(i>u.unlockedLessons) return alert("Bloqueada!");
  alert("Abrindo Aula "+i+" (versão estática)");
}

function renderProfile(){
  const u = getSession();
  if(!u) return renderLogin();
  app.innerHTML = `
    <div class='card'>
      <h2>Perfil</h2>
      Usuário: ${u.username} ${u.verified? "✔":""}<br>
      <button onclick='renderHome()'>Voltar</button>
    </div>
  `;
}

function renderAdmin(){
  const u = getSession();
  if(!u || !u.isAdmin) return renderHome();
  const db = loadDB();
  let usersHTML = "";
  db.users.forEach(us=>{
    usersHTML += `
      <div>
        ${us.username} ${us.verified?"✔":""} ${us.banned?"(Banido)":""}
        ${us.banned? 
           `<button onclick='unban(${us.id})'>Desbanir</button>` :
           `<button onclick='ban(${us.id})'>Banir</button>`}
      </div>
    `;
  });
  app.innerHTML = `
    <div class='card'>
      <h2>Painel Admin</h2>
      <button onclick='renderHome()'>Voltar</button>
      <h3>Usuários</h3>
      ${usersHTML}
    </div>
  `;
}

function ban(id){
  const db = loadDB();
  const u = db.users.find(x=>x.id===id);
  if(u){ u.banned = true; saveDB(db); renderAdmin(); }
}
function unban(id){
  const db = loadDB();
  const u = db.users.find(x=>x.id===id);
  if(u){ u.banned = false; saveDB(db); renderAdmin(); }
}

function logout(){ localStorage.removeItem('englishplay_session'); renderLogin(); }

renderLogin();
