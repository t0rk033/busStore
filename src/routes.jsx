import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home'
import NavBar from './components/NavBar'
import Login from './pages/login/Login'

function RoutesApp() {
  return (
   <HashRouter>
        <Routes>
            <Route path='/' element={<Home/>} />
        </Routes>
   </HashRouter>
  )
}

export default RoutesApp
