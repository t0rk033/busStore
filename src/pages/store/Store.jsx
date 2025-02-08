import React, { useState, useEffect } from 'react';
import styles from './store.module.css';
import { useCart } from 'react-use-cart';
import ProductModal from './ProductModal';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

function Store() {
  const { addItem, items, removeItem, updateItemQuantity, cartTotal, emptyCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), variations: doc.data().variations || [] }));
      setProducts(productsData);
    }
    fetchProducts();
  }, []);

  const PaymentModal = ({ open, onClose, total }) => {
    const [mp, setMp] = useState(null);
    const [formInitialized, setFormInitialized] = useState(false);

    useEffect(() => {
      if (open && !mp) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => setMp(new window.MercadoPago('TEST-d4b57614-bf60-4dac-b391-944a48b68160', { locale: 'pt-BR' }));
        document.body.appendChild(script);

        return () => document.body.removeChild(script);
      }
    }, [open, mp]);

    useEffect(() => {
      if (mp && open && !formInitialized) {
        mp.bricks().create('cardPayment', 'payment-form', {
          initialization: {
            amount: total,
            payer: {
              email: "", // Configuração para o Mercado Pago coletar o email
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Brick está pronto');
            },
            onError: (error) => {
              console.error('Erro no brick:', error);
              alert('Erro ao inicializar o formulário de pagamento. Tente novamente.');
            },
            onSubmit: async (cardFormData) => {
              try {
                const { token, payer: { email } } = cardFormData;

                // Envie os dados para o seu backend
                const response = await fetch('http://localhost:3000/api/process-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token,
                    amount: total,
                    email,
                  }),
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(errorText || 'Erro no processamento do pagamento');
                }

                const data = await response.json();

                if (data.status === 'approved') {
                  // Atualizar o estoque no Firestore para cada item do carrinho
                  const updateStockPromises = items.map(async (item) => {
                    const productRef = doc(db, "products", item.id);
                    const productDoc = await getDoc(productRef);

                    if (productDoc.exists()) {
                      const currentStock = productDoc.data().variations[0].stock; // Assumindo que há apenas uma variação
                      const newStock = currentStock - item.quantity;

                      if (newStock >= 0) {
                        await updateDoc(productRef, {
                          variations: [{ ...productDoc.data().variations[0], stock: newStock }]
                        });
                        console.log(`Estoque atualizado para o produto ${item.id}. Novo estoque: ${newStock}`);
                      } else {
                        console.error(`Estoque insuficiente para o produto ${item.id}.`);
                        throw new Error(`Estoque insuficiente para o produto ${item.id}.`);
                      }
                    } else {
                      console.error(`Produto ${item.id} não encontrado no Firestore.`);
                      throw new Error(`Produto ${item.id} não encontrado no Firestore.`);
                    }
                  });

                  await Promise.all(updateStockPromises);

                  // Salvar os dados da venda na coleção "sales"
                  const saleData = {
                    total: cartTotal, // Valor total da compra
                    items: items.map(item => ({
                      id: item.id,
                      name: item.name,
                      quantity: item.quantity,
                      price: item.price,
                    })),
                    date: serverTimestamp(), // Data e hora da compra
                    email: email, // Email do cliente
                  };

                  await addDoc(collection(db, "sales"), saleData);

                  alert('Pagamento aprovado e estoque atualizado com sucesso!');
                  emptyCart();
                  onClose();
                } else {
                  alert('Pagamento não aprovado.');
                }
              } catch (error) {
                console.error('Erro no pagamento ou atualização do estoque:', error);
                alert(error.message || 'Erro ao processar pagamento ou atualizar estoque.');
              }
            },
          },
        });
        setFormInitialized(true);
      }
    }, [mp, open, total, formInitialized, items]);

    return (
      <div className={`${styles.paymentModal} ${open ? styles.open : ''}`}>
        <div className={styles.paymentContent}>
          <h2>Finalizar Pagamento</h2>
          <div id="payment-form" />
        </div>
      </div>
    );
  };

  return (
    <div>
      <NavBar />
      <div className={styles.storeContainer}>
        <div className={styles.productGrid}>
          {products.length === 0 ? <p>Carregando produtos...</p> : products.map(product => (
            <div key={product.id} className={styles.productCard}>
              <img
                src={product.imageUrl}
                alt={product.name}
                className={styles.productImage}
                onClick={() => { setSelectedProduct(product); setOpenProductModal(true); }}
              />
              <div className={styles.productName}>{product.name}</div>
              <div className={styles.productPrice}>R$ {product.salePrice.toFixed(2)}</div>
              <button
                className={styles.addToCartButton}
                onClick={() => addItem({ ...product, id: product.id, price: product.salePrice })}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartIcon} onClick={() => setOpenCartModal(true)}>
          <span className={styles.cartBadge}>{items.length}</span> 🛒
        </div>

        <div className={`${styles.cartModal} ${openCartModal ? styles.open : ''}`}>
          <div className={styles.cartContent}>
            <h2 className={styles.cartTitle}>Carrinho de Compras</h2>
            {items.length === 0 ? <div className={styles.cartEmpty}>Seu carrinho está vazio.</div> : (
              items.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemName}>{item.name} - R$ {item.price.toFixed(2)}</div>
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
              ))
            )}
            <div className={styles.cartFooter}>
              <div className={styles.totalContainer}>
                <span>Total:</span>
                <span className={styles.totalPrice}>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button
                className={styles.checkoutButton}
                onClick={() => { setOpenCartModal(false); setOpenPaymentModal(true); }}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.overlay} ${openCartModal ? styles.open : ''}`} onClick={() => setOpenCartModal(false)} />

        <PaymentModal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} total={cartTotal} />
        <ProductModal open={openProductModal} onClose={() => setOpenProductModal(false)} product={selectedProduct} addToCart={addItem} />
      </div>
      <Footer />
    </div>
  );
}

export default Store;