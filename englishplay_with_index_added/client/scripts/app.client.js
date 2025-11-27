const API = '/api';
document.addEventListener('DOMContentLoaded', ()=>{
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  showSignup.addEventListener('click', ()=>{document.getElementById('signupForm').classList.remove('hidden');document.getElementById('loginForm').classList.add('hidden');});
  showLogin.addEventListener('click', ()=>{document.getElementById('signupForm').classList.add('hidden');document.getElementById('loginForm').classList.remove('hidden');});

  document.getElementById('signupForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const contact = document.getElementById('signupContact').value;
    const name = document.getElementById('signupName').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPass').value;
    const res = await fetch(API+'/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contact,name,username,password})});
    const data = await res.json();
    if (res.ok){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); window.location.href = '/dashboard.html'; }
    else alert(data.error || JSON.stringify(data));
  });

  document.getElementById('loginForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const id = document.getElementById('loginId').value;
    const password = document.getElementById('loginPass').value;
    const res = await fetch(API+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,password})});
    const data = await res.json();
    if (res.ok){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); window.location.href = '/dashboard.html'; }
    else alert(data.error || 'Falha no login');
  });
});
