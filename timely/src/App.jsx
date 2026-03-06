// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"


function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
