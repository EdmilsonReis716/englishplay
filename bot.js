
/* bot.js — polished chat UI + OpenAI integration fallback */
/* Usage: set window.ENGLISHPLAY_OPENAI_KEY = '<your-key>' before loading this script to enable live AI responses. */
/* If no key provided, the bot uses a local heuristic fallback to answer general questions. */

(function(){
  // Simple DOM builder for the bot page; if bot.html already had UI, this will enhance it.
  function initUI(){
    const app = document.getElementById('chat-root');
    if(!app) return;
    app.innerHTML = `
      <div class="chat-wrap">
        <div class="chat-header">
          <h3>Assistente EnglishPlay</h3>
          <p class="small">Pergunte qualquer coisa — se você configurar uma API key, o assistente usará IA real.</p>
        </div>
        <div id="messages" class="messages" aria-live="polite"></div>
        <form id="chat-form" class="chat-form">
          <input id="prompt" autocomplete="off" placeholder="Escreva sua pergunta..." required />
          <button type="submit">Enviar</button>
        </form>
      </div>`;
    // attach handlers
    const form = document.getElementById('chat-form');
    const messages = document.getElementById('messages');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const input = document.getElementById('prompt');
      const text = input.value.trim();
      if(!text) return;
      appendMessage('Você', text, true);
      input.value='';
      const reply = await getReply(text);
      appendMessage('Assistente', reply, false);
      messages.scrollTop = messages.scrollHeight;
    });
  }

  function appendMessage(who, text, fromUser){
    const messages = document.getElementById('messages');
    const el = document.createElement('div');
    el.className = 'message ' + (fromUser? 'from-user':'from-bot');
    el.innerHTML = `<strong>${who}:</strong> <span class="msg-text">${escapeHtml(text)}</span>`;
    messages.appendChild(el);
  }

  function escapeHtml(str){ return str.replace(/[&<>"']/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];}); }

  async function getReply(prompt){
    // If there's an API key exposed on window, use it
    const key = window.ENGLISHPLAY_OPENAI_KEY || null;
    if(key){
      try{
        // call OpenAI Chat Completions endpoint
        const body = {
          model: "gpt-4o-mini", // example; site owner can change
          messages: [
            {role:"system", content:"Você é um assistente útil para um site chamado EnglishPlay. Responda em português quando o usuário escrever em português. Seja claro e educado."},
            {role:"user", content: prompt}
          ],
          max_tokens: 700
        };
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + key
          },
          body: JSON.stringify(body)
        });
        if(!res.ok){
          const text = await res.text();
          console.warn('OpenAI error', res.status, text);
          return 'Erro ao consultar o serviço de IA: ' + res.statusText + '. Usando modo offline.';
        }
        const data = await res.json();
        // try to extract content
        const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
        return content;
      }catch(err){
        console.error(err);
        return 'Falha na comunicação com a API de IA. Tente novamente mais tarde.';
      }
    } else {
      // fallback: simple heuristic responder (offline)
      return fallbackResponder(prompt);
    }
  }

  function fallbackResponder(text){
    // Basic heuristics to provide helpful answers offline.
    const t = text.toLowerCase();
    if(t.includes('como') && t.includes('instalar')){
      return 'Para instalar o site localmente: 1) Baixe os arquivos; 2) abra index.html em um navegador; 3) para funcionalidades de login e Stripe, execute o servidor backend e configure as chaves.';
    }
    if(t.includes('preço') || t.includes('pagar') || t.includes('stripe')){
      return 'O sistema tem integração com Stripe no diretório /backend-stripe. Você precisa das chaves Stripe no servidor (variáveis de ambiente) e expor endpoints seguros. Posso gerar o passo a passo.';
    }
    if(t.includes('ajuda') || t.includes('erro') || t.includes('bug')){
      return 'Descreva o erro que aparece no console do navegador (F12) e eu te ajudo a consertar. Inclua mensagens de erro e o arquivo onde ocorre.';
    }
    if(t.includes('olá') || t.includes('oi')){
      return 'Olá! Em que posso ajudar hoje? Posso explicar gramática, revisar códigos ou ajudar a melhorar o site.';
    }
    // generic fallback — try to give structure
    const answer = `Boa pergunta! Aqui vão algumas sugestões de como responder: 1) Resuma o que você quer saber; 2) forneça contexto (p.ex. trecho de código, versão); 3) diga qual resultado espera. Se quiser, copie e cole o erro aqui.`;
    return answer;
  }

  // initialize when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initUI);
  } else initUI();

})();