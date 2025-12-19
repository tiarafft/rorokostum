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
    google_maps_link: '',
    logo_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

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

      if (settingsMap.logo_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('company-assets')
          .getPublicUrl(settingsMap.logo_url)

        const timestamp = new Date().getTime()
        setLogoPreview(`${publicUrl}?t=${timestamp}`)
      }
    }
  }

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format file tidak valid. Gunakan PNG, JPG, SVG, atau WEBP' })
      return
    }

    if (file.size > 2097152) {
      setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 2MB' })
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)
    setMessage({ type: '', text: '' })
  }

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setMessage({ type: 'error', text: 'Pilih file logo terlebih dahulu' })
      return
    }

    setUploadingLogo(true)
    setMessage({ type: '', text: '' })

    try {
      if (settings.logo_url) {
        await supabase.storage
          .from('company-assets')
          .remove([settings.logo_url])
      }

      const fileExt = logoFile.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, logoFile)

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: filePath, updated_at: new Date().toISOString() })
        .eq('key', 'logo_url')

      if (updateError) throw updateError

      setSettings({ ...settings, logo_url: filePath })
      setLogoFile(null)
      setMessage({ type: 'success', text: 'Logo berhasil diunggah' })

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath)
      const timestamp = new Date().getTime()
      setLogoPreview(`${publicUrl}?t=${timestamp}`)

      localStorage.setItem('logo_updated', Date.now().toString())
      window.dispatchEvent(new Event('logo_changed'))
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!settings.logo_url) return

    if (!confirm('Apakah Anda yakin ingin menghapus logo?')) return

    setUploadingLogo(true)
    setMessage({ type: '', text: '' })

    try {
      const { error: deleteError } = await supabase.storage
        .from('company-assets')
        .remove([settings.logo_url])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: '', updated_at: new Date().toISOString() })
        .eq('key', 'logo_url')

      if (updateError) throw updateError

      setSettings({ ...settings, logo_url: '' })
      setLogoPreview(null)
      setLogoFile(null)
      setMessage({ type: 'success', text: 'Logo berhasil dihapus' })

      localStorage.setItem('logo_updated', Date.now().toString())
      window.dispatchEvent(new Event('logo_changed'))
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploadingLogo(false)
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
            <div style={{
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '2px solid var(--gray-200)'
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--black)' }}>Logo Perusahaan</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                Upload, ganti, atau hapus logo perusahaan
              </p>

              {logoPreview && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '1.5rem',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      backgroundColor: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gray-200)'
                    }}
                  />
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--gray-600)',
                    textAlign: 'center'
                  }}>
                    {logoFile ? 'Logo baru (belum disimpan)' : 'Logo saat ini'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label
                    htmlFor="logo-upload"
                    style={{
                      padding: '0.625rem 1.25rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                      border: 'none'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                  >
                    {settings.logo_url ? 'Ganti Logo' : 'Pilih Logo'}
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoSelect}
                    style={{ display: 'none' }}
                  />

                  {logoFile && (
                    <button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={uploadingLogo}
                      style={{
                        padding: '0.625rem 1.25rem',
                        backgroundColor: 'var(--success)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: uploadingLogo ? 0.6 : 1
                      }}
                    >
                      {uploadingLogo ? 'Mengunggah...' : 'Upload Logo'}
                    </button>
                  )}

                  {settings.logo_url && !logoFile && (
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      disabled={uploadingLogo}
                      style={{
                        padding: '0.625rem 1.25rem',
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: uploadingLogo ? 0.6 : 1
                      }}
                    >
                      {uploadingLogo ? 'Menghapus...' : 'Hapus Logo'}
                    </button>
                  )}
                </div>

                <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  Format: PNG, JPG, SVG, WEBP. Maksimal 2MB
                </small>
              </div>
            </div>

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
