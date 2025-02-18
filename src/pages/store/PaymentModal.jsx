import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './PaymentModal.module.css';

const PaymentModal = ({ open, onClose, total, user, userData, onSuccess, showToast }) => {
  const [mp, setMp] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open && !mp) {
      const initializeMP = async () => {
        try {
          const script = document.createElement('script');
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.onload = () => {
            setMp(new window.MercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY, {
              locale: 'pt-BR'
            }));
          };
          document.body.appendChild(script);
        } catch (error) {
          showToast('Erro ao carregar o sistema de pagamentos', 'error');
        }
      };
      initializeMP();
    }
  }, [open, mp, showToast]);

  const handlePayment = async (cardFormData) => {
    setProcessing(true);
    try {
      const { token, payer: { email } } = cardFormData;
      
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
          items: userData
        }),
      });

      if (!response.ok) throw new Error('Erro no processamento do pagamento');

      const data = await response.json();
      
      if (data.status === 'approved') {
        await onSuccess(data.transactionId, email);
      } else {
        throw new Error(data.message || 'Pagamento não aprovado');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      showToast(error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`${styles.paymentModal} ${open ? styles.open : ''}`}>
      <div className={styles.paymentContent}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Fechar modal de pagamento"
        >
          &times;
        </button>
        
        <h2>Pagamento Seguro</h2>
        
        <div className={styles.paymentInfo}>
          <div className={styles.paymentTotal}>
            Total: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(total)}
          </div>
          <div id="payment-form" className={styles.paymentForm} />
        </div>

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
  userData: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired
};

export default PaymentModal;