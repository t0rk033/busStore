import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import styles from './profile.module.css';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

function Profile() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setMessage('Perfil não encontrado');
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Erro ao sair:', error));
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (!userData) return <div className={styles.error}>{message}</div>;

  return (
    <div>
        <NavBar/>
        <div className={styles.profileContainer}>
          <header className={styles.profileHeader}>
            <h1><FaUser /> Meu Perfil</h1>
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
          {message && <div className={styles.message}>{message}</div>}
          <div className={styles.profileContent}>
            <section className={styles.section}>
              <h2><FaUser /> Informações Pessoais</h2>
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
            <section className={styles.section}>
              <h2><FaMapMarkerAlt /> Endereço</h2>
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
          </div>
          <button className={styles.signOutButton} onClick={handleSignOut}>
              <FaSignOutAlt /> Sair
            </button>
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
        <Footer/>
    </div>
  );
}

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
