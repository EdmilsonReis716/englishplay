const token = localStorage.getItem('token');
if (!token) { alert('Faça login'); window.location.href = '/'; }
async function me(){
  const res = await fetch('/api/users/me', { headers: { 'Authorization': 'Bearer '+token } });
  if (!res.ok) { alert('Sessão expirada'); localStorage.clear(); window.location.href = '/'; }
  const data = await res.json();
  document.getElementById('welcome').textContent = 'Olá, ' + data.user.name + (data.user.verified ? ' ✔️' : '');
  for (let i=1;i<=200;i++){ const div=document.createElement('div'); div.className='lesson-card'; div.innerHTML = '<div>Aula '+i+'</div><button class="btn">'+(i<=5||data.user.unlocked?'Abrir':'Desbloquear')+'</button>'; document.getElementById('lessons').appendChild(div); }
  initSocket(data.user);
}
me();

let socket;
function initSocket(user){
  socket = io({ auth: { token: localStorage.getItem('token') } });
  socket.on('connect', ()=> console.log('socket connected', socket.id));
  socket.on('private_message', data => {
    // if chat open and target matches, append
    const messages = document.getElementById('messages');
    if (!messages) return;
    const el = document.createElement('div'); el.textContent = data.from + ': ' + data.message; messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  });
  socket.on('typing', data => { const chatTarget = document.getElementById('chatTarget'); if (chatTarget) chatTarget.textContent = data.from + ' está digitando...'; setTimeout(()=>chatTarget.textContent = '', 1200); });

  // chat UI wiring
  document.querySelectorAll('.lesson-card button').forEach(btn => {
    btn.addEventListener('click', ()=>{ alert(btn.textContent + ' (demo)'); });
  });

  // simple method to open chat with a username (demo)
  document.addEventListener('keydown', e=>{ if (e.key==='k' && (e.ctrlKey||e.metaKey)){ const to = prompt('Abrir chat com (username):'); if (!to) return; openChat(to); } });
}

function openChat(username){
  document.getElementById('chatDrawer').classList.remove('hidden');
  document.getElementById('chatTarget').textContent = username;
  document.getElementById('sendMsg').onclick = ()=>{
    const msg = document.getElementById('msgInput').value; if (!msg) return;
    socket.emit('private_message', { from: JSON.parse(localStorage.getItem('user')).username, to: username, message: msg });
    const messages = document.getElementById('messages'); const el = document.createElement('div'); el.textContent = 'Você: ' + msg; messages.appendChild(el); document.getElementById('msgInput').value=''; messages.scrollTop = messages.scrollHeight;
  };
  document.getElementById('msgInput').addEventListener('input', ()=>{ socket.emit('typing', { from: JSON.parse(localStorage.getItem('user')).username, to: username }); });
  document.getElementById('closeChat').onclick = ()=> document.getElementById('chatDrawer').classList.add('hidden');
}
