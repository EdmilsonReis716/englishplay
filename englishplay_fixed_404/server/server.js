require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// optional payments
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
let mercadopago = null;
if (process.env.MP_ACCESS_TOKEN) mercadopago = require('mercadopago');
if (mercadopago && process.env.MP_ACCESS_TOKEN) mercadopago.configurations = { access_token: process.env.MP_ACCESS_TOKEN };

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'..','client')));

const file = path.join(__dirname,'data','db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);
async function init(){ await db.read(); db.data = db.data || { users:[], messages:[] }; await db.write(); }
init();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

function createToken(user){ return jwt.sign({ id:user.id, username:user.username, isAdmin:user.isAdmin||false }, JWT_SECRET, { expiresIn: '7d' }); }
async function auth(req,res,next){ const h = req.headers.authorization; if (!h) return res.status(401).json({error:'missing'}); const parts = h.split(' '); if (parts.length!==2) return res.status(401).json({error:'invalid'}); try{ req.user = jwt.verify(parts[1], JWT_SECRET); next(); }catch(e){ return res.status(401).json({error:'invalid token'}); } }

// SOCKET.IO
io.use((socket, next) => {
  // allow token in auth
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next();
  try { const data = jwt.verify(token, JWT_SECRET); socket.user = data; next(); } catch(e){ next(); }
});

io.on('connection', socket => {
  console.log('socket connected', socket.id, socket.user && socket.user.username);
  socket.on('private_message', async (data) => {
    await db.read();
    const msg = { id: nanoid(), from: data.from, to: data.to, message: data.message, ts: Date.now() };
    db.data.messages.push(msg); await db.write();
    // emit to all - in production target specific user sockets/rooms
    io.emit('private_message', msg);
  });
  socket.on('typing', (data)=>{ io.emit('typing', data); });
});

// AUTH routes
app.post('/api/signup', async (req,res)=>{
  await db.read();
  const { contact, name, username, password } = req.body;
  if (!username || !password) return res.status(400).json({error:'missing'});
  if (db.data.users.find(u=>u.username===username)) return res.status(409).json({error:'exists'});
  const hash = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), contact, name, username, password: hash, friends:[], bestFriend:null, streak:0, points:0, unlocked:false, nameEdits:0, verified:false, isAdmin:false };
  if ((contact||'').toLowerCase() === 'suporteenglishplay@gmail.com' && username === 'EnglishPlay Administrador'){ user.verified=true; user.isAdmin=true; }
  db.data.users.push(user); await db.write();
  const token = createToken(user);
  res.json({ user, token });
});

app.post('/api/login', async (req,res)=>{
  await db.read();
  const { id, password } = req.body;
  const user = db.data.users.find(u=> u.username===id || u.contact===id || u.email===id);
  if (!user) return res.status(401).json({error:'invalid'});
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({error:'invalid'});
  const token = createToken(user);
  res.json({ user, token });
});

app.get('/api/users/me', auth, async (req,res)=>{ await db.read(); const u = db.data.users.find(x=>x.id===req.user.id); res.json({ user: u }); });

app.post('/api/users/update', auth, async (req,res)=>{ await db.read(); const { id, ...rest } = req.body; if (req.user.id !== id && !req.user.isAdmin) return res.status(403).json({error:'forbidden'}); const idx = db.data.users.findIndex(u=>u.id===id); if (idx===-1) return res.status(404).json({error:'not found'}); db.data.users[idx] = {...db.data.users[idx], ...rest}; await db.write(); res.json({ user: db.data.users[idx] }); });

app.get('/api/admin/users', auth, async (req,res)=>{ await db.read(); if (!req.user.isAdmin) return res.status(403).json({error:'forbidden'}); res.json({ users: db.data.users }); });

// Payments: Stripe create-payment-intent scaffold
app.post('/api/payment/stripe-intent', auth, async (req,res)=>{
  if (!stripe) return res.status(500).json({error:'stripe not configured'});
  const { amount, currency='brl' } = req.body;
  try{
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency, payment_method_types: ['card'] });
    res.json({ clientSecret: paymentIntent.client_secret });
  }catch(e){ console.error(e); res.status(500).json({error:'stripe error'}); }
});

// MercadoPago Checkout (preference) scaffold
app.post('/api/payment/mercadopago', auth, async (req,res)=>{
  if (!mercadopago) return res.status(500).json({error:'mercadopago not configured'});
  const { title='Unlock lessons', price=2.00 } = req.body;
  try{
    const preference = { items: [{ title, unit_price: Number(price), quantity: 1 }], back_urls: { success: '/', failure: '/' } };
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point, preference_id: response.body.id });
  }catch(e){ console.error(e); res.status(500).json({error:'mp error'}); }
});

// Simulate PIX (client can still use QR generation)
app.post('/api/payment/simulate', auth, async (req,res)=>{ await db.read(); const { userId } = req.body; const u = db.data.users.find(x=>x.id===userId); if (u){ u.unlocked = true; await db.write(); res.json({ok:true}); } else res.status(404).json({error:'no user'}); });

// AI proxy placeholder
app.post('/api/ai/query', auth, async (req,res)=>{ if (!process.env.OPENAI_API_KEY) return res.json({answer:'OpenAI not configured on server'}); res.json({answer:'(AI proxy placeholder)'}); });

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'..','client','index.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log('Server listening on', PORT));
