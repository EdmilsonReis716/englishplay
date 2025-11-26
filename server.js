
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req,res)=> res.json({ ok:true, msg:"Backend EnglishPlay funcionando" }));

module.exports = app;
