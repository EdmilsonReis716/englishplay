/* ===============================================================
   mascotes.js — Sistema de mascotes do EnglishPlay
   Inclui:
   ✔ Sr. TV (principal)
   ✔ Joe (mascote amigável)
   ✔ Cássia (professora)
   ✔ Sistema de fala
   ✔ Animações
   ✔ Reações de erro e acerto
================================================================ */


/* ---------------------------------------------------------------
   CONFIGURAÇÃO DE MASCOTES
---------------------------------------------------------------- */

const MASCOTES = {
    "sr_tv": {
        nome: "Sr. TV",
        img: "logo.png", 
        frases_acerto: [
            "Excelente! Continue assim!",
            "Muito bem! Você está arrasando!",
            "Perfeito! Próxima!",
            "Boa! Você está melhorando!"
        ],
        frases_erro: [
            "Ops! Vamos tentar novamente!",
            "Quase lá! Não desista!",
            "Nada de desanimar. Tente outra vez!",
            "Errou, mas tudo bem — faz parte!"
        ],
        frases_normais: [
            "Pronto para continuar?",
            "Eu acredito em você!",
            "Lembre-se de praticar todos os dias!",
            "Vamos aprender mais uma?"
        ]
    },

    "joe": {
        nome: "Joe",
        img: "https://cdn-icons-png.flaticon.com/512/163/163801.png",
        frases_normais: [
            "Relaxa, vai dar certo!",
            "Eu tô contigo nessa!",
            "Aprender é passo a passo!",
            "Muito orgulho de você!"
        ]
    },

    "cassia": {
        nome: "Cássia",
        img: "https://cdn-icons-png.flaticon.com/512/2922/2922510.png",
        frases_normais: [
            "Você está indo muito bem!",
            "Continue praticando!",
            "Excelente dedicação!",
            "Vamos revisar juntos!"
        ]
    }
};


/* ---------------------------------------------------------------
   CRIAR ELEMENTO DO MASCOTE NA PÁGINA (UMA VEZ APENAS)
---------------------------------------------------------------- */

let mascoteElement = null;
let mascoteTexto = null;

function criarMascote() {
    if (mascoteElement) return; // já existe

    mascoteElement = document.createElement("div");
    mascoteElement.id = "mascote-box";
    mascoteElement.style.position = "fixed";
    mascoteElement.style.bottom = "25px";
    mascoteElement.style.right = "25px";
    mascoteElement.style.width = "220px";
    mascoteElement.style.background = "#111";
    mascoteElement.style.border = "3px solid #ffcc00";
    mascoteElement.style.borderRadius = "20px";
    mascoteElement.style.padding = "15px";
    mascoteElement.style.textAlign = "center";
    mascoteElement.style.zIndex = "9999";
    mascoteElement.style.opacity = "0";
    mascoteElement.style.transition = "0.4s ease";

    mascoteElement.innerHTML = `
        <img id="mascote-img" src="logo.png" style="
            width: 110px;
            margin-bottom: 10px;
            animation: float 2.5s infinite ease-in-out;
        ">
        <p id="mascote-texto" style="
            font-size: 16px;
            color: #fff;
            margin-top: 10px;
        ">Olá!</p>
    `;

    document.body.appendChild(mascoteElement);

    mascoteTexto = document.getElementById("mascote-texto");
}


/* ---------------------------------------------------------------
   EXIBIR MASCOTE COM ANIMAÇÃO
---------------------------------------------------------------- */

function mostrarMascote() {
    criarMascote();
    setTimeout(() => {
        mascoteElement.style.opacity = "1";
    }, 50);
}

function esconderMascote() {
    if (!mascoteElement) return;
    mascoteElement.style.opacity = "0";
}


/* ---------------------------------------------------------------
   FUNÇÃO PÚBLICA: mascote fala algo
---------------------------------------------------------------- */

function mascoteFala(msg = null, tipo = "normal") {
    mostrarMascote();

    const m = MASCOTES["sr_tv"]; // mascote padrão

    if (!msg) {
        if (tipo === "acerto")
            msg = m.frases_acerto[Math.floor(Math.random() * m.frases_acerto.length)];

        else if (tipo === "erro")
            msg = m.frases_erro[Math.floor(Math.random() * m.frases_erro.length)];

        else
            msg = m.frases_normais[Math.floor(Math.random() * m.frases_normais.length)];
    }

    mascoteTexto.innerHTML = msg;
}


/* ---------------------------------------------------------------
   REAÇÕES PADRÃO PARA USAR EM LIÇÕES
---------------------------------------------------------------- */

function mascoteAcerto() {
    mascoteFala(null, "acerto");
}

function mascoteErro() {
    mascoteFala(null, "erro");
}


/* ---------------------------------------------------------------
   INICIALIZAÇÃO AUTOMÁTICA EM TODA PÁGINA
---------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    criarMascote();
    setTimeout(() => mascoteFala("Vamos começar?"), 500);
});
