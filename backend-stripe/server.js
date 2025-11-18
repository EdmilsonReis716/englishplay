// server.js - Node/Express example for Stripe Checkout
// Install: npm install express stripe body-parser cors
const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

app.post('/create-checkout-session', async (req, res) => {
  const { lesson, userEmail } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'brl', product_data: { name: `Desbloqueio Aula ${lesson}` }, unit_amount: 99 }, quantity: 1 }],
      mode: 'payment',
      success_url: (process.env.ORIGIN || 'https://your-frontend') + '/index.html',
      cancel_url: (process.env.ORIGIN || 'https://your-frontend') + '/index.html',
      customer_email: userEmail,
      metadata: { lesson }
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Webhook handler should be implemented on your server to listen for checkout.session.completed events
app.listen(process.env.PORT || 3000, ()=> console.log('Stripe backend running'));
