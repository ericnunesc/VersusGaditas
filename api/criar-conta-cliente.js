const admin = require('firebase-admin');

// ── Firebase Admin (singleton) ─────────────────────────────────
function initFirebase() {
  if (admin.apps.length) return;
  try {
    // Tenta base64 primeiro (gerado pelo certutil do Windows)
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (b64) {
      const clean = b64.replace(/-----[^-]+-----/g, '').replace(/[\r\n\s]/g, '');
      const json  = Buffer.from(clean, 'base64').toString('utf8');
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
      return;
    }
    // Fallback: JSON direto
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  } catch(e) { console.error('[initFirebase]', e.message); }
}
initFirebase();
const db        = admin.apps.length ? admin.firestore() : null;
const authAdmin = admin.apps.length ? admin.auth()      : null;

// ── Firebase Web API Key (para envio automático de e-mail) ─────
// Valor: mesma chave `apiKey` do arquivo js/firebase.js
// Pode ser sobrescrita pela env var FIREBASE_API_KEY
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyA0HOHKPd9gCpJx0pnFWaKdLU-1WJks-gA';

const PORTAL_URL = 'https://competicaobjj.vercel.app/login-cliente.html';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!db) return res.status(500).json({ error: 'Firebase não inicializado' });

  const { clienteId } = req.body || {};
  if (!clienteId) return res.status(400).json({ error: 'clienteId obrigatório' });

  try {
    // ── Busca dados do cliente ───────────────────────────────
    const clienteDoc = await db.collection('clientes').doc(clienteId).get();
    if (!clienteDoc.exists) return res.status(404).json({ error: 'Cliente não encontrado' });

    const cliente = clienteDoc.data();
    if (!cliente.email) return res.status(400).json({ error: 'Cliente sem email cadastrado. Adicione o email primeiro.' });

    const email = cliente.email.toLowerCase().trim();

    // ── Cria ou recupera usuário Firebase Auth ───────────────
    let uid;
    let isNew = false;
    try {
      const existing = await authAdmin.getUserByEmail(email);
      uid = existing.uid;
      console.log('[criar-conta] Usuário já existe:', uid);
    } catch {
      const newUser = await authAdmin.createUser({
        email,
        displayName:   cliente.nome,
        emailVerified: false
      });
      uid = newUser.uid;
      isNew = true;
      console.log('[criar-conta] Novo usuário criado:', uid);
    }

    // ── Salva UID no Firestore ───────────────────────────────
    await db.collection('clientes').doc(clienteId).update({ uid });

    // ── Gera link de definição de senha ─────────────────────
    const resetLink = await authAdmin.generatePasswordResetLink(email, {
      url: PORTAL_URL
    });

    // ── Envia e-mail automaticamente via Firebase Auth ───────
    let emailEnviado = false;
    try {
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email,
            continueUrl: PORTAL_URL
          })
        }
      );
      const data = await resp.json();
      if (data.email) {
        emailEnviado = true;
        console.log('[criar-conta] E-mail de redefinição enviado para:', email);
      } else {
        console.warn('[criar-conta] Resposta inesperada ao enviar e-mail:', JSON.stringify(data));
      }
    } catch (emailErr) {
      console.warn('[criar-conta] Falha ao enviar e-mail automático:', emailErr.message);
    }

    return res.status(200).json({
      success:      true,
      uid,
      email,
      resetLink,
      emailEnviado,
      isNew
    });

  } catch (err) {
    console.error('[criar-conta-cliente]', err);
    return res.status(500).json({ error: err.message });
  }
};
