
// EnglishPlay client (localStorage) with speech + mouth animation
const PIX_PAYLOAD = "00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson dos Reis Lima6009SAO PAULO621405102mUMXXZDnB63047198";
const PIX_QR = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=00020126580014BR.GOV.BCB.PIX0136d9b1e552-e431-4d8b-b28e-eca5cddf654252040000530398654040.995802BR5922Edmilson%20dos%20Reis%20Lima6009SAO%20PAULO621405102mUMXXZDnB63047198";

function getUsers(){ try{return JSON.parse(localStorage.getItem('ep_users')||'[]')}catch(e){return[]} }
function saveUsers(u){ localStorage.setItem('ep_users', JSON.stringify(u)); }
function getCurrent(){ return localStorage.getItem('ep_current'); }
function setCurrent(e){ localStorage.setItem('ep_current', e); }

function speakCharacter(text, who){ if(!('speechSynthesis' in window)) return; const utter = new SpeechSynthesisUtterance(text); utter.lang='en-US'; if(who==='SrTV'){utter.rate=0.95;utter.pitch=0.8} if(who==='Emma'){utter.rate=1.05;utter.pitch=1.2} if(who==='Jake'){utter.rate=0.95;utter.pitch=0.9} const voices = speechSynthesis.getVoices(); if(voices.length) utter.voice = voices.find(v=>v.lang && v.lang.startsWith('en'))||voices[0]; const mouth = document.querySelector('#char-'+who+' .mouth'); utter.onstart = ()=>{ if(mouth) mouth.classList.add('talk'); }; utter.onend = ()=>{ if(mouth) mouth.classList.remove('talk'); }; speechSynthesis.speak(utter); }

