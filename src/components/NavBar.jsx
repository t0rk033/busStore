import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import logo from '../assets/images/logo.png';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

function NavBar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirecionar para a página inicial após logout
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`${styles.navbarmain} ${!isHomePage ? styles.scrolled : ''}`}>
      <div className={styles.navbar}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <nav className={styles.navbarContainer}>
          <ul className={styles.navLinks}>
            <Link to='/'>Inicio</Link>
            <Link to="/loja">Loja</Link>
            <Link to='/reservas'>Reservas</Link>
            <div className={styles.account}>
              {userLoggedIn ? (
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Sair
                </button>
              ) : (
                <Link to="/registro">Conta</Link>
              )}
            </div>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default NavBar;