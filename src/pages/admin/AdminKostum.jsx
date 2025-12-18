import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/AdminCRUD.css'

const AdminKostum = () => {
  const [kostums, setKostums] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    kategori_id: '',
    nama: '',
    ukuran_tersedia: '',
    harga_sewa: '',
    kuantitas_total: '1',
    kuantitas_tersedia: '1',
    deskripsi: '',
    status_ketersediaan: 'tersedia'
  })
  const [imageUrls, setImageUrls] = useState([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchKostums()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('kategori')
      .select('*')
      .order('nama')

    if (data) {
      setCategories(data)
    }
  }

  const fetchKostums = async () => {
    const { data } = await supabase
      .from('kostum')
      .select('*, kategori(*), gambar_kostum(*)')
      .order('created_at', { ascending: false })

    if (data) {
      setKostums(data)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const kuantitasTotal = parseInt(formData.kuantitas_total)
      const kuantitasTersedia = parseInt(formData.kuantitas_tersedia)

      const kostumData = {
        kategori_id: formData.kategori_id || null,
        nama: formData.nama,
        ukuran_tersedia: formData.ukuran_tersedia,
        harga_sewa: parseFloat(formData.harga_sewa),
        kuantitas_total: kuantitasTotal,
        kuantitas_tersedia: kuantitasTersedia,
        deskripsi: formData.deskripsi,
        status_ketersediaan: kuantitasTersedia > 0 ? 'tersedia' : 'disewa',
        updated_at: new Date().toISOString()
      }

      let kostumId = editingId

      if (editingId) {
        const { error } = await supabase
          .from('kostum')
          .update(kostumData)
          .eq('id', editingId)

        if (error) throw error

        await supabase
          .from('gambar_kostum')
          .delete()
          .eq('kostum_id', editingId)
      } else {
        const { data, error } = await supabase
          .from('kostum')
          .insert([kostumData])
          .select()

        if (error) throw error
        kostumId = data[0].id
      }

      if (imageUrls.length > 0) {
        const imageData = imageUrls.map((url, index) => ({
          kostum_id: kostumId,
          path: url,
          is_primary: index === 0
        }))

        const { error } = await supabase
          .from('gambar_kostum')
          .insert(imageData)

        if (error) throw error
      }

      setMessage({ type: 'success', text: editingId ? 'Kostum berhasil diupdate' : 'Kostum berhasil ditambahkan' })
      fetchKostums()
      handleCloseModal()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (kostum) => {
    setEditingId(kostum.id)
    setFormData({
      kategori_id: kostum.kategori_id || '',
      nama: kostum.nama,
      ukuran_tersedia: kostum.ukuran_tersedia,
      harga_sewa: kostum.harga_sewa.toString(),
      kuantitas_total: kostum.kuantitas_total?.toString() || '1',
      kuantitas_tersedia: kostum.kuantitas_tersedia?.toString() || '1',
      deskripsi: kostum.deskripsi,
      status_ketersediaan: kostum.status_ketersediaan
    })
    setImageUrls(kostum.gambar_kostum?.map(img => img.path) || [])
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kostum ini?')) return

    const { error } = await supabase
      .from('kostum')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Kostum berhasil dihapus' })
      fetchKostums()
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      kategori_id: '',
      nama: '',
      ukuran_tersedia: '',
      harga_sewa: '',
      kuantitas_total: '1',
      kuantitas_tersedia: '1',
      deskripsi: '',
      status_ketersediaan: 'tersedia'
    })
    setImageUrls([])
    setNewImageUrl('')
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' })
      return
    }

    setUploadingFile(true)
    setMessage({ type: '', text: '' })

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('kostum-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('kostum-images')
        .getPublicUrl(filePath)

      setImageUrls([...imageUrls, publicUrl])
      setMessage({ type: 'success', text: 'Gambar berhasil diupload' })

      e.target.value = ''
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal upload gambar: ' + error.message })
    } finally {
      setUploadingFile(false)
    }
  }

  const convertPexelsUrl = (url) => {
    if (!url) return 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400'

    if (url.includes('supabase.co') || url.includes('drive.google.com')) {
      return url
    }

    if (url.includes('images.pexels.com')) {
      return url
    }

    const photoIdMatch = url.match(/\/photo\/(\d+)/)
    if (photoIdMatch) {
      const photoId = photoIdMatch[1]
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=400`
    }

    return url
  }

  const getPrimaryImage = (kostum) => {
    const primaryImage = kostum.gambar_kostum?.find(img => img.is_primary)
    const imagePath = primaryImage?.path || kostum.gambar_kostum?.[0]?.path
    return convertPexelsUrl(imagePath)
  }

  return (
    <AdminLayout>
      <div className="crud-page">
        <div className="page-header-admin">
          <div>
            <h1>Manajemen Kostum</h1>
            <p>Kelola data kostum</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Tambah Kostum
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="crud-content">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Kuantitas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kostums.length > 0 ? (
                  kostums.map((kostum) => (
                    <tr key={kostum.id}>
                      <td>
                        <img
                          src={getPrimaryImage(kostum)}
                          alt={kostum.nama}
                          style={{
                            width: '60px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{kostum.nama}</td>
                      <td>{kostum.kategori?.nama || '-'}</td>
                      <td>Rp {kostum.harga_sewa.toLocaleString('id-ID')}</td>
                      <td>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>
                            {kostum.kuantitas_tersedia || 0}
                          </span>
                          <span style={{ color: 'var(--gray-500)' }}>
                            {' / '}{kostum.kuantitas_total || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            background: kostum.status_ketersediaan === 'tersedia' ? '#dcfce7' : '#fee2e2',
                            color: kostum.status_ketersediaan === 'tersedia' ? '#166534' : '#991b1b'
                          }}
                        >
                          {kostum.status_ketersediaan === 'tersedia' ? 'Tersedia' : 'Disewa'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/kostum/${kostum.id}`} className="btn-view" target="_blank">
                            Lihat
                          </Link>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(kostum)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(kostum.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      Belum ada kostum
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Kostum' : 'Tambah Kostum'}</h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="nama">Nama Kostum *</label>
                  <input
                    id="nama"
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="kategori_id">Kategori</label>
                  <select
                    id="kategori_id"
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ukuran_tersedia">Ukuran Tersedia *</label>
                  <input
                    id="ukuran_tersedia"
                    type="text"
                    value={formData.ukuran_tersedia}
                    onChange={(e) => setFormData({ ...formData, ukuran_tersedia: e.target.value })}
                    required
                    placeholder="Contoh: S, M, L, XL"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="harga_sewa">Harga Sewa (3 hari) *</label>
                  <input
                    id="harga_sewa"
                    type="number"
                    value={formData.harga_sewa}
                    onChange={(e) => setFormData({ ...formData, harga_sewa: e.target.value })}
                    required
                    min="0"
                    placeholder="50000"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="kuantitas_total">Kuantitas Total *</label>
                    <input
                      id="kuantitas_total"
                      type="number"
                      value={formData.kuantitas_total}
                      onChange={(e) => {
                        const total = parseInt(e.target.value) || 1
                        setFormData({
                          ...formData,
                          kuantitas_total: e.target.value,
                          kuantitas_tersedia: Math.min(parseInt(formData.kuantitas_tersedia) || 0, total).toString()
                        })
                      }}
                      required
                      min="1"
                      placeholder="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="kuantitas_tersedia">Kuantitas Tersedia *</label>
                    <input
                      id="kuantitas_tersedia"
                      type="number"
                      value={formData.kuantitas_tersedia}
                      onChange={(e) => setFormData({ ...formData, kuantitas_tersedia: e.target.value })}
                      required
                      min="0"
                      max={formData.kuantitas_total}
                      placeholder="1"
                    />
                    <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Status otomatis: {parseInt(formData.kuantitas_tersedia) > 0 ? 'Tersedia' : 'Disewa'}
                    </small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deskripsi">Deskripsi</label>
                  <textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi kostum..."
                  />
                </div>

                <div className="form-group">
                  <label>Gambar Kostum</label>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem', fontWeight: 600 }}>
                      📤 Upload Gambar dari Komputer (Disarankan)
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        id="file-upload"
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="file-upload"
                        style={{
                          flex: 1,
                          padding: '0.875rem 1.5rem',
                          background: uploadingFile ? 'var(--gray-200)' : 'var(--white)',
                          border: '2px dashed var(--gold)',
                          borderRadius: '0.5rem',
                          cursor: uploadingFile ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          fontWeight: 500,
                          color: 'var(--gray-700)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {uploadingFile ? 'Mengupload...' : '📁 Pilih File Gambar (Max 5MB)'}
                      </label>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                      Format: JPG, PNG, WEBP • Ukuran maksimal: 5MB
                    </p>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--gray-200)',
                    paddingTop: '1.5rem',
                    marginTop: '1.5rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem', fontWeight: 600 }}>
                      🔗 Atau Gunakan URL Gambar
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                      Gunakan URL dari Pexels.com atau Google Drive:<br/>
                      • Pexels: https://images.pexels.com/photos/123456/...<br/>
                      • Google Drive: https://drive.google.com/uc?export=view&id=FILE_ID
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.pexels.com/photos/... atau Google Drive link"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="btn-primary"
                        style={{ padding: '0.875rem 1.5rem' }}
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="image-preview-grid">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={convertPexelsUrl(url)} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="image-remove"
                            onClick={() => handleRemoveImage(index)}
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '0.5rem',
                                left: '0.5rem',
                                background: 'var(--gold)',
                                color: 'var(--black)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              Utama
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCloseModal}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminKostum
