const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: 'TEST-9000482296310847-020319-2e1b8ad068c76ac2f091cab3da43ba1c-300627484'
});

app.post('/api/process-payment', async (req, res) => {
  try {
    const { token, amount, description } = req.body;
    
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      token,
      description,
      installments: 1,
      payment_method_id: 'visa', // Pode variar conforme o cartão
      payer: {
        email: 'comprador@teste.com' // Coletar do formulário
      }
    });

    res.json(payment.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});