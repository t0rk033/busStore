import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import styles from './profile.module.css';
import {
  FaUser, FaEnvelope, FaIdCard, FaPhone, FaBirthdayCake,
  FaMapMarkerAlt, FaEdit, FaSignOutAlt, FaShoppingBag,
  FaMoneyBillWave, FaCalendarAlt, FaBox
} from 'react-icons/fa';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

function Profile() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Carrega dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setMessage('Erro ao carregar dados do usuário');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Carrega histórico de pedidos
  useEffect(() => {
    const fetchSalesHistory = async () => {
      if (user) {
        try {
          // Busca todos os documentos da coleção 'sales'
          const salesQuery = collection(db, 'sales');
          const salesSnapshot = await getDocs(salesQuery);
  
          const orders = [];
  
          // Itera sobre cada venda
          for (const saleDoc of salesSnapshot.docs) {
            // Busca a subcoleção 'user' para verificar se o pedido pertence ao usuário logado
            const userSubcollection = collection(db, 'sales', saleDoc.id, 'user');
            const userSnapshot = await getDocs(userSubcollection);
  
            // Verifica se algum documento na subcoleção 'user' contém o UID do usuário logado
            const userDoc = userSnapshot.docs.find((doc) => doc.data().uid === user.uid);
  
            if (userDoc) {
              console.log('Pedido pertence ao usuário:', saleDoc.id);
  
              // Busca os itens da subcoleção 'items'
              const itemsSubcollection = collection(db, 'sales', saleDoc.id, 'items');
              const itemsSnapshot = await getDocs(itemsSubcollection);
              const items = itemsSnapshot.docs.map((doc) => doc.data());
  
              // Busca os dados de pagamento da subcoleção 'payment'
              const paymentSubcollection = collection(db, 'sales', saleDoc.id, 'payment');
              const paymentSnapshot = await getDocs(paymentSubcollection);
              const payment = paymentSnapshot.docs[0]?.data();
  
              // Adiciona o pedido ao histórico
              orders.push({
                id: saleDoc.id,
                date: saleDoc.data().date?.toDate().toLocaleDateString('pt-BR'),
                total: saleDoc.data().total,
                status: saleDoc.data().shipped ? 'Enviado' : 'Processando',
                items: items,
                payment: payment,
                user: userDoc.data() // Dados do usuário
              });
            }
          }
  
          // Ordena os pedidos por data (do mais recente para o mais antigo)
          setSalesHistory(orders.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
          console.error('Erro ao carregar histórico:', error);
          setMessage('Erro ao carregar histórico de pedidos');
        }
      }
    };
  
    fetchSalesHistory();
  }, [user]);

  // Função para salvar alterações no perfil
  const handleSave = async () => {
    try {
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, userData);
      setMessage('Dados atualizados com sucesso!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao salvar alterações');
      console.error(error);
    }
  };

  // Função para atualizar campos editáveis
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para logout
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Erro ao sair:', error));
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (!userData) return <div className={styles.error}>{message}</div>;

  return (
    <div>
      <NavBar />
      <div className={styles.profileContainer}>
        {/* Cabeçalho do perfil */}
        <header className={styles.profileHeader}>
          <h1>
            <FaUser /> Meu Perfil
          </h1>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <FaUser size={40} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mensagem de sucesso/erro */}
        {message && <div className={styles.message}>{message}</div>}

        {/* Informações pessoais */}
        <div className={styles.profileContent}>
          <section className={styles.section}>
            <h2>
              <FaUser /> Informações Pessoais
            </h2>
            <div className={styles.grid}>
              <InfoField
                icon={<FaIdCard />}
                label="Nome Completo"
                name="fullName"
                value={userData.fullName}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                icon={<FaEnvelope />}
                label="E-mail"
                name="email"
                value={userData.email}
                editing={isEditing}
                onChange={handleChange}
                type="email"
              />
              <InfoField
                icon={<FaIdCard />}
                label="CPF"
                name="cpf"
                value={userData.cpf}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                icon={<FaPhone />}
                label="Telefone"
                name="phone"
                value={userData.phone}
                editing={isEditing}
                onChange={handleChange}
                type="tel"
              />
              <InfoField
                icon={<FaBirthdayCake />}
                label="Data de Nascimento"
                name="birthDate"
                value={userData.birthDate}
                editing={isEditing}
                onChange={handleChange}
                type="date"
              />
            </div>
          </section>

          {/* Endereço */}
          <section className={styles.section}>
            <h2>
              <FaMapMarkerAlt /> Endereço
            </h2>
            <div className={styles.grid}>
              <InfoField
                label="Rua"
                name="street"
                value={userData.address?.street}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Número"
                name="number"
                value={userData.address?.number}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Complemento"
                name="complement"
                value={userData.address?.complement}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Bairro"
                name="neighborhood"
                value={userData.address?.neighborhood}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Cidade"
                name="city"
                value={userData.address?.city}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="Estado"
                name="state"
                value={userData.address?.state}
                editing={isEditing}
                onChange={handleChange}
              />
              <InfoField
                label="CEP"
                name="zipCode"
                value={userData.address?.zipCode}
                editing={isEditing}
                onChange={handleChange}
                type="tel"
              />
            </div>
          </section>

          {/* Histórico de pedidos */}
          <section className={styles.section}>
            <h2>
              <FaShoppingBag /> Histórico de Pedidos
            </h2>
            {salesHistory.length === 0 ? (
              <div className={styles.emptyHistory}>Nenhum pedido encontrado</div>
            ) : (
              <div className={styles.ordersContainer}>
                {salesHistory.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMeta}>
                        <span className={styles.orderId}>Pedido #{order.id.slice(0, 8)}</span>
                        <span className={styles.orderDate}>
                          <FaCalendarAlt /> {order.date}
                        </span>
                      </div>
                      <div className={`${styles.status} ${order.status === 'Enviado' ? styles.shipped : styles.processing}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className={styles.orderBody}>
                      <div className={styles.orderSection}>
                        <h4><FaBox /> Produtos</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className={styles.orderItem}>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemQuantity}>x{item.quantity}</span>
                            </div>
                            <span className={styles.itemPrice}>
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderSection}>
                        <h4><FaMoneyBillWave /> Pagamento</h4>
                        <p>
                          Método: {order.payment?.method || 'Não informado'}<br />
                          Status: {order.payment?.status || 'Não informado'}
                        </p>
                      </div>

                      <div className={styles.orderTotal}>
                        <FaMoneyBillWave />
                        <span>Total:</span>
                        <strong>R$ {order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Botão de logout */}
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <FaSignOutAlt /> Sair
        </button>

        {/* Botões de edição/salvar */}
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button className={styles.saveButton} onClick={handleSave}>
                Salvar Alterações
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Editar Perfil
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Componente para campos de informação
const InfoField = ({ icon, label, name, value, editing, onChange, type = 'text' }) => (
  <div className={styles.field}>
    <label>
      {icon} {label}
    </label>
    {editing ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={styles.input}
      />
    ) : (
      <p className={styles.value}>{value || 'Não informado'}</p>
    )}
  </div>
);

export default Profile;