import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/AdminCRUD.css'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    prosedur_sewa: '',
    company_name: '',
    company_address: '',
    company_description: '',
    facebook_url: '',
    instagram_url: '',
    google_maps_embed: '',
    google_maps_link: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value')

    if (data) {
      const settingsMap = {}
      data.forEach(item => {
        settingsMap[item.key] = item.value
      })
      setSettings(settingsMap)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="crud-page">
        <div className="page-header-admin">
          <div>
            <h1>Pengaturan</h1>
            <p>Kelola pengaturan aplikasi</p>
          </div>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="crud-content" style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <div className="form-group">
              <label htmlFor="whatsapp_number">
                Nomor WhatsApp
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginLeft: '0.5rem' }}>
                  (Format: 6281234567890)
                </span>
              </label>
              <input
                id="whatsapp_number"
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="6281234567890"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prosedur_sewa">Prosedur Sewa</label>
              <textarea
                id="prosedur_sewa"
                value={settings.prosedur_sewa}
                onChange={(e) => setSettings({ ...settings, prosedur_sewa: e.target.value })}
                rows="12"
                placeholder="1. Masa sewa kostum adalah 3 hari..."
                style={{ minHeight: '250px' }}
              />
              <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                Tulis setiap poin dengan format: 1. Poin pertama (enter) 2. Poin kedua, dst.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="company_name">Nama Perusahaan</label>
              <input
                id="company_name"
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="PT Roro Kostum Entertainment"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company_address">Alamat Perusahaan</label>
              <textarea
                id="company_address"
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                rows="3"
                placeholder="Jl. Contoh No. 123, Jakarta"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company_description">Deskripsi Perusahaan</label>
              <textarea
                id="company_description"
                value={settings.company_description}
                onChange={(e) => setSettings({ ...settings, company_description: e.target.value })}
                rows="5"
                placeholder="Deskripsi singkat tentang perusahaan..."
              />
            </div>

            <div style={{
              marginTop: '2rem',
              marginBottom: '1.5rem',
              paddingTop: '2rem',
              borderTop: '2px solid var(--gray-200)'
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--black)' }}>Social Media</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                Link akun social media perusahaan
              </p>

              <div className="form-group">
                <label htmlFor="facebook_url">Facebook URL</label>
                <input
                  id="facebook_url"
                  type="url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://www.facebook.com/rorokostum"
                />
              </div>

              <div className="form-group">
                <label htmlFor="instagram_url">Instagram URL</label>
                <input
                  id="instagram_url"
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/rorokostum"
                />
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              marginBottom: '1.5rem',
              paddingTop: '2rem',
              borderTop: '2px solid var(--gray-200)'
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--black)' }}>Google Maps</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                Lokasi perusahaan di Google Maps
              </p>

              <div className="form-group">
                <label htmlFor="google_maps_link">Google Maps Link</label>
                <input
                  id="google_maps_link"
                  type="url"
                  value={settings.google_maps_link}
                  onChange={(e) => setSettings({ ...settings, google_maps_link: e.target.value })}
                  placeholder="https://maps.google.com/?q=lokasi-anda"
                />
                <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  Link untuk membuka lokasi di Google Maps
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="google_maps_embed">Google Maps Embed URL</label>
                <textarea
                  id="google_maps_embed"
                  value={settings.google_maps_embed}
                  onChange={(e) => setSettings({ ...settings, google_maps_embed: e.target.value })}
                  rows="3"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  Cara: Buka Google Maps, klik Share, pilih Embed a map, copy URL dari iframe src
                </small>
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings
