# EnglishPlay — Starter Static Website (Prototype)

Este é um **pacote inicial** para o site *EnglishPlay* que você descreveu.  
Ele contém uma versão **front-end** (HTML/CSS/JS) de uma aplicação Single Page (SPA) com:

- Tela de Login e Cadastro (front-end, armazenando dados no `localStorage`).
- Questionário inicial após cadastro.
- Página inicial com **200 aulas** (5 primeiras gratuitas, desbloqueio simulado a partir da 6ª).
- Pagamento via PIX: mostra a chave PIX e permite copiar; inclui um botão para *simular* o pagamento e desbloquear todas as aulas.
- Página de Perfil com alteração de foto e nome (até 3 vezes).
- Busca simples por usuários (local).
- Áreas para Notificações, Menu lateral, e integração com IA (placeholder).
- Tema amarelo (amarelo/neon) e fundo preto conforme pedido.
- Botões animados e animações simples.

## O que **ainda falta** / pontos importantes para produção

- **Autenticação segura**: atualmente os usuários são salvos no `localStorage`. Para um site real você precisa de backend com banco de dados e autenticação (JWT, sessions).
- **Pagamentos reais**: integração com PIX e MercadoPago / Stripe precisa de backend seguro. O projeto exibe a chave PIX e permite copiar; o QR code gerador está marcado como "gerador disponível quando online". Recomendo usar a API do MercadoPago e/ou gerar QR dinâmico no servidor.
- **OpenAI / IA**: aqui há um espaço para integrar a IA (Sr. TV). Para usar a OpenAI API, crie um backend que faça a chamada à API e proteja a chave.
- **Hospedagem e SEO**: para que o logo apareça na barra do Google, adicione metatags, favicons e faça hospedagem com HTTPS.
- **Privacidade & Segurança**: protegendo senhas, dados pessoais e pagamentos.

## Como usar este pacote

1. Extraia o conteúdo do zip em um diretório.
2. Abra `index.html` no navegador (protótipo local).
3. Para desenvolvimento/produção:
   - Configure um backend (Node/Express, Firebase, etc).
   - Implemente autenticação, banco de dados e rotas de pagamento.
   - Substitua a simulação de pagamento pela integração real.

## Arquivos incluídos

- `index.html` — Single page app.
- `style.css` — Estilo (amarelo/neon, fundo preto).
- `app.js` — Lógica front-end (SPA).
- `assets/` — pasta para logo e avatar (coloque seu logo `logo.png` aqui).
- `EnglishPlay_Package_Final.zip` — seu pacote original enviado (copiado para este pacote) if available.
- `README.md` — este arquivo.

## Notas sobre o logo
- Eu incluí um lugar em `assets/logo.png`. Substitua por sua imagem (logo amarela homem cabeça de TV preto e branco).
- Para que apareça no Google quando alguém pesquisar, será necessário hospedar o site e configurar SEO (title, meta tags, og:image) e sitemap.

Boa sorte! Se quiser, eu posso:
- Gerar uma versão com QR-code gerado client-side.
- Transformar isso em um app React + backend (Node/Express) e preparar endpoints para pagamento e OpenAI.
- Criar telas mais detalhadas (design Figma) e assets animados para os personagens.
