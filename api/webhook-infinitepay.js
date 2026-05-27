const admin = require('firebase-admin');

// ── Firebase Admin (singleton) ────────────────────────────────
if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error('FIREBASE_SERVICE_ACCOUNT env var não definida');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(raw))
    });
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ── Mapeamento plan_id → tier ─────────────────────────────────
// Planos criados na InfinitePay (grupo_lotta)
const PLAN_MAP = {
  'aB2vLeYaNF': 'elite',    // Liga Interno Elite  — R$119/mês
  'vfGO2BUdWL': 'pro',      // Liga Interno Pro    — R$99/mês
  'DU64bZpy2w': 'starter'   // Liga Interno Starter — R$59/mês
};

// ── Helper: extrai campo de caminhos alternativos ─────────────
function extract(obj, ...paths) {
  for (const path of paths) {
    const val = path.split('.').reduce((o, k) => o?.[k], obj);
    if (val !== undefined && val !== null) return val;
  }
  return null;
}

// ── Handler principal ─────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  console.log('[webhook-infinitepay] payload:', JSON.stringify(body));

  // Retorna 200 imediatamente para não gerar retentativas
  res.status(200).json({ received: true });

  if (!db) {
    console.error('[webhook-infinitepay] Firebase não inicializado');
    return;
  }

  try {
    // ── Extrai dados do payload (InfinitePay pode variar o formato) ──
    const event   = extract(body, 'event_type', 'event', 'type');
    const email   = extract(body,
      'subscriber.email', 'customer.email',
      'data.subscriber.email', 'data.customer.email',
      'order.customer.email', 'data.order.customer.email'
    );
    const planId  = extract(body,
      'plan_id', 'data.plan_id',
      'subscription.plan_id', 'data.subscription.plan_id'
    );
    const status  = extract(body,
      'status', 'data.status',
      'subscription.status', 'order.status'
    );

    console.log(`[webhook-infinitepay] event=${event} email=${email} plan=${planId} status=${status}`);

    if (!email) {
      console.warn('[webhook-infinitepay] Email não encontrado no payload — ignorando');
      return;
    }

    // ── Busca cliente pelo email ──────────────────────────────
    const snap = await db.collection('clientes')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (snap.empty) {
      console.warn(`[webhook-infinitepay] Nenhum cliente com email ${email}`);
      return;
    }

    const clienteRef = snap.docs[0].ref;
    const update = {};

    // ── Define novo status baseado no evento / status ─────────
    const isAtivacao = ['subscription.activated', 'subscription.created',
      'subscription.renewed', 'checkout.order.paid',
      'payment.approved', 'payment.completed'].includes(event)
      || ['approved', 'active', 'paid'].includes(status);

    const isCancelamento = ['subscription.cancelled', 'subscription.expired',
      'subscription.ended'].includes(event)
      || ['cancelled', 'expired'].includes(status);

    const isFalha = ['subscription.payment_failed', 'payment.failed',
      'payment.rejected'].includes(event)
      || ['failed', 'rejected', 'refused'].includes(status);

    if (isAtivacao) {
      update.status           = 'ativo';
      update.assinaturaStatus = 'ativa';
      update.ultimoPagamento  = admin.firestore.FieldValue.serverTimestamp();
      if (planId && PLAN_MAP[planId]) update.tier = PLAN_MAP[planId];
    } else if (isCancelamento) {
      update.status           = 'inativo';
      update.assinaturaStatus = 'cancelada';
    } else if (isFalha) {
      update.status           = 'pendente';
      update.assinaturaStatus = 'pagamento_falhou';
    } else {
      console.log(`[webhook-infinitepay] Evento "${event}" não tratado — sem alteração`);
      return;
    }

    await clienteRef.update(update);
    console.log(`[webhook-infinitepay] Cliente ${snap.docs[0].id} atualizado:`, update);

  } catch (err) {
    console.error('[webhook-infinitepay] Erro:', err.message);
  }
};
