// app.js

const express = require('express');
const app = express();
require('dotenv').config();

const recipesRouter = require('./routes/recipes');

// Middleware para parsing de JSON
app.use(express.json());

// Rotas
app.use('/recipes', recipesRouter);

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Iniciando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
