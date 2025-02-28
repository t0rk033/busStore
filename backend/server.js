const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

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

// Endpoint para calcular frete com Melhor Envio
app.post('/api/shipping-quote', async (req, res) => {
  const { cepDestino, produtos } = req.body;

  // Validação básica
  if (!cepDestino || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ message: 'Dados de frete incompletos' });
  }

  try {
    // Mapear os produtos para o formato exigido pela API da Melhor Envio
    const items = produtos.map(produto => ({
      width: produto.largura,
      height: produto.altura,
      length: produto.comprimento,
      weight: produto.peso,
      insurance_value: produto.valor || 0, // Valor do seguro (opcional)
      quantity: produto.quantidade
    }));

    const response = await axios.post(
      'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
      {
        from: { postal_code: '36047040' }, // CEP da loja de origem
        to: { postal_code: cepDestino }, // CEP do cliente
        products: items
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}` // Use variáveis de ambiente
        }
      }
    );

    // Retornar as opções de frete
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao consultar frete:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Erro ao calcular frete',
      details: error.response?.data || error.message
    });
  }
});

// Inicie o servidor
app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});