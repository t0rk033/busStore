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
import { AuthProvider } from './AuthContext';
import Profile from './pages/users/Profile';

function RoutesApp() {
  return (
    <AuthProvider>
    <CartProvider> {/* Envolvendo toda a aplicação */}
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='loja' element={<Store />} />
          <Route path='/admin' element={<StockManagement />} />
          <Route path='/reservas' element={<Reservations/>} />
          <Route path='/login' element={<Login/>}/>
          <Route path="/registro" element={<Signup />} />
          <Route path='/admin' element={<AdminHome/>} />
          <Route path ='/perfil' element={<Profile/>} />
        </Routes>
      </HashRouter>
    </CartProvider>
    </AuthProvider>
  );
}

export default RoutesApp;
