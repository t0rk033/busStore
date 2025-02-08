import React from 'react';
import styles from './AdminHome.module.css'; // Importando o CSS Module

function AdminHome() {
  return (
    <div className={styles.dashboard}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <div className={styles.logo}>Minha Loja Esportiva</div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Pesquisar..." />
        </div>
        <div className={styles.userActions}>
          <span className={styles.notificationIcon}>🔔</span>
          <span className={styles.userProfile}>👤</span>
        </div>
      </header>

      {/* Barra Lateral */}
      <aside className={styles.sidebar}>
        <ul>
          <li>🏠 Dashboard</li>
          <li>📦 Produtos</li>
          <li>💰 Vendas</li>
          <li>👥 Clientes</li>
          <li>📊 Relatórios</li>
          <li>⚙️ Configurações</li>
        </ul>
      </aside>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        {/* Cards de Resumo */}
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <h3>Total de Vendas</h3>
            <p>R$ 25.000</p>
            <span>📈</span>
          </div>
          <div className={styles.card}>
            <h3>Produtos em Estoque</h3>
            <p>1.200</p>
            <span>📦</span>
          </div>
          <div className={styles.card}>
            <h3>Novos Clientes</h3>
            <p>150</p>
            <span>👥</span>
          </div>
          <div className={styles.card}>
            <h3>Lucro Mensal</h3>
            <p>R$ 10.000</p>
            <span>💰</span>
          </div>
        </div>

        {/* Gráficos */}
        <div className={styles.charts}>
          <div className={styles.chart}>
            <h3>Vendas por Categoria</h3>
            {/* Espaço para gráfico */}
            <div className={styles.chartPlaceholder}></div>
          </div>
          <div className={styles.chart}>
            <h3>Distribuição de Estoque</h3>
            {/* Espaço para gráfico */}
            <div className={styles.chartPlaceholder}></div>
          </div>
        </div>

        {/* Tabela de Pedidos Recentes */}
        <div className={styles.recentOrders}>
          <h3>Pedidos Recentes</h3>
          <table>
            <thead>
              <tr>
                <th>Nº do Pedido</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#001</td>
                <td>João Silva</td>
                <td>R$ 250,00</td>
                <td>Entregue</td>
              </tr>
              <tr>
                <td>#002</td>
                <td>Maria Souza</td>
                <td>R$ 150,00</td>
                <td>Pendente</td>
              </tr>
              <tr>
                <td>#003</td>
                <td>Carlos Oliveira</td>
                <td>R$ 300,00</td>
                <td>Cancelado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;