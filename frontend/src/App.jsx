import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import PartsPage from './pages/PartsPage'
import PartDetailPage from './pages/PartDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GaragePage from './pages/GaragePage'
import OrdersPage from './pages/OrdersPage'
import MaintenancePage from './pages/MaintenancePage'
import DiagramPage from './pages/DiagramPage'
import AdminPage from './pages/AdminPage'
import StoreFinderPage from './pages/StoreFinderPage'
import SellerDashboard from './pages/SellerDashboard'
import Navbar from './components/Navbar'
import useAuthStore from './store/authStore'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <>
            <Navbar />
            <SearchPage />
          </>
        } />
        <Route path="/parts" element={
          <>
            <Navbar />
            <PartsPage />
          </>
        } />
        <Route path="/parts/:partId" element={
          <>
            <Navbar />
            <PartDetailPage />
          </>
        } />
        <Route path="/parts/:partId" element={
          <ProtectedRoute>
            <PartDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/diagram" element={
          <ProtectedRoute>
            <DiagramPage />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/garage" element={
          <ProtectedRoute>
            <GaragePage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/maintenance/:garageId" element={
          <ProtectedRoute>
            <MaintenancePage />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/stores" element={
          <ProtectedRoute>
            <StoreFinderPage />
          </ProtectedRoute>
        } />
        <Route path="/seller" element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}