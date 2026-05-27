const fs = require('fs');
const b64 = fs.readFileSync('firebase-service-account.json').toString('base64');
fs.writeFileSync('chave-vercel.txt', b64);
console.log('Pronto! Arquivo chave-vercel.txt criado.');
