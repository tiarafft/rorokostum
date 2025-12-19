import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, adminData, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>Loading...</div>
      </div>
    )
  }

  if (!user || !adminData || !adminData.is_active) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
