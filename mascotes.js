/* ============================================================
    mascotes.js — Mascote animado EnglishPlay
============================================================ */

/*
O mascote aparece sempre no canto inferior direito,
com falas automáticas e animações.
*/

document.addEventListener("DOMContentLoaded", () => {
    criarMascote();
});

/* ===============================
   CRIAR MASCOTE NA TELA
================================ */

function criarMascote() {
    if (document.getElementById("mascoteBox")) return;

    const box = document.createElement("div");
    box.id = "mascoteBox";
    box.style.position = "fixed";
    box.style.bottom = "20px";
    box.style.right = "20px";
    box.style.width = "160px";
    box.style.textAlign = "center";
    box.style.zIndex = "99999";

    box.innerHTML = `
        <img id="mascoteImg" src="logo.png" 
            style="width:120px; border-radius:15px;">

        <div id="falaMascote"
            style="
                margin-top:8px;
                background:#ffcc00;
                color:black;
                padding:10px 12px;
                border-radius:12px;
                font-weight:600;
                display:none;
                box-shadow:0 0 10px rgba(255,255,0,0.5);
            "
        >Olá!</div>
    `;

    document.body.appendChild(box);

    // Falas iniciais
    setTimeout(() => mascoteFala("Vamos estudar? 😄"), 1500);
}

/* ===============================
   FAZER O MASCOTE FALAR
================================ */

function mascoteFala(texto) {
    const box = document.getElementById("falaMascote");
    if (!box) return;

    box.textContent = texto;
    box.style.display = "block";
    box.style.opacity = "0";

    setTimeout(() => { box.style.opacity = "1"; }, 30);

    // Esconde depois de 4 segundos
    setTimeout(() => {
        box.style.opacity = "0";
        setTimeout(() => { box.style.display = "none"; }, 500);
    }, 4000);
}

/* ===============================
   REAÇÃO DE ACERTO
================================ */

function mascoteAcerto() {
    let img = document.getElementById("
