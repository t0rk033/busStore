const mercadopago = require('mercadopago');

// Configura a SDK com as credenciais
mercadopago.configure({
  access_token: 'TEST-9000482296310847-020319-2e1b8ad068c76ac2f091cab3da43ba1c-300627484', 
});

module.exports = mercadopago;