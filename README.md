EnglishPlay - Minimal project scaffold
=====================================

Instructions:
1. Install dependencies: npm install
2. Start backend: node server/server.js
3. Start frontend: npm run dev
Backend runs on port 3000, Vite on 5173 (proxy /api -> http://localhost:3000)

Create a .env file inside server/ with:
OPENAI_KEY=your_openai_key
MP_ACCESS_TOKEN=your_mercadopago_access_token



IMPORTANT: Admin user setup
- There is **no placeholder admin account** in the project. To obtain admin privileges, **create a new user with the exact username**
  `Administrador.EnglishPlay` using the registration form in the app.
- The registration process enforces unique usernames, so only the first account created with that exact username will become the admin (has `isAdmin: true` and `verified: true`).
- After registering that username, the account will have access to the Admin panel (button appears in the header).

Security reminder:
- Only create the admin account in a secure environment. In production, protect admin credentials, enable HTTPS, and consider additional authentication (2FA).
