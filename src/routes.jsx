import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home'


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
