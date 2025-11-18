// bot.js - lightweight rule-based assistant; to upgrade use OpenAI via backend
function append(msg, who){ const c=document.getElementById('chat'); const el=document.createElement('div'); el.style.padding='6px'; el.style.marginBottom='6px'; el.style.borderRadius='8px'; el.style.background = who==='bot' ? 'rgba(255,123,0,0.08)' : 'rgba(0,0,0,0.4)'; el.textContent = (who==='bot'? 'Sr. TV: ' : 'Você: ') + msg; c.appendChild(el); c.scrollTop = c.scrollHeight; }
function botReply(text){
  const t=text.toLowerCase();
  if(t.includes('pix')) return 'Você pode pagar com PIX usando o QR code no canto inferior direito.';
  if(t.includes('aula') || t.includes('desbloque')) return 'Clique em Desbloquear e siga o pagamento. Depois de confirmado, a aula será liberada.';
  if(t.includes('login')) return 'Use seu e-mail ou telefone para entrar.';
  if(t.includes('erro')) return 'Descreva o erro e eu vou ajudar. Verifique se os arquivos estão na raiz do repositório.';
  return 'Desculpe, ainda estou aprendendo. Pergunte sobre login, pagamento por PIX, aulas ou perfil.';
}
document.addEventListener('DOMContentLoaded', ()=>{ document.getElementById('sendBot').addEventListener('click', ()=>{ const t=document.getElementById('botInput').value.trim(); if(!t) return; append(t,'user'); document.getElementById('botInput').value=''; setTimeout(()=>{ const r=botReply(t); append(r,'bot'); const u=new SpeechSynthesisUtterance(r); u.lang='pt-BR'; speechSynthesis.speak(u); },400); }); });
