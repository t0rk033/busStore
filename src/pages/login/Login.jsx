import React, { useState } from 'react';
import { FaUser, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../firebase';
import styles from './login.module.css';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Função para login com email/senha
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login realizado com sucesso!');
      // Redirecionar o usuário após o login
      window.location.href = '/#/perfil'; // Altere para a rota desejada
    } catch (err) {
      setError('Email ou senha incorretos.');
      console.error(err);
    }
  };

  // Função para login com Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Login com Google realizado com sucesso!');
      window.location.href = '/dashboard'; // Altere para a rota desejada
    } catch (err) {
      setError('Erro ao fazer login com Google.');
      console.error(err);
    }
  };

  // Função para login com Facebook
  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      alert('Login com Facebook realizado com sucesso!');
      window.location.href = '/dashboard'; // Altere para a rota desejada
    } catch (err) {
      setError('Erro ao fazer login com Facebook.');
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>Login</h1>
          <form onSubmit={handleLogin} className={styles.form}>
            {/* Campo de Email */}
            <div className={styles.inputGroup}>
              <FaUser className={styles.icon} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            {/* Campo de Senha */}
            <div className={styles.inputGroup}>
              <FaLock className={styles.icon} />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            {/* Mensagem de Erro */}
            {error && <p className={styles.error}>{error}</p>}

            {/* Botão de Login */}
            <button type="submit" className={styles.button}>
              Entrar
            </button>

            {/* Divisor */}
            <div className={styles.divider}>
              <span>OU</span>
            </div>

            {/* Login com Redes Sociais */}
            <div className={styles.socialLogin}>
              <button
                type="button"
                className={styles.socialButton}
                onClick={handleGoogleLogin}
              >
                <FaGoogle className={styles.socialIcon} />
                Continuar com Google
              </button>
              {/* <button
                type="button"
                className={styles.socialButton}
                onClick={handleFacebookLogin}
              >
                <FaFacebook className={styles.socialIcon} />
                Continuar com Facebook
              </button> */}
            </div>

            {/* Link para Cadastro */}
            <p clasbsName={styles.signupText}>
              Não tem uma conta? <Link to="/registro" className={styles.signupLink}>Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;