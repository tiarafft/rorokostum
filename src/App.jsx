import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import DetailKostum from './pages/DetailKostum'
import TrackingOrder from './pages/TrackingOrder'
import ProsedurSewa from './pages/ProsedurSewa'
import CompanyProfile from './pages/CompanyProfile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminKategori from './pages/admin/AdminKategori'
import AdminKostum from './pages/admin/AdminKostum'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="app">
      <Navbar />
      <FloatingWhatsApp />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/kostum/:id" element={<DetailKostum />} />
        <Route path="/tracking" element={<TrackingOrder />} />
        <Route path="/prosedur-sewa" element={<ProsedurSewa />} />
        <Route path="/company-profile" element={<CompanyProfile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kategori"
          element={
            <ProtectedRoute>
              <AdminKategori />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kostum"
          element={
            <ProtectedRoute>
              <AdminKostum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
