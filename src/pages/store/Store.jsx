import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './store.module.css';
import { useCart } from 'react-use-cart';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavBar from "../../components/NavBar";
import Footer from '../../components/Footer';
import ProductModal from './ProductModal';

function Store() {
  const { addItem, items, removeItem, updateItemQuantity, cartTotal, emptyCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openCartModal, setOpenCartModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);

  const navigate = useNavigate();

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  // Monitora estado de autenticação e carrega dados do usuário
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Carrega produtos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          variations: doc.data().variations || []
        }));
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Extrai categorias únicas dos produtos
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        showToast('Erro ao carregar produtos', 'error');
      }
    }
    fetchProducts();
  }, [showToast]);

  // Filtra produtos com base nos critérios
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesPrice = (minPrice ? product.salePrice >= parseFloat(minPrice) : true) &&
                          (maxPrice ? product.salePrice <= parseFloat(maxPrice) : true);

      return matchesSearch && matchesCategory && matchesPrice;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, products]);

  // Limpa filtros
  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('');
  };

  // Verifica estoque antes de permitir o pagamento
  const checkStock = useCallback(async () => {
    try {
      await Promise.all(items.map(async (item) => {
        const productRef = doc(db, "products", item.id.split('-')[0]);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`Produto ${item.name} não encontrado`);
        }
        
        const productData = productDoc.data();
        const selectedVariation = productData.variations.find(
          (v) => v.color === item.variation.color && v.size === item.variation.size
        );
        
        if (!selectedVariation || selectedVariation.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${item.name} (${item.variation.color}, ${item.variation.size})`);
        }
      }));
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  }, [items, showToast]);

  // Processamento completo da compra
  const handleSuccessfulPayment = useCallback(async (transactionId, email) => {
    setLoading(true);
    try {
      // Atualização transacional do estoque
      await Promise.all(items.map(async (item) => {
        const productRef = doc(db, "products", item.id.split('-')[0]);
        
        await runTransaction(db, async (transaction) => {
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) throw new Error('Produto não encontrado');

          const selectedVariation = productDoc.data().variations.find(
            (v) => v.color === item.variation.color && v.size === item.variation.size
          );

          if (!selectedVariation || selectedVariation.stock < item.quantity) {
            throw new Error('Estoque insuficiente');
          }

          const newStock = selectedVariation.stock - item.quantity;
          transaction.update(productRef, {
            variations: productDoc.data().variations.map((v) =>
              v.color === item.variation.color && v.size === item.variation.size
                ? { ...v, stock: newStock }
                : v
            ),
          });
        });
      }));

      // Registro da venda
      const saleData = {
        total: cartTotal + shippingCost,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variation: item.variation,
        })),
        date: serverTimestamp(),
        payment: {
          method: 'Mercado Pago',
          status: 'approved',
          transactionId,
          email
        },
        user: user?.uid ? {
          uid: user.uid,
          email: user.email,
          ...(userData && { details: userData })
        } : null
      };

      const saleRef = await addDoc(collection(db, "sales"), saleData);
      await addDoc(collection(db, "users", user.uid, "orders"), {
        saleId: saleRef.id,
        date: serverTimestamp(),
        total: cartTotal + shippingCost
      });

      showToast('Compra realizada com sucesso!', 'success');
      emptyCart();
      setOpenPaymentModal(false);
    } catch (error) {
      console.error('Erro no processamento:', error);
      showToast(error.message || 'Erro ao finalizar compra', 'error');
    } finally {
      setLoading(false);
    }
  }, [cartTotal, items, user, userData, emptyCart, showToast, shippingCost]);

  // Função para calcular o frete 
  const handleCalculateShipping = async () => {
    if (cep.length !== 8) {
      showToast('CEP inválido. Deve ter 8 dígitos.', 'error');
      return;
    }
  
    try {
      const produtos = items.map(item => ({
        width: item.dimensions?.width || 10,
        height: item.dimensions?.height || 10,
        length: item.dimensions?.length || 10,
        weight: item.weight || 0.5,
        insurance_value: item.price * item.quantity,
        quantity: item.quantity
      }));
  
      const response = await fetch('http://localhost:3000/api/shipping-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cepDestino: cep,
          produtos
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao calcular frete');
      }
  
      const shippingData = await response.json();
      console.log('Resposta da API de frete:', shippingData); // Inspecione a resposta
  
      // Filtra apenas as opções de frete válidas (sem erro) e que correspondem ao SEDEX
      const validShippingOptions = shippingData.filter(option => !option.error && option.name.includes('SEDEX'));
  
      if (validShippingOptions.length === 0) {
        showToast('Nenhuma opção de frete SEDEX disponível para o CEP informado.', 'error');
        return;
      }
  
      // Define as opções de frete e o custo do frete selecionado
      setShippingOptions(validShippingOptions);
      setShippingCost(parseFloat(validShippingOptions[0].price)); // Usa o preço da primeira opção válida
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      showToast(error.message || 'Erro ao calcular frete. Tente novamente.', 'error');
    }
  };
  // Componente de Pagamento
  const PaymentModal = ({ open, onClose, total }) => {
    const [mp, setMp] = useState(null);
    const [formInitialized, setFormInitialized] = useState(false);

    // Configura Mercado Pago
    useEffect(() => {
      if (open && !mp) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
          const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
          setMp(new window.MercadoPago(publicKey, { locale: 'pt-BR' }));
        };
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
      }
    }, [open, mp]);
    

    // Processamento do pagamento
    useEffect(() => {
      if (mp && open && !formInitialized) {
        mp.bricks().create('cardPayment', 'payment-form', {
          initialization: {
            amount: total,
            payer: { email: user?.email || "" },
          },
          callbacks: {
            onReady: () => console.log('Brick está pronto'),
            onError: (error) => {
              console.error('Erro no brick:', error);
              alert('Erro ao inicializar o formulário de pagamento. Tente novamente.');
            },
            onSubmit: async (cardFormData) => {
              try {
                const { token, payer: { email } } = cardFormData;

                // Envia para backend
                const response = await fetch('http://localhost:3000/api/process-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token, amount: total, email }),
                });

                const data = await response.json();

                if (data.status === 'approved') {
                  await handleSuccessfulPayment(data.transactionId, email);
                }
              } catch (error) {
                console.error('Erro no processo:', error);
                alert(error.message || 'Erro ao processar pagamento');
              }
            },
          },
        });
        setFormInitialized(true);
      }
    }, [mp, open, total, formInitialized, user, handleSuccessfulPayment]);

    return (
      <div className={`${styles.paymentModal} ${open ? styles.open : ''}`}>
        <div className={styles.paymentContent}>
          <h2>Finalizar Pagamento</h2>
          <div id="payment-form" />
        </div>
      </div>
    );
  };

  const handleAddToCart = (productWithDetails) => {
    addItem({
      ...productWithDetails,
      id: `${productWithDetails.id}-${productWithDetails.variation.color}-${productWithDetails.variation.size}`,
    });
    showToast('Produto adicionado ao carrinho!', 'success');
  };

  // Função para verificar se o usuário está logado antes de finalizar a compra
  const handleCheckout = async () => {
    if (!user) {
      showToast('Você precisa estar logado para finalizar a compra.', 'error');
      navigate('/login');
      return;
    }

    if (await checkStock()) {
      setOpenCartModal(false);
      setOpenPaymentModal(true);
    }
  };

  return (
    <div>
      <NavBar />
      <div className={styles.storeContainer}>
        {/* Toast */}
        {toast.show && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.message}
          </div>
        )}

        {/* Barra de Pesquisa e Filtros */}
        <div className={styles.filterContainer}>
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categoryFilter}
          >
            <option value="">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Preço Mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceFilter}
          />

          <input
            type="number"
            placeholder="Preço Máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceFilter}
          />

          <button onClick={clearFilters} className={styles.clearFiltersButton}>
            Limpar Filtros
          </button>
        </div>

        {/* Lista de Produtos Filtrados */}
        <div className={styles.productGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className={styles.productImage}
                onClick={() => { setSelectedProduct(product); setOpenProductModal(true); }}
              />
              <div className={styles.productName}>{product.name}</div>
              <div className={styles.productCategory}>{product.category}</div>
              <div className={styles.productPrice}>R$ {product.salePrice.toFixed(2)}</div>
              <button
                className={styles.addToCartButton}
                onClick={() => {
                  setSelectedProduct(product);
                  setOpenProductModal(true);
                }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          ))}
        </div>

        {/* Carrinho */}
        <div className={styles.cartIcon} onClick={() => setOpenCartModal(true)}>
          <span className={styles.cartBadge}>{items.length}</span> 🛒
        </div>

        {/* Modal do Carrinho */}
        <div className={`${styles.cartModal} ${openCartModal ? styles.open : ''}`}>
          <div className={styles.cartContent}>
            <h2 className={styles.cartTitle}>Carrinho de Compras</h2>
            {items.length === 0 ? (
              <div className={styles.cartEmpty}>Seu carrinho está vazio.</div>
            ) : (
              items.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemDetails}>
                    <div className={styles.cartItemName}>
                      {item.name} - R$ {item.price.toFixed(2)}
                    </div>
                    <div className={styles.cartItemVariation}>
                      <span>Cor: {item.variation.color}</span>
                      <span>Tamanho: {item.variation.size}</span>
                    </div>
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
              ))
            )}
    <div className={styles.cartFooter}>
  <div className={styles.shippingContainer}>
    <input
      type="text"
      placeholder="Digite seu CEP"
      value={cep}
      onChange={(e) => setCep(e.target.value)}
      className={styles.cepInput}
      maxLength={8} // Limita o CEP a 8 dígitos
    />
    <button
      className={styles.calculateShippingButton}
      onClick={handleCalculateShipping}
      disabled={cep.length !== 8} // Desabilita o botão se o CEP não tiver 8 dígitos
    >
      Calcular Frete
    </button>
  </div>

  {shippingOptions.length > 0 && (
    <div className={styles.shippingOptions}>
      {shippingOptions.map((option, index) => (
        <div
          key={index}
          className={`${styles.shippingOption} ${shippingCost === parseFloat(option.price) ? styles.selected : ''}`}
          onClick={() => setShippingCost(parseFloat(option.price))}
        >
          <span>{option.name} - {option.delivery_time} dias úteis</span>
          <span>R$ {parseFloat(option.price).toFixed(2)}</span>
        </div>
      ))}
    </div>
  )}

  <div className={styles.totalContainer}>
    <span>Subtotal:</span>
    <span className={styles.totalPrice}>R$ {cartTotal.toFixed(2)}</span>
    <span>Frete:</span>
    <span className={styles.totalPrice}>R$ {shippingCost.toFixed(2)}</span>
    <span>Total:</span>
    <span className={styles.totalPrice}>R$ {(cartTotal + shippingCost).toFixed(2)}</span>
  </div>

  <button
    className={styles.checkoutButton}
    onClick={handleCheckout}
    disabled={items.length === 0}
  >
    Finalizar Compra
  </button>
</div>
          </div>
        </div>

        {/* Overlay do Carrinho */}
        <div className={`${styles.overlay} ${openCartModal ? styles.open : ''}`} onClick={() => setOpenCartModal(false)} />

        {/* Modal de Pagamento */}
        <PaymentModal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} total={cartTotal + shippingCost} />

        {/* Modal do Produto */}
        <ProductModal
          open={openProductModal}
          onClose={() => setOpenProductModal(false)}
          product={selectedProduct}
          addToCart={handleAddToCart}
        />
      </div>

      <Footer />
    </div>
  );
}

export default Store;