# EnglishPlay Fullstack (GitHub-ready) - Enhanced

This repo includes:
- Socket.io real-time chat (server+client) with persisted messages (lowdb)
- Payment scaffolds for Stripe and MercadoPago (server-side placeholders) + PIX simulation
- Animated SVG characters and client-side TTS (Web Speech API)
- GitHub Actions workflow skeleton for CI and placeholder deploy step

## Quick start (local)
1. cd server
2. npm install
3. copy ../.env.example to ../.env and set values (JWT_SECRET, STRIPE_SECRET_KEY, MP_ACCESS_TOKEN, OPENAI_API_KEY)
4. npm start
5. Open http://localhost:3000

## Notes on payments
- Stripe: set STRIPE_SECRET_KEY; endpoint `/api/payment/stripe-intent` creates a PaymentIntent — client integration (Stripe.js) required.
- MercadoPago: set MP_ACCESS_TOKEN; endpoint `/api/payment/mercadopago` creates a preference and returns `init_point` for redirect to checkout.
- PIX: client still generates QR by encoding the PIX key; server has `simulate` endpoint to unlock for demo.

## TTS and characters
- Characters are implemented as animated SVGs + a speak button using the browser's SpeechSynthesis API.
- For production-quality voiced characters, integrate a TTS provider (e.g., ElevenLabs, Azure, or OpenAI TTS) on the server and serve pre-signed audio URLs.

## Deploy
- Initialize git, push to GitHub.
- Connect repo to Render, Railway or similar; set required environment variables in the provider's dashboard.
- GitHub Actions workflow is a starting point — modify to match your chosen host's deployment method.
