const admin = require('firebase-admin');

let inicializado = false;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    inicializado = true;
    console.log('🔐 Firebase Admin inicializado');
  } else {
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_JSON não definido — autenticação desabilitada (dev)');
  }
} catch (e) {
  console.error('❌ Erro ao inicializar Firebase Admin:', e.message);
}

async function autenticar(req, res, next) {
  // Sem credenciais configuradas: modo dev — passa usuário fictício
  if (!inicializado) {
    req.usuario = { uid: req.headers['x-usuario-id'] || 'dev-user' };
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(header.split(' ')[1]);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
