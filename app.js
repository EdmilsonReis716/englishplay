// app.js - main app behavior
function getUsers(){ try{return JSON.parse(localStorage.getItem('ep_users')||'[]')}catch(e){return[]} }
function saveUsers(u){ localStorage.setItem('ep_users', JSON.stringify(u)); }
function getCurrent(){ return localStorage.getItem('ep_current'); }
document.addEventListener('DOMContentLoaded', ()=>{
  const path = location.pathname.split('/').pop();
  if((path===''||path==='index.html') && !getCurrent()){ location.href='login.html'; return; }
  if(path===''||path==='index.html'){
    const users = getUsers(); const me = users.find(u=> u.email===getCurrent());
    if(!me){ location.href='login.html'; return; }
    const params = new URLSearchParams(location.search); const isNew = params.get('new');
    if(isNew==='1'){ document.getElementById('questionario').style.display='block'; document.getElementById('q-email').value = me.email; document.getElementById('q-name').value = me.name; }
    else { document.getElementById('mainMenu').style.display='block'; document.getElementById('userName').textContent = me.name; document.getElementById('dailyTarget').textContent = (me.target||7)+' dias'; }
    const personArea = document.querySelector('.personagens');
    personArea.innerHTML = `<div class="char" id="char-SrTV"><img src="logo.png"><div class="mouth"></div><div class="small">Sr. TV</div><div style="margin-top:8px"><button class="btn" data-char="SrTV">Falar</button></div></div><div class="char" id="char-Emma"><img src="logo.png"><div class="mouth"></div><div class="small">Emma</div><div style="margin-top:8px"><button class="btn" data-char="Emma">Falar</button></div></div><div class="char" id="char-Jake"><img src="logo.png"><div class="mouth"></div><div class="small">Jake</div><div style="margin-top:8px"><button class="btn" data-char="Jake">Falar</button></div></div>`;
    personArea.querySelectorAll('button[data-char]').forEach(b=>b.addEventListener('click',(e)=>{ const who=e.currentTarget.getAttribute('data-char'); const lines={'SrTV':"Olá! Eu sou Sr. TV, seu suporte.",'Emma':'Oi! Vou te ajudar com saudações.','Jake':'E aí! Vou corrigir você.'}; speakLocal(lines[who], who); }));
    const grid = document.getElementById('lessonsGrid'); grid.innerHTML=''; const completed = me.completed||[];
    for(let i=1;i<=6;i++){ const card=document.createElement('div'); card.className='lesson-card'; const title=document.createElement('h3'); title.textContent='Aula '+i; const p=document.createElement('p'); p.className='small'; p.textContent = i<=2 ? 'Grátis' : 'Pago'; const btn=document.createElement('a'); btn.className='btn'; if(completed.includes(i)){ btn.textContent='Revisar '+i; btn.href='lesson'+(i<=2?i:1)+'.html'; } else { if(i<=2){ btn.textContent='Abrir Aula '+i; btn.href='lesson'+i+'.html'; } else { btn.textContent='Desbloquear'; btn.href='#'; btn.addEventListener('click',(ev)=>{ev.preventDefault(); openPay( i );}); } } card.appendChild(title); card.appendChild(p); card.appendChild(btn); grid.appendChild(card); }
    document.getElementById('threeDots').addEventListener('click', ()=>{ const m=document.getElementById('menuDots'); m.style.display=(m.style.display==='block')? 'none':'block'; });
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('ep_current'); location.href='login.html'; });
    document.getElementById('editProfileBtn').addEventListener('click', ()=> location.href='profile.html');
    document.getElementById('notifCfgBtn').addEventListener('click', ()=>{ alert('Configurações de notificação (local)'); });
    document.getElementById('openBot').addEventListener('click', ()=>{ window.open('bot.html','bot','width=420,height=640'); });
    const form = document.getElementById('quizForm'); if(form) form.addEventListener('submit',(e)=>{ e.preventDefault(); me.age=document.getElementById('q-age').value; me.target=Number(document.getElementById('q-target').value)||7; me.reason=document.getElementById('q-reason').value; me.source=document.getElementById('q-source').value; saveUsers(users); document.getElementById('questionario').style.display='none'; document.getElementById('mainMenu').style.display='block'; });
  }
});
function speakLocal(text, who){ if(!('speechSynthesis' in window)) return; const utter = new SpeechSynthesisUtterance(text); utter.lang='pt-BR'; if(who==='SrTV'){utter.rate=0.95;utter.pitch=0.9} if(who==='Emma'){utter.rate=1.05;utter.pitch=1.2} window.speechSynthesis.speak(utter); }
function openPay(lesson){ const user = getCurrent(); if(!user){ alert('Faça login primeiro'); return; } // calls backend /create-checkout-session (Stripe) - deploy backend accordingly
  fetch('/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({lesson:lesson, userEmail:user})}).then(r=>r.json()).then(j=>{ if(j && j.url){ window.location.href = j.url; } else alert('Erro ao iniciar pagamento. Backend não configurado.'); }).catch(e=>{ alert('Erro de conexão com o servidor de pagamento.'); });
}
