import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import '../../styles/AdminLogin.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signOut, user, adminData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && adminData) {
      navigate('/admin/dashboard')
    }
  }, [user, adminData, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: authData, error: signInError } = await signIn(email, password)

      if (signInError) throw signInError

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      if (adminError) throw adminError

      if (!adminUser) {
        await signOut()
        setError('Akun Anda tidak terdaftar sebagai admin. Hubungi Super Admin untuk registrasi.')
        return
      }

      if (!adminUser.is_active) {
        await signOut()
        setError('Akun Anda telah dinonaktifkan. Hubungi Super Admin.')
        return
      }

      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <h1>RORO</h1>
          <p>Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@rorokostum.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>

          <div className="login-note">
            <small>Hanya admin yang terdaftar dapat mengakses sistem. Hubungi Super Admin untuk registrasi.</small>
          </div>
        </form>

        <div className="login-footer">
          <a href="/">← Kembali ke Website</a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
