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
          <h2>Uma nova era de conveniência.</h2>
          <p className={styles.pDetails}>Nossa loja móvel foi projetada para atender às suas demandas onde quer que você esteja. Seja na estrada ou na sua vizinhança, trazemos qualidade e facilidade até você.</p>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            
            <h3><span>1</span> Melhor Rota</h3>
            <p>Otimizamos nossos trajetos para máxima acessibilidade</p>
          </div>
          <div className={styles.card}>
            
            <h3><span>2</span>Rotas Parceria</h3>
            <p>Trabalhamos em conjunto com comunidades para servir melhor.</p>
          </div>
          <div className={styles.card}>
            
            <h3><span>3</span>Negócios Inovadores</h3>
            <p>Criamos soluções únicas para clientes modernos</p>
          </div>
          <div className={styles.card}>
            
            <h3><span>4</span>Diferenciais</h3>
            <p>Atendimento personalizado em qualquer lugar.</p>
          </div>
          <div className={styles.card}>
            
            <h3><span>5</span>Confiança Garantida</h3>
            <p>Produtos de qualidade, entregues diretamente.</p>
          </div>
          <div className={styles.card}>
            
            <h3><span>6</span>Lorem ipsum dolor </h3>
            <p>sit amet consectetur adipisicing elit.</p>
          </div>
        
        </div>
      </div>

      <div className={styles.thirdSection}>
          <div className={styles.thirdSectionContainer}>
            <h2>Soluções de mobilidade para um futuro mais conectado</h2>
            <p>A Bus Store oferece produtos e serviços que conectam comunidades e tornam a mobilidade mais eficiente. Deixe-nos transformar sua experiência de compra</p>
            <div className={styles.buttons}>
          <button className={styles.reserveButton}>Reserve</button>
          <button className={styles.thirdDetailButton}>Ver Loja</button>
         </div>
          </div>
          <img src={bus} alt="Imagem de ônibus" />
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
