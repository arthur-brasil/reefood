require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alimentosRoutes = require('./routes/alimentos');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'ReFood API' });
});

app.use('/alimentos', alimentosRoutes);
app.use('/usuarios', usuariosRoutes);

app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 ReFood API rodando na porta ${PORT}`);
});