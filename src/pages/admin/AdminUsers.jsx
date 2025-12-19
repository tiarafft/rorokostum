import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/AdminUsers.css'

export default function AdminUsers() {
  const { isSuperAdmin, adminData } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Gagal memuat data admin')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isSuperAdmin) {
      setError('Hanya Super Admin yang dapat mengelola akun admin')
      return
    }

    try {
      if (editingUser) {
        await handleUpdate()
      } else {
        await handleCreate()
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Terjadi kesalahan')
    }
  }

  const handleCreate = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError('Semua field harus diisi')
      return
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert([{
            user_id: authData.user.id,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            created_by: adminData.user_id,
            is_active: true
          }])

        if (insertError) throw insertError

        setSuccess('Admin berhasil dibuat')
        setShowForm(false)
        resetForm()
        fetchUsers()
      }
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async () => {
    try {
      const updateData = {
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', editingUser.id)

      if (error) throw error

      setSuccess('Admin berhasil diupdate')
      setShowForm(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error) {
      throw error
    }
  }

  const handleEdit = (user) => {
    if (!isSuperAdmin) {
      setError('Hanya Super Admin yang dapat mengedit akun admin')
      return
    }

    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      password: ''
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (userId) => {
    if (!isSuperAdmin) {
      setError('Hanya Super Admin yang dapat menghapus akun admin')
      return
    }

    if (!confirm('Apakah Anda yakin ingin menghapus admin ini?')) return

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setSuccess('Admin berhasil dihapus')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Gagal menghapus admin')
    }
  }

  const handleToggleStatus = async (user) => {
    if (!isSuperAdmin) {
      setError('Hanya Super Admin yang dapat mengubah status admin')
      return
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)

      if (error) throw error

      setSuccess(`Admin berhasil ${!user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
      fetchUsers()
    } catch (error) {
      console.error('Error toggling status:', error)
      setError('Gagal mengubah status admin')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    })
    setEditingUser(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  if (!isSuperAdmin) {
    return (
      <div className="admin-crud-container">
        <div className="alert alert-danger">
          <h3>Akses Ditolak</h3>
          <p>Hanya Super Admin yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="admin-users-page">
      <div className="page-header-users">
        <div>
          <h1>Kelola Admin</h1>
          <p>Manage administrator accounts and permissions</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-add-user">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Tambah Admin
          </button>
        )}
      </div>

      {error && (
        <div className="alert-box alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>Error!</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => setError('')} className="alert-close-btn">×</button>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success">
          <div className="alert-icon">✓</div>
          <div className="alert-content">
            <strong>Berhasil!</strong>
            <p>{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="alert-close-btn">×</button>
        </div>
      )}

      {showForm && (
        <div className="user-form-card">
          <div className="card-header-user">
            <div>
              <h3>{editingUser ? 'Edit Admin' : 'Tambah Admin Baru'}</h3>
              <p>{editingUser ? 'Update informasi administrator' : 'Buat akun administrator baru'}</p>
            </div>
            <button onClick={resetForm} className="close-form-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-field">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  disabled={!!editingUser}
                  required
                />
              </div>

              {!editingUser && (
                <div className="form-field">
                  <label>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    minLength="6"
                    required
                  />
                </div>
              )}

              <div className="form-field">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {editingUser && (
                <div className="form-field-checkbox">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="checkbox-label">Akun Aktif</span>
                  </label>
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Batal
              </button>
              <button type="submit" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {editingUser ? 'Update Admin' : 'Simpan Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-card">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Role</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-content">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <p>Belum ada admin terdaftar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role === 'super_admin' ? 'role-super' : 'role-admin'}`}>
                        {user.role === 'super_admin' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        )}
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot"></span>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          onClick={() => handleEdit(user)}
                          className="action-btn action-edit"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`action-btn ${user.is_active ? 'action-lock' : 'action-unlock'}`}
                          title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.is_active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="action-btn action-delete"
                          title="Hapus"
                          disabled={user.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length === 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
