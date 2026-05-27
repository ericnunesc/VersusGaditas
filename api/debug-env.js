module.exports = function handler(req, res) {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  res.status(200).json({
    b64_existe:    !!b64,
    b64_tamanho:   b64 ? b64.length : 0,
    raw_existe:    !!raw,
    raw_tamanho:   raw ? raw.length : 0,
    node_env:      process.env.NODE_ENV || 'não definido'
  });
};
