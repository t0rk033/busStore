import React from 'react'
import styles from './Navbar.module.css'
import logo from '../assets/images/logo.png'
import { Link } from 'react-router-dom'
function NavBar() {
  return (
    <div className={styles.navbarmain}>
        
       <div className={styles.navbar}>
       <img src={logo} alt="Logo" className={styles.logo} />
              <nav className={styles.navbarContainer}>
                <ul className={styles.navLinks}>
                  <Link to='/'>Inicio</Link>
                  <Link to="/loja"> Loja</Link>
                  <Link to='/reservas'>Reservas</Link>
                  <li className={styles.account}>conta</li>
                </ul>
              </nav> 
            </div>
    </div>
  )
}

export default NavBar
