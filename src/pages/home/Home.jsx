import React from 'react';
import styles from './Home.module.css';
import NavBar from '../../components/NavBar';
import bus from '../../assets/images/SemFundo.png'

function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.firstSection}>
       <NavBar/>
       <div className={styles.firstSectionContainer}>
         <h1>Inovação - The store on the way!</h1>
         <p>A primeira loja móvel que vem até você. Descubra uma nova forma de comprar enquanto está em movimento. Experimente conveniência e inovação.</p>
         <div className={styles.buttons}>
          <button className={styles.reserveButton}>Reserve</button>
          <button className={styles.detailButton}>Detalhes</button>
         </div>
       </div>
      </div>


      <div className={styles.secondSection}>
        <div className={styles.details}>
          <h2>O Bus Store: Inovação e Praticidade sobre Rodas</h2>
          <p>O Bus Store é uma loja móvel que oferece uma experiência completa e inovadora, combinando praticidade e conforto para atender às suas necessidades. Confira os destaques:</p>

          <ul>
            <li>Estrutura completa de uma loja convencional.</li>
            <li>Interior climatizado com ar-condicionado para maior conforto.</li>
            <li>Provador exclusivo, permitindo que você experimente os looks no momento.</li>
            <li>Versátil: funciona como loja própria ou como espaço para locação por marcas.</li>
            <li>Plataforma no teto para eventos especiais.</li>
            <li>DJ e locutor durante os eventos, promovendo visibilidade, engajamento e criando experiências únicas para o público.</li>
          </ul>
        </div>
        
      </div>

      <div className={styles.thirdSection}>
  <div className={styles.thirdSectionContainer}>
    <h2>O Diferencial do Bus Store</h2>
    <p>Uma experiência única que combina mobilidade, inovação e exclusividade.</p>

    <div className={styles.thirdFeatures}>
      <div className={styles.featureCard}>
        <h3>🚀 Mobilidade</h3>
        <p>Levamos a loja até os maiores eventos do Brasil, aproximando marcas do público.</p>
      </div>
      <div className={styles.featureCard}>
        <h3>🎨 Personalização</h3>
        <p>O ônibus pode ser customizado por marcas para criar experiências exclusivas.</p>
      </div>
      <div className={styles.featureCard}>
        <h3>🔊 Visibilidade</h3>
        <p>DJ e locutor promovem engajamento e tornam o Bus Store o destaque do evento.</p>
      </div>
      <div className={styles.featureCard}>
        <h3>🛍️ Conforto & Experiência</h3>
        <p>Provadores, climatização e infraestrutura completa para uma compra diferenciada.</p>
      </div>
    </div>

    <div className={styles.buttons}>
      <button className={styles.reserveButton}>Reserve</button>
      <button className={styles.thirdDetailButton}>Ver Loja</button>
    </div>
  </div>

  
</div>

<div className={styles.eventsSection}>
  <h2>Próximos Eventos</h2>
  <p className={styles.eventsDescription}>
    A Bus Store estará presente nos maiores torneios de tênis do mundo. Confira onde você pode nos encontrar em breve!
  </p>
  <div className={styles.eventsList}>
    <div className={styles.eventCard}>
      <h3>Australian Open</h3>
      <p>Data: Janeiro de 2025</p>
      <p>Local: Melbourne Park, Melbourne - Austrália</p>
      <button className={styles.eventButton}>Mais informações</button>
    </div>
    <div className={styles.eventCard}>
      <h3>Roland Garros (French Open)</h3>
      <p>Data: Maio e Junho de 2025</p>
      <p>Local: Stade Roland Garros, Paris - França</p>
      <button className={styles.eventButton}>Mais informações</button>
    </div>
    <div className={styles.eventCard}>
      <h3>Wimbledon</h3>
      <p>Data: Junho e Julho de 2025</p>
      <p>Local: All England Club, Londres - Reino Unido</p>
      <button className={styles.eventButton}>Mais informações</button>
    </div>
    <div className={styles.eventCard}>
      <h3>US Open</h3>
      <p>Data: Agosto e Setembro de 2025</p>
      <p>Local: USTA Billie Jean King National Tennis Center, Nova York - EUA</p>
      <button className={styles.eventButton}>Mais informações</button>
    </div>
    <div className={styles.eventCard}>
      <h3>ATP Finals</h3>
      <p>Data: Novembro de 2025</p>
      <p>Local: The O2 Arena, Londres - Reino Unido</p>
      <button className={styles.eventButton}>Mais informações</button>
    </div>
  </div>
</div>

      <div className={styles.footer}>
  <div className={styles.footerContent}>
    <div className={styles.footerSection}>
      <h4>Sobre Nós</h4>
      <p>
        A Bus Store é pioneira em levar a experiência de compra diretamente até você, onde quer que esteja.
      </p>
    </div>
    <div className={styles.footerSection}>
      <h4>Links Úteis</h4>
      <ul>
        <li><a href="#home">Início</a></li>
        <li><a href="#about">Sobre</a></li>
        <li><a href="#services">Serviços</a></li>
        <li><a href="#contact">Contato</a></li>
      </ul>
    </div>
    <div className={styles.footerSection}>
      <h4>Contato</h4>
      <p>Email: contato@busstore.com</p>
      <p>Telefone: +55 31 1234-5678</p>
      <p>Endereço: Rua do Futuro, 123, Monte Santo de Minas, MG</p>
    </div>
  </div>
  <div className={styles.footerBottom}>
    <p>&copy; 2025 Bus Store. Todos os direitos reservados.</p>
  </div>
</div>

    </div>
  );
}

export default Home;
