<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificações — EnglishPlay</title>

    <link rel="stylesheet" href="estilo.css">

    <style>
        .notif-container {
            width: 700px;
            margin: 140px auto;
            background: #111;
            border: 3px solid #ffcc00;
            border-radius: 20px;
            padding: 25px;
        }

        .notif-title {
            font-size: 28px;
            font-weight: 700;
            color: #ffcc00;
            text-align: center;
            margin-bottom: 25px;
        }

        .notif-box {
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 12px;
        }

        .notif-actions {
            margin-top: 12px;
            display: flex;
            gap: 12px;
        }

        .btn-accept {
            background: #00ff80;
            padding: 8px 12px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            color: black;
        }

        .btn-refuse {
            background: #ff5050;
            padding: 8px 12px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            color: white;
        }

        .empty-text {
            text-align: center;
            opacity: 0.7;
            padding: 20px 0;
        }
    </style>
</head>
<body>

<!-- NAVBAR -->
<div class="navbar">
    <div class="nav-left" onclick="location.href='index.html'">
        <img src="logo.png">
        <div class="nav-title">EnglishPlay</div>
    </div>

    <input type="text" disabled class="search-box" placeholder="Notificações">

    <button class="btn-yellow" onclick="logout()">Sair</button>
</div>

<div class="notif-container">
    <div class="notif-title">🔔 Notificações</div>

    <h3 style="color:#ffcc00">Pedidos de Amizade</h3>
    <div id="amigosArea"></div>

    <h3 style="color:#ffcc00; margin-top:25px;">Notificações do Sistema</h3>
    <div id="sistemaArea" class="empty-text">Nenhuma notificação no momento.</div>
</div>

<script src="storage.js"></script>
<script src="mascotes.js"></script>

<script>
/* ============================================================
   PREPARAR SISTEMA DE NOTIFICAÇÕES
============================================================ */

let meuNome = getLoggedUser();
if (!meuNome) location.href = "auth.html";

let users = loadUsers();

if (!users[meuNome].pendingRequests) {
    users[meuNome].pendingRequests = [];
    localStorage.setItem("englishplay_users", JSON.stringify(users));
}

let pendentes = users[meuNome].pendingRequests;

/* ============================================================
   GERAR LISTA DE SOLICITAÇÕES
============================================================ */

let area = document.getElementById("amigosArea");

function gerarLista() {
    area.innerHTML = "";

    if (pendentes.length === 0) {
        area.innerHTML = `<div class="empty-text">Nenhum pedido de amizade.</div>`;
        return;
    }

    pendentes.forEach((nome, index) => {
        let box = document.createElement("div");
        box.className = "notif-box";

        box.innerHTML = `
            <div><b>${nome}</b> quer ser seu amigo!</div>

            <div class="notif-actions">
                <button class="btn-accept" onclick="aceitar(${index}, '${nome}')">Aceitar</button>
                <button class="btn-refuse" onclick="recusar(${index})">Recusar</button>
            </div>
        `;

        area.appendChild(box);
    });
}

gerarLista();

/* ============================================================
   ACEITAR / RECUSAR PEDIDO
============================================================ */

function aceitar(index, amigo) {
    let users = loadUsers();

    // Adiciona amizade nos 2 lados
    users[meuNome].friends.push(amigo);
    users[amigo].friends.push(meuNome);

    // Remove da lista de pendentes
    users[meuNome].pendingRequests.splice(index, 1);

    localStorage.setItem("englishplay_users", JSON.stringify(users));

    mascoteFala("Amizade aceita!");

    pendentes = users[meuNome].pendingRequests;
    gerarLista();
}

function recusar(index) {
    let users = loadUsers();

    users[meuNome].pendingRequests.splice(index, 1);
    localStorage.setItem("englishplay_users", JSON.stringify(users));

    mascoteFala("Pedido recusado!");
    pendentes = users[meuNome].pendingRequests;
    gerarLista();
}

/* ============================================================
   SAIR
============================================================ */

function logout() {
    localStorage.removeItem("englishplay_logged_user");
    location.href = "auth.html";
}
</script>

</body>
</html>
