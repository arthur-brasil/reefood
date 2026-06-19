const UsuarioModel = require('../models/Usuario');
const AlimentoModel = require('../models/Alimento');

// Envia push via Expo Push API (sem credenciais extras necessárias)
async function enviarPush(tokens, title, body) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { tela: 'Alertas' },
  }));

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const json = await res.json();
    if (json.errors) console.error('Expo Push erros:', json.errors);
  } catch (err) {
    console.error('Erro ao enviar push:', err.message);
  }
}

// Chamado pelo cron — verifica alimentos próximos ao vencimento e notifica
async function dispararAlertas() {
  console.log('🔔 Verificando alertas de vencimento...');
  const usuarios = await UsuarioModel.listarComNotificacao();

  for (const usuario of usuarios) {
    const alimentos = await AlimentoModel.proximosVencimento(usuario.id, usuario.dias_antecedencia || 3);
    if (alimentos.length === 0) continue;

    const nomes = alimentos.map((a) => a.nome).join(', ');
    const titulo = alimentos.length === 1
      ? `⚠️ ${alimentos[0].nome} vence em breve!`
      : `⚠️ ${alimentos.length} alimentos próximos ao vencimento`;
    const mensagem = alimentos.length === 1
      ? `Faltam ${calcDias(alimentos[0].data_validade)} dia(s) para vencer.`
      : `Confira: ${nomes}`;

    await enviarPush([usuario.expo_push_token], titulo, mensagem);
  }

  console.log(`✅ Alertas enviados para ${usuarios.length} usuário(s)`);
}

function calcDias(dataValidade) {
  const diff = new Date(dataValidade) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

module.exports = { dispararAlertas };
