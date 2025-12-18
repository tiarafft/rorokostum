import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/AdminLogin.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isRegister) {
        await signUp(email, password)
        setSuccess('Registrasi berhasil! Silakan login.')
        setIsRegister(false)
        setEmail('')
        setPassword('')
      } else {
        await signIn(email, password)
        navigate('/admin/dashboard')
      }
    } catch (err) {
      if (isRegister) {
        setError(err.message || 'Registrasi gagal')
      } else {
        setError('Email atau password salah')
      }
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
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Loading...' : (isRegister ? 'Daftar' : 'Login')}
          </button>

          <button
            type="button"
            className="btn-toggle"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setSuccess('')
            }}
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">← Kembali ke Website</a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