document.addEventListener('DOMContentLoaded', ()=>{
  const path = location.pathname.split('/').pop();
  const cur = getCurrent();
  if((path===''||path==='index.html') && !cur){ location.href='login.html'; return; }
  if(path==='index.html' || path===''){
    const users = getUsers(); const me = users.find(u=>u.email===getCurrent()); if(!me){ location.href='login.html'; return; }
    const params = new URLSearchParams(location.search); const isNew = params.get('new');
    if(isNew==='1') document.getElementById('questionario').style.display='block'; else document.getElementById('mainMenu').style.display='block';
    document.getElementById('userName').textContent = me.name; document.getElementById('dailyTarget').textContent = (me.target||7)+' dias';

    const personArea = document.querySelector('.personagens');
    if(personArea){
      personArea.innerHTML = `
      <div class="char" id="char-SrTV"><img src="srtv.png"><div class="mouth"></div><div class="small">Sr. TV</div><div style="margin-top:8px"><button class="btn" data-char="SrTV">Falar</button></div></div>
      <div class="char" id="char-Emma"><img src="emma.png"><div class="mouth"></div><div class="small">Emma</div><div style="margin-top:8px"><button class="btn" data-char="Emma">Falar</button></div></div>
      <div class="char" id="char-Jake"><img src="jake.png"><div class="mouth"></div><div class="small">Jake</div><div style="margin-top:8px"><button class="btn" data-char="Jake">Falar</button></div></div>
      `;
      personArea.querySelectorAll('button[data-char]').forEach(b=>b.addEventListener('click', (e)=>{
        const who = e.currentTarget.getAttribute('data-char');
        const lines = { 'SrTV': "Welcome to EnglishPlay — let's learn together!", 'Emma': 'Hi there! I will help you practice greetings.', 'Jake': "Yo! I'm Jake — I will correct your mistakes." };
        speakCharacter(lines[who], who);
      }));
    }

    const grid = document.getElementById('lessonsGrid'); grid.innerHTML=''; const completed = me.completed||[];
    for(let i=1;i<=6;i++){ const card = document.createElement('div'); card.className='lesson-card'; const title = document.createElement('h3'); title.textContent='Aula '+i; const p = document.createElement('p'); p.className='small'; p.textContent = i<=2 ? 'Grátis' : 'Pago'; const btn = document.createElement('a'); btn.className='btn'; if(completed.includes(i)){ btn.textContent='Revisar '+i; btn.href = 'lesson'+(i<=2?i:1)+'.html'; } else { if(i<=2){ btn.textContent='Abrir Aula '+i; btn.href='lesson'+i+'.html'; } else { btn.textContent='Desbloquear'; btn.href='#'; btn.addEventListener('click', (ev)=>{ ev.preventDefault(); openPayModal(i); }); } } card.appendChild(title); card.appendChild(p); card.appendChild(btn); grid.appendChild(card); }

    const form = document.getElementById('quizForm'); if(form) form.addEventListener('submit', (e)=>{ e.preventDefault(); me.age = document.getElementById('q-age').value; me.target = Number(document.getElementById('q-target').value)||7; saveUsers(users); document.getElementById('questionario').style.display='none'; document.getElementById('mainMenu').style.display='block'; });

    const notifBtn = document.getElementById('notifBtn'); const notifCount = document.getElementById('notifCount'); const ncount = (me.notifications||[]).length; if(ncount>0){ notifCount.style.display='inline-block'; notifCount.textContent=ncount; } else notifCount.style.display='none';
    notifBtn.addEventListener('click', ()=>{ const list = me.notifications||[]; if(list.length===0) return alert('Sem notificações'); const txt = list.map(n=> n.from + ' — ' + n.type).join('\n'); if(confirm('Notificações:\n'+txt+'\n\nAceitar primeiro pedido de amizade?')){ const req = list.find(x=>x.type==='friend_request'); if(req){ const users = getUsers(); const other = users.find(u=>u.email===req.email); if(other){ me.friends = me.friends||[]; other.friends = other.friends||[]; if(!me.friends.includes(other.email)) me.friends.push(other.email); if(!other.friends.includes(me.email)) other.friends.push(me.email); me.notifications = me.notifications.filter(x=> x!==req); saveUsers(users); alert('Amizade aceita!'); window.location.reload(); } } } });

    document.getElementById('threeDots').addEventListener('click', ()=>{ const m = document.getElementById('menuDots'); m.style.display = (m.style.display==='block')? 'none' : 'block'; });
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('ep_current'); location.href='login.html'; });
  }

  if(path==='profile.html'){
    const email = getCurrent(); if(!email){ location.href='login.html'; return; } const users = getUsers(); const me = users.find(x=> x.email===email);
    if(me){ document.getElementById('u-name').textContent = me.name; document.getElementById('u-email').textContent = me.email; document.getElementById('u-age').textContent = me.age||'—'; document.getElementById('u-score').textContent = me.score||0; document.getElementById('u-target').textContent = (me.target||'—') + ' dias'; document.getElementById('u-streak').textContent = me.streak||0; if(me.avatar) document.getElementById('avatarImg').src = me.avatar; }
    document.getElementById('avatarInput').addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{ document.getElementById('avatarImg').src = r.result; const users = getUsers(); const u = users.find(x=> x.email===email); if(u){ u.avatar = r.result; saveUsers(users); } }; r.readAsDataURL(f); });
    document.getElementById('doSearch').addEventListener('click', ()=>{ const q = document.getElementById('searchName').value.trim().toLowerCase(); const users = getUsers(); const res = users.filter(x=> x.name.toLowerCase().includes(q)); const out = document.getElementById('searchResults'); out.innerHTML = ''; if(res.length===0){ out.textContent = 'Nenhum usuário encontrado'; return; } res.forEach(u=>{ const div = document.createElement('div'); div.style.display='flex'; div.style.alignItems='center'; div.style.gap='8px'; const img = document.createElement('img'); img.src = u.avatar || 'avatar-placeholder.png'; img.style.width='48px'; img.style.height='48px'; img.style.borderRadius='8px'; const txt = document.createElement('div'); txt.innerHTML = '<strong>'+u.name+'</strong><br><span class="small">'+(u.email||'')+'</span>'; const btn = document.createElement('button'); btn.className='btn'; btn.textContent = (me.friends && me.friends.includes(u.email))? 'Conversar' : 'Convidar amizade'; btn.addEventListener('click', ()=>{ if(me.email===u.email) return; if(me.friends && me.friends.includes(u.email)){ alert('Abrindo chat local'); return; } const all = getUsers(); const target = all.find(x=> x.email===u.email); if(!target) return; target.notifications = target.notifications || []; target.notifications.push({ from: me.name, type: 'friend_request', ts: Date.now(), email: me.email }); saveUsers(all); alert('Pedido de amizade enviado'); }); div.appendChild(img); div.appendChild(txt); div.appendChild(btn); out.appendChild(div); }); });
    document.getElementById('sendMsg').addEventListener('click', ()=>{ const t = document.getElementById('msgInput').value.trim(); if(!t) return; const arr = JSON.parse(localStorage.getItem('ep_chat')||'[]'); arr.push({ from: me.email, name: me.name, text: t, ts: Date.now() }); localStorage.setItem('ep_chat', JSON.stringify(arr)); document.getElementById('msgInput').value = ''; const box = document.getElementById('chatBox'); box.innerHTML = ''; const a = JSON.parse(localStorage.getItem('ep_chat')||'[]'); a.forEach(m=>{ const el = document.createElement('div'); el.textContent = (m.name?m.name:m.from) + ': ' + m.text; box.appendChild(el); }); });
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('ep_current'); location.href='login.html'; });
  }

});
function openPayModal(lesson){ const modal = document.createElement('div'); modal.style.position='fixed'; modal.style.left=0; modal.style.top=0; modal.style.right=0; modal.style.bottom=0; modal.style.background='rgba(2,6,23,0.6)'; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.zIndex=9999; modal.innerHTML = '<div style="background:#071827;padding:18px;border-radius:10px;max-width:560px;color:#e6f4ff"><h3>Desbloquear Aula ' + lesson + '</h3><p>Pagamento via PIX (chave EMV) ou cartão (simulado).</p><div style="display:flex;gap:12px;align-items:center"><img src="' + PIX_QR + '" width="160"><div><button class="btn" id="copyPix">Copiar código PIX</button></div></div><hr><div><h4>Pagamento com cartão (simulado)</h4><input class="input" placeholder="Número do cartão"><input class="input" placeholder="MM/AA"><input class="input" placeholder="CVV"><div style="text-align:right;margin-top:8px"><button class="btn" id="payCard">Pagar (simulado)</button></div></div><div style="text-align:right;margin-top:8px"><button id="closeModal" class="btn">Fechar</button></div></div>'; document.body.appendChild(modal); document.getElementById('closeModal').addEventListener('click', ()=> modal.remove()); document.getElementById('copyPix').addEventListener('click', ()=> { navigator.clipboard.writeText(PIX_PAYLOAD); alert('Código PIX copiado'); }); document.getElementById('payCard').addEventListener('click', ()=>{ alert('Pagamento simulado — obrigado'); var cur = getCurrent(); var users = getUsers(); var me = users.find(x=>x.email===cur); if(me){ me.completed = me.completed || []; if(!me.completed.includes(3)) me.completed.push(3); saveUsers(users); } modal.remove(); location.reload(); }); }
