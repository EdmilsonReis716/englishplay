/* mascotes.js — mascotes ampliado para Sr.Tv, Joe e Cássia
   Fornece:
   - criarMascote(nome)            -> mostra mascote específico
   - mascoteFala(text, nome)       -> mostra texto e animação
   - mascoteAcerto(nome), mascoteErro(nome)
   - hideMascote()
   Integra com CSS já incluído (posição fixa no canto).
*/

const MASCOTES_CONF = {
  "sr_tv": {
    displayName: "Sr. TV",
    img: "logo.png", // substitua se tiver imagem própria
    phrases: {
      normal: ["Vamos lá!", "Bora praticar mais um pouco?", "Você está indo bem!"],
      success: ["Excelente!", "Perfeito!", "Você mandou bem!"],
      fail: ["Quase lá!", "Tente de novo!", "Errou por pouco — vamos revisar."]
    }
  },
  "joe": {
    displayName: "Joe",
    img: "https://cdn-icons-png.flaticon.com/512/163/163801.png",
    phrases: {
      normal: ["Relaxa, calma.", "Você consegue!"],
      success: ["Boa!", "Continue assim!"],
      fail: ["Não desanima!", "Pratique mais essa parte."]
    }
  },
  "cassia": {
    displayName: "Cássia",
    img: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
    phrases: {
      normal: ["Vamos revisar juntos?", "Muito bom!"],
      success: ["Ótimo trabalho!", "Você progrediu!"],
      fail: ["Repare nessa regra...", "Vou te explicar rapidinho."]
    }
  }
};

let _mascoteEl = null;
let _mascoteTimeout = null;
let _currentMascote = "sr_tv";

function _createMascoteElement() {
  if (_mascoteEl) return;
  _mascoteEl = document.createElement("div");
  _mascoteEl.id = "ep-mascote";
  Object.assign(_mascoteEl.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    width: "220px",
    background: "#0b0b0b",
    border: "3px solid #ffcc00",
    borderRadius: "18px",
    padding: "12px",
    zIndex: 99999,
    boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
    opacity: "0",
    transition: "all .35s ease"
  });
  _mascoteEl.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img id="ep-mascote-img" src="${MASCOTES_CONF[_currentMascote].img}" style="width:84px;height:84px;border-radius:12px;object-fit:cover;"/>
      <div style="flex:1">
        <div id="ep-mascote-name" style="font-weight:800;color:#ffcc00;margin-bottom:6px;"></div>
        <div id="ep-mascote-text" style="font-size:14px;color:#fff;line-height:1.2"></div>
      </div>
    </div>
  `;
  document.body.appendChild(_mascoteEl);
}

function showMascote(name = "sr_tv") {
  _currentMascote = name in MASCOTES_CONF ? name : "sr_tv";
  _createMascoteElement();
  const img = document.getElementById("ep-mascote-img");
  const nm = document.getElementById("ep-mascote-name");
  const txt = document.getElementById("ep-mascote-text");

  img.src = MASCOTES_CONF[_currentMascote].img;
  nm.textContent = MASCOTES_CONF[_currentMascote].displayName;
  txt.textContent = MASCOTES_CONF[_currentMascote].phrases.normal[ Math.floor(Math.random() * MASCOTES_CONF[_currentMascote].phrases.normal.length) ];

  requestAnimationFrame(()=>{ _mascoteEl.style.opacity = "1"; _mascoteEl.style.transform = "translateY(0px)"; });

  if (_mascoteTimeout) clearTimeout(_mascoteTimeout);
  _mascoteTimeout = setTimeout(()=>{ hideMascote(); }, 6000);
}

function hideMascote() {
  if (!_mascoteEl) return;
  _mascoteEl.style.opacity = "0";
  _mascoteEl.style.transform = "translateY(12px)";
}

function mascoteFala(text = null, name = "sr_tv", duration = 6000) {
  showMascote(name);
  const txt = document.getElementById("ep-mascote-text");
  if (txt) {
    txt.textContent = text || MASCOTES_CONF[name].phrases.normal[Math.floor(Math.random()*MASCOTES_CONF[name].phrases.normal.length)];
  }
  if (_mascoteTimeout) clearTimeout(_mascoteTimeout);
  _mascoteTimeout = setTimeout(()=> hideMascote(), duration);
}

function mascoteAcerto(name = "sr_tv", extraText = null) {
  const p = MASCOTES_CONF[name].phrases.success[Math.floor(Math.random()*MASCOTES_CONF[name].phrases.success.length)];
  mascoteFala(extraText || p, name, 4000);
}

function mascoteErro(name = "sr_tv", extraText = null) {
  const p = MASCOTES_CONF[name].phrases.fail[Math.floor(Math.random()*MASCOTES_CONF[name].phrases.fail.length)];
  mascoteFala(extraText || p, name, 5000);
}

/* Expor globalmente */
window.mascoteFala = mascoteFala;
window.mascoteAcerto = mascoteAcerto;
window.mascoteErro = mascoteErro;
window.showMascote = showMascote;
window.hideMascote = hideMascote;

/* Auto-iniciar uma saudação curta (quando a página carrega) */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(()=> showMascote("sr_tv"), 700);
});
