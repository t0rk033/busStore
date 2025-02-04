import React, { useState, useEffect } from 'react';
import styles from './store.module.css';
import { useCart } from 'react-use-cart';
import ProductModal from './ProductModal';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Store() {
  const { addItem, items, removeItem, updateItemQuantity, cartTotal, emptyCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Buscar produtos do Firestore
  useEffect(() => {
    async function fetchProducts() {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        variations: doc.data().variations || [],
      }));
      setProducts(productsData);
    }
    fetchProducts();
  }, []);

  // Componente de Modal de Pagamento
  const PaymentModal = ({ open, onClose, total }) => {
    const [mp, setMp] = useState(null);

    useEffect(() => {
      if (open && !mp) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
          setMp(new window.MercadoPago('TEST-c1964422-1614-406f-aea2-a176910dc941', {
            locale: 'pt-BR'
          }));
        };
        document.body.appendChild(script);
      }
    }, [open, mp]);

    const handlePayment = async () => {
      if (!mp) return;

      const cardForm = mp.cardForm({
        amount: total.toString(),
        autoMount: true,
        form: {
          id: 'form-checkout',
          cardholderName: {
            id: 'form-checkout__cardholderName',
            placeholder: 'Titular do cartão',
          },
          cardNumber: {
            id: 'form-checkout__cardNumber',
            placeholder: 'Número do cartão',
          },
          expirationDate: {
            id: 'form-checkout__expirationDate',
            placeholder: 'MM/AA',
          },
          securityCode: {
            id: 'form-checkout__securityCode',
            placeholder: 'Código de segurança',
          },
          installments: {
            id: 'form-checkout__installments',
            placeholder: 'Parcelas',
          },
          identificationType: {
            id: 'form-checkout__identificationType',
            placeholder: 'Tipo de documento',
          },
          identificationNumber: {
            id: 'form-checkout__identificationNumber',
            placeholder: 'Número do documento',
          },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) console.error('Erro ao carregar formulário:', error);
          },
          onSubmit: async event => {
            event.preventDefault();
            
            const formData = cardForm.getCardFormData();
            
            try {
              const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: formData.token,
                  amount: total,
                  description: `Compra de ${items.length} itens`,
                }),
              });

              const data = await response.json();

              if (response.ok) {
                alert('Pagamento realizado com sucesso!');
                emptyCart();
                onClose();
              } else {
                alert(`Erro no pagamento: ${data.message}`);
              }
            } catch (error) {
              console.error('Erro no processamento:', error);
              alert('Erro ao processar pagamento');
            }
          },
        },
      });
    };

    return (
      <div className={`${styles.paymentModal} ${open ? styles.open : ''}`}>
        <div className={styles.paymentContent}>
          <h2>Finalizar Pagamento</h2>
          <div id="form-checkout" />
          <button 
            className={styles.checkoutButton}
            onClick={handlePayment}
          >
            Pagar R$ {total.toFixed(2)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <NavBar />
      <div className={styles.storeContainer}>
        {/* Listagem de Produtos */}
        <div className={styles.productGrid}>
          {products.length === 0 ? (
            <p>Carregando produtos...</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={styles.productImage}
                  onClick={() => {
                    setSelectedProduct(product);
                    setOpenProductModal(true);
                  }}
                />
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productPrice}>R$ {product.salePrice.toFixed(2)}</div>
                <button
                  className={styles.addToCartButton}
                  onClick={() => addItem({
                    ...product,
                    id: product.id,
                    price: product.salePrice
                  })}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            ))
          )}
        </div>

        {/* Ícone do Carrinho Flutuante */}
        <div className={styles.cartIcon} onClick={() => setOpenCartModal(true)}>
          <span className={styles.cartBadge}>{items.length}</span>
          🛒
        </div>

        {/* Modal do Carrinho */}
        <div className={`${styles.cartModal} ${openCartModal ? styles.open : ''}`}>
          <div className={styles.cartContent}>
            <h2 className={styles.cartTitle}>Carrinho de Compras</h2>
            {items.length === 0 ? (
              <div className={styles.cartEmpty}>Seu carrinho está vazio.</div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.cartItemName}>
                      {item.name} - R$ {item.price.toFixed(2)}
                    </div>
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <div className={styles.cartItemQuantity}>{item.quantity}</div>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <div className={styles.cartFooter}>
                  <div className={styles.totalContainer}>
                    <span>Total:</span>
                    <span className={styles.totalPrice}>
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    className={styles.checkoutButton}
                    onClick={() => {
                      setOpenCartModal(false);
                      setOpenPaymentModal(true);
                    }}
                  >
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Overlay do modal */}
        <div 
          className={`${styles.overlay} ${openCartModal ? styles.open : ''}`} 
          onClick={() => setOpenCartModal(false)}
        />

        {/* Modal de Pagamento */}
        <PaymentModal
          open={openPaymentModal}
          onClose={() => setOpenPaymentModal(false)}
          total={cartTotal}
        />

        {/* Modal de Prévia do Produto */}
        <ProductModal
          open={openProductModal}
          onClose={() => setOpenProductModal(false)}
          product={selectedProduct}
          addToCart={addItem}
        />
      </div>
      <Footer />
    </div>
  );
}

export default Store;