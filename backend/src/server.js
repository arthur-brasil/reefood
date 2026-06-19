require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const cron    = require('node-cron');

const alimentosRoutes    = require('./routes/alimentos');
const usuariosRoutes     = require('./routes/usuarios');
const registrosRoutes    = require('./routes/registros');
const listaComprasRoutes = require('./routes/listaCompras');
const { dispararAlertas } = require('./services/notificacoes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'ReFood API' }));

app.use('/alimentos',    alimentosRoutes);
app.use('/usuarios',     usuariosRoutes);
app.use('/registros',    registrosRoutes);
app.use('/lista-compras', listaComprasRoutes);

app.use((req, res) => res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' }));

// Cron: verifica vencimentos diariamente às 8h
cron.schedule('0 8 * * *', () => {
  dispararAlertas().catch(console.error);
}, { timezone: 'America/Sao_Paulo' });

app.listen(PORT, () => console.log(`🚀 ReFood API rodando na porta ${PORT}`));
