const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: 'TEST-2424042295647561-020514-9b1628e7f33b6ff8f121ea721bc3ffd7-1804058981',
});

// Endpoint para processar pagamentos
app.post('/api/process-payment', async (req, res) => {
  const { token, amount, email } = req.body;

  console.log('Dados recebidos no backend:', { token, amount, email });

  try {
    // Validação básica dos dados
    if (!token || !amount || !email) {
      return res.status(400).json({ message: 'Dados de pagamento incompletos' });
    }

    const paymentData = {
      transaction_amount: Number(amount),
      token,
      description: 'Compra na loja',
      installments: 1,
      payment_method_id: 'visa',
      payer: { email },
    };

    const payment = new Payment(client);
    const response = await payment.create({ body: paymentData });

    // Verifica a resposta do Mercado Pago
    if (!response || !response.id) {
      throw new Error('Resposta inválida do gateway de pagamento');
    }

    // Resposta completa com dados da transação
    res.status(200).json({
      status: response.status,
      transactionId: response.id,
      paymentDetails: {
        installments: response.installments,
        payment_method: response.payment_method_id,
        authorization_code: response.authorization_code
      }
    });

  } catch (error) {
    console.error('Erro no processamento do pagamento:', error);
    res.status(500).json({ 
      message: error.message || 'Erro interno no servidor',
      errorCode: error.code || 'unknown_error'
    });
  }
});

// Inicie o servidor
app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});