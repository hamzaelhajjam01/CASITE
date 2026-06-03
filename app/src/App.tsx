import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}
