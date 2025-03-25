import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './PaymentModal.module.css';

const PaymentModal = ({ open, onClose, total, user, userData, onSuccess, showToast }) => {
  const [mp, setMp] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Mapeamento completo de mensagens
  const statusDetailMessages = {
    // Erros de cartão
    'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão. Tente outro método de pagamento.',
    'cc_rejected_bad_filled_card_number': 'Número do cartão inválido. Verifique os dados.',
    'cc_rejected_bad_filled_date': 'Data de validade incorreta. Verifique os dados.',
    'cc_rejected_bad_filled_security_code': 'Código de segurança (CVV) inválido.',
    'cc_rejected_blacklist': 'Cartão não autorizado. Contate seu banco.',
    'cc_rejected_call_for_authorize': 'Pagamento não autorizado. Contate seu banco.',
    'cc_rejected_card_disabled': 'Cartão desabilitado. Contate seu banco.',
    'cc_rejected_card_error': 'Erro no cartão. Tente novamente.',
    'cc_rejected_duplicated_payment': 'Pagamento duplicado. Verifique suas transações.',
    'cc_rejected_high_risk': 'Pagamento recusado por segurança. Tente outro método.',
    'cc_rejected_other_reason': 'Pagamento não aprovado. Tente novamente.',
    
    // Status pendentes
    'pending_contingency': 'Pagamento em análise. Aguarde confirmação.',
    'pending_review_manual': 'Pagamento em revisão manual. Aguarde.',
    'pending_waiting_payment': 'Aguardando confirmação de pagamento.',
    
    // Erros de processamento
    'missing_required_fields': 'Dados incompletos. Preencha todas as informações.',
    'invalid_items': 'Itens do carrinho inválidos. Recarregue a página.',
    'processing_error': 'Erro ao processar pagamento. Tente novamente.',
    'invalid_request': 'Requisição inválida. Verifique os dados.',
    'server_error': 'Erro no servidor. Tente mais tarde.',
    
    // Mensagem padrão
    'default': 'Pagamento não aprovado. Tente novamente ou use outro método.'

useEffect(() => {
  if (paymentStatus === 'rejected' && !processing) {
    showToast("Pagamento não aprovado. Tente outro método.", 'error');
  }
}, [paymentStatus, processing]);
  // Inicializa o Mercado Pago
  useEffect(() => {
    if (open && !mp) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      
      script.onload = () => {
        const mpInstance = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
          locale: 'pt-BR'
        });
        setMp(mpInstance);
      };
      
      script.onerror = () => {
        showToast('Erro ao carregar o sistema de pagamentos', 'error');
      };
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [open, mp, showToast]);

  // Configura o formulário de pagamento
  useEffect(() => {
    if (mp && open) {
      const bricksBuilder = mp.bricks();
      
      bricksBuilder.create('cardPayment', 'payment-form-container', {
        initialization: {
          amount: total,
          payer: {
            email: user?.email || '',
            identification: {
              type: 'CPF',
              number: userData?.cpf || ''
            }
          },
        },
        callbacks: {
          onReady: () => console.log('Formulário de pagamento pronto'),
          onSubmit: async (cardFormData) => {
            try {
              await handlePayment(cardFormData);
            } catch (error) {
              console.error('Erro no pagamento:', error);
            }
          },
          onError: (error) => {
            console.error('Erro no formulário:', error);
            showToast('Erro no formulário de pagamento', 'error');
          }
        }
      });
    }
  }, [mp, open, total, user, userData]);

  // Processa o pagamento
  const handlePayment = async (cardFormData) => {
    setProcessing(true);
    try {
      const { token, payer: { email } } = cardFormData;
  
      // Debug: verifique os dados antes de enviar
      console.log("Dados sendo enviados:", {
        token: token.substring(0, 5) + "...", // Mostra apenas parte do token por segurança
        amount: total,
        email,
        items: userData.items
      });
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/process-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          token,
          amount: total,
          email,
          items: userData.items
        }),
      });
  
      const data = await response.json();
      console.log("Resposta do backend:", data); // Debug crucial
  // Dentro da sua função handlePayment, depois de receber a resposta do backend:
const data = await response.json();

// Fallback 1 - Garante mensagem mesmo se o backend não retornar statusDetail
if (!response.ok || data.status === 'rejected') {
  const errorMessage = 
    data.statusDetail && statusDetailMessages[data.statusDetail]
      ? statusDetailMessages[data.statusDetail]
      : data.message || "Seu pagamento foi recusado pelo emissor do cartão";
  
  showToast(errorMessage, 'error', { duration: 8000 });
  setPaymentStatus('rejected');
  return; // Interrompe o fluxo se foi recusado
}
      if (!response.ok) {
        // FORÇA a exibição do toast mesmo se o backend não retornar statusDetail
        const errorMessage = data.statusDetail 
          ? statusDetailMessages[data.statusDetail] 
          : data.message || "Pagamento recusado (motivo desconhecido)";
        
        showToast(errorMessage, 'error', { duration: 10000 }); // Toast mais longo
        return;
      }
  
      if (data.status === 'approved') {
        await onSuccess(data.transactionId, email);
      } else {
        showToast(
          statusDetailMessages[data.statusDetail] || "Pagamento não aprovado", 
          'error', 
          { duration: 10000 }
        );
      }
  
    } catch (error) {
      console.error("Erro completo:", error); // Debug detalhado
      showToast(
        error.message || "Falha ao processar pagamento", 
        'error', 
        { duration: 10000 }
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`${styles.modalOverlay} ${open ? styles.open : ''}`}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          disabled={processing}
          aria-label="Fechar modal de pagamento"
        >
          &times;
        </button>

        <h2 className={styles.modalTitle}>Finalizar Pagamento</h2>
        
        {/* Status do pagamento */}
        {paymentStatus === 'approved' && (
          <div className={styles.successMessage}>
            <h3>✅ Pagamento Aprovado!</h3>
            <p>Sua compra foi processada com sucesso.</p>
          </div>
        )}

        {paymentStatus === 'rejected' && (
          <div className={styles.errorMessage}>
            <h3>❌ Pagamento Não Aprovado</h3>
            <p>Tente novamente ou utilize outro método de pagamento.</p>
          </div>
        )}

        {/* Resumo do pedido */}
        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Itens:</span>
            <span>{userData?.items?.length || 0}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>

        {/* Formulário de pagamento */}
        <div id="payment-form-container" className={styles.paymentForm} />

        {/* Overlay de processamento */}
        {processing && (
          <div className={styles.processingOverlay}>
            <div className={styles.spinner} />
            <p>Processando seu pagamento...</p>
          </div>
        )}
      </div>
    </div>
  );
};

PaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  user: PropTypes.object,
  userData: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired
      })
    ).isRequired,
    cpf: PropTypes.string
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired
};

export default PaymentModal;