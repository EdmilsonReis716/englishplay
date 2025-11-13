
// app.js - EnglishPlay main behavior (dark theme + PIX QR + Firebase chat scaffold)
var PIX_QR = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson%20dos%20Reis%20Lima6009SAO%20PAULO621405102mUMXXZDnB63047198";
function getUser(){ try{ return JSON.parse(localStorage.getItem('ep_user')||'null'); }catch(e){return null;} }
function setUser(u){ localStorage.setItem('ep_user', JSON.stringify(u)); }
document.addEventListener('DOMContentLoaded', function(){
  var form = document.getElementById('quizForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var user = { email: document.getElementById('q-email').value.trim(), name: document.getElementById('q-name').value.trim(), age: document.getElementById('q-age').value.trim(), target: Number(document.getElementById('q-target').value)||7, reason: document.getElementById('q-reason').value.trim(), source: document.getElementById('q-source').value.trim(), score:0, streak:0, joined: Date.now() };
      setUser(user);
      window.location.href = 'index.html';
    });
  }
  var user = getUser();
  if(document.getElementById('userName')){
    if(user){
      document.getElementById('userName').textContent = user.name;
      document.getElementById('dailyTarget').textContent = (user.target||7) + ' dias';
      document.getElementById('questionario').style.display = 'none';
      document.getElementById('mainMenu').style.display = 'block';
    } else {
      document.getElementById('questionario').style.display = 'block';
      document.getElementById('mainMenu').style.display = 'none';
    }
  }
  // Add PIX QR to fixed corner
  if(!document.querySelector('.qr')){
    var q = document.createElement('div'); q.className='qr'; q.innerHTML = '<div style="font-size:13px;margin-bottom:6px;color:#fff">Assine R$0,99/mês</div><img src="' + PIX_QR + '" width="160"/>'; document.body.appendChild(q);
  }
  // Profile avatar handling
  var avatarInp = document.getElementById('avatarInput');
  if(document.getElementById('u-name')){
    var u = getUser()||{};
    document.getElementById('u-name').textContent = u.name||'—';
    document.getElementById('u-email').textContent = u.email||'—';
    document.getElementById('u-age').textContent = u.age||'—';
    document.getElementById('u-score').textContent = u.score||0;
    document.getElementById('u-target').textContent = (u.target||'—') + ' dias';
    document.getElementById('u-streak').textContent = u.streak||0;
    var av = localStorage.getItem('ep_avatar'); if(av){ document.getElementById('avatarImg').src = av; }
  }
  if(avatarInp){ avatarInp.addEventListener('change', function(e){ var f = e.target.files[0]; if(!f) return; var r = new FileReader(); r.onload = function(){ localStorage.setItem('ep_avatar', r.result); document.getElementById('avatarImg').src = r.result; }; r.readAsDataURL(f); }); }
  // Chat handling on profile
  if(window.location.pathname.endsWith('profile.html')){
    var sendBtn = document.getElementById('sendMsg'), input = document.getElementById('msgInput'), box = document.getElementById('chatBox');
    if(typeof firebase !== 'undefined' && firebase.firestore){
      var db = firebase.firestore();
      db.collection('messages').orderBy('time').limit(200).onSnapshot(function(snap){ box.innerHTML=''; snap.forEach(function(doc){ var d = doc.data(); var el = document.createElement('div'); el.className = 'message ' + (d.name === (getUser()||{}).name ? 'me':'other'); el.textContent = d.name + ': ' + d.text; box.appendChild(el); }); box.scrollTop = box.scrollHeight; });
      sendBtn.addEventListener('click', function(){ var text = input.value.trim(); if(!text) return; var u = getUser()||{name:'Anon'}; db.collection('messages').add({ name:u.name, text: text, time: firebase.firestore.FieldValue.serverTimestamp() }); input.value=''; });
    } else {
      function loadLocal(){ var arr = JSON.parse(localStorage.getItem('ep_chat')||'[]'); box.innerHTML=''; arr.forEach(function(m){ var el = document.createElement('div'); el.className='message ' + (m.name === (getUser()||{}).name ? 'me':'other'); el.textContent = m.name + ': ' + m.text; box.appendChild(el); }); box.scrollTop = box.scrollHeight; }
      loadLocal();
      sendBtn.addEventListener('click', function(){ var text = input.value.trim(); if(!text) return; var u = getUser()||{name:'Anon'}; var arr = JSON.parse(localStorage.getItem('ep_chat')||'[]'); arr.push({name:u.name, text: text, ts: Date.now()}); localStorage.setItem('ep_chat', JSON.stringify(arr)); input.value=''; loadLocal(); });
    }
  }
});
