import React from 'react'
import styles from './Navbar.module.css'
import logo from '../assets/images/logo.png'
function NavBar() {
  return (
    <div className={styles.navbarmain}>
        
       <div className={styles.navbar}>
       <img src={logo} alt="Logo" className={styles.logo} />
              <nav className={styles.navbarContainer}>
                <ul className={styles.navLinks}>
                  <li>Inicio</li>
                  <li>Loja</li>
                  <li>Reservas</li>
                  <li className={styles.account}>conta</li>
                </ul>
              </nav> 
            </div>
    </div>
  )
}

export default NavBar
