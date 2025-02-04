import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from 'react-use-cart'; // Importando o CartProvider
import Store from './pages/store/Store';
import Home from './pages/home/Home';
import StockManagement from './pages/admin/StockManagement';

function RoutesApp() {
  return (
    <CartProvider> {/* Envolvendo toda a aplicação */}
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='loja' element={<Store />} />
          <Route path='/estoque' element={<StockManagement />} />
        </Routes>
      </HashRouter>
    </CartProvider>
  );
}

export default RoutesApp;
