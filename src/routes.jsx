import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from 'react-use-cart'; // Importando o CartProvider
import Store from './pages/store/Store';
import Home from './pages/home/Home';
import StockManagement from './pages/admin/StockManagement';
import Reservations from './pages/reservations/Reservations';
import Login from './pages/login/Login';
import Signup from './pages/login/Signup';
import AdminHome from './pages/admin/adminHome';

function RoutesApp() {
  return (
    <CartProvider> {/* Envolvendo toda a aplicação */}
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='loja' element={<Store />} />
          <Route path='/estoque' element={<StockManagement />} />
          <Route path='/reservas' element={<Reservations/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path="/registro" element={<Signup />} />
          <Route path='/admin' element={<AdminHome/>} />
        </Routes>
      </HashRouter>
    </CartProvider>
  );
}

export default RoutesApp;
