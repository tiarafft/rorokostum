import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/AdminOrders.css'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [kostums, setKostums] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama_penyewa: '',
    no_hp: '',
    kostum_id: '',
    kuantitas: '1',
    tanggal_sewa: '',
    tanggal_kembali_rencana: '',
    tanggal_kembali_aktual: '',
    harga_sewa: '',
    denda: '0',
    status: 'aktif',
    catatan: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchOrders()
    fetchKostums()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchKostums = async () => {
    const { data } = await supabase
      .from('kostum')
      .select('id, nama, harga_sewa, kuantitas_tersedia')
      .order('nama')

    if (data) {
      setKostums(data)
    }
  }

  const fetchOrders = async () => {
    let query = supabase
      .from('orders')
      .select('*, kostum(*)')
      .order('created_at', { ascending: false })

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data } = await query

    if (data) {
      setOrders(data)
    }
  }

  const generateOrderCode = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `ORD${year}${month}${random}`
  }

  const calculateTotal = (hargaSewa, denda) => {
    return parseFloat(hargaSewa || 0) + parseFloat(denda || 0)
  }

  const calculateDenda = (tanggalKembaliRencana, tanggalKembaliAktual, hargaSewa) => {
    if (!tanggalKembaliAktual || !tanggalKembaliRencana) return 0

    const rencana = new Date(tanggalKembaliRencana)
    const aktual = new Date(tanggalKembaliAktual)
    const hariTerlambat = Math.floor((aktual - rencana) / (1000 * 60 * 60 * 24))

    if (hariTerlambat <= 0) return 0

    const dendaPerHari = parseFloat(hargaSewa) * 0.1
    return hariTerlambat * dendaPerHari
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const denda = calculateDenda(
        formData.tanggal_kembali_rencana,
        formData.tanggal_kembali_aktual,
        formData.harga_sewa
      )

      const kuantitas = parseInt(formData.kuantitas) || 1

      const orderData = {
        nama_penyewa: formData.nama_penyewa,
        no_hp: formData.no_hp,
        kostum_id: formData.kostum_id,
        kuantitas: kuantitas,
        tanggal_sewa: formData.tanggal_sewa,
        tanggal_kembali_rencana: formData.tanggal_kembali_rencana,
        tanggal_kembali_aktual: formData.tanggal_kembali_aktual || null,
        harga_sewa: parseFloat(formData.harga_sewa),
        denda: denda,
        total_bayar: calculateTotal(formData.harga_sewa, denda),
        status: formData.status,
        catatan: formData.catatan,
        updated_at: new Date().toISOString()
      }

      if (!editingId) {
        orderData.kode_order = generateOrderCode()
      }

      const { data: kostumData } = await supabase
        .from('kostum')
        .select('kuantitas_tersedia, kuantitas_total')
        .eq('id', formData.kostum_id)
        .maybeSingle()

      if (editingId) {
        const { data: oldOrder } = await supabase
          .from('orders')
          .select('status, kuantitas')
          .eq('id', editingId)
          .maybeSingle()

        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', editingId)

        if (error) throw error

        if (kostumData && oldOrder) {
          let kuantitasBaru = kostumData.kuantitas_tersedia

          if (oldOrder.status === 'aktif' && orderData.status === 'selesai') {
            kuantitasBaru = Math.min(kostumData.kuantitas_tersedia + oldOrder.kuantitas, kostumData.kuantitas_total)
          } else if (oldOrder.status === 'selesai' && orderData.status === 'aktif') {
            kuantitasBaru = Math.max(kostumData.kuantitas_tersedia - kuantitas, 0)
          } else if (oldOrder.status === 'aktif' && orderData.status === 'aktif' && oldOrder.kuantitas !== kuantitas) {
            const selisih = kuantitas - oldOrder.kuantitas
            kuantitasBaru = Math.max(0, Math.min(kostumData.kuantitas_tersedia - selisih, kostumData.kuantitas_total))
          }

          await supabase
            .from('kostum')
            .update({
              kuantitas_tersedia: kuantitasBaru,
              status_ketersediaan: kuantitasBaru > 0 ? 'tersedia' : 'disewa'
            })
            .eq('id', formData.kostum_id)
        }

        setMessage({ type: 'success', text: 'Order berhasil diupdate' })
      } else {
        if (kostumData && kuantitas > kostumData.kuantitas_tersedia) {
          throw new Error(`Kuantitas melebihi stok tersedia. Tersedia: ${kostumData.kuantitas_tersedia}`)
        }

        const { error } = await supabase
          .from('orders')
          .insert([orderData])

        if (error) throw error

        if (kostumData && orderData.status === 'aktif') {
          const kuantitasBaru = Math.max(kostumData.kuantitas_tersedia - kuantitas, 0)
          await supabase
            .from('kostum')
            .update({
              kuantitas_tersedia: kuantitasBaru,
              status_ketersediaan: kuantitasBaru > 0 ? 'tersedia' : 'disewa'
            })
            .eq('id', formData.kostum_id)
        }

        setMessage({ type: 'success', text: 'Order berhasil ditambahkan' })
      }

      fetchOrders()
      handleCancelForm()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (order) => {
    setEditingId(order.id)
    setFormData({
      nama_penyewa: order.nama_penyewa,
      no_hp: order.no_hp,
      kostum_id: order.kostum_id,
      kuantitas: order.kuantitas?.toString() || '1',
      tanggal_sewa: order.tanggal_sewa,
      tanggal_kembali_rencana: order.tanggal_kembali_rencana,
      tanggal_kembali_aktual: order.tanggal_kembali_aktual || '',
      harga_sewa: order.harga_sewa.toString(),
      denda: order.denda.toString(),
      status: order.status,
      catatan: order.catatan || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus order ini?')) return

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Order berhasil dihapus' })
      fetchOrders()
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nama_penyewa: '',
      no_hp: '',
      kostum_id: '',
      kuantitas: '1',
      tanggal_sewa: '',
      tanggal_kembali_rencana: '',
      tanggal_kembali_aktual: '',
      harga_sewa: '',
      denda: '0',
      status: 'aktif',
      catatan: ''
    })
  }

  const handleKostumChange = (e) => {
    const kostumId = e.target.value
    const kostum = kostums.find(k => k.id === kostumId)
    setFormData({
      ...formData,
      kostum_id: kostumId,
      harga_sewa: kostum ? kostum.harga_sewa.toString() : ''
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      aktif: { bg: '#dbeafe', color: '#1e40af' },
      selesai: { bg: '#dcfce7', color: '#166534' },
      terlambat: { bg: '#fee2e2', color: '#991b1b' },
      dibatalkan: { bg: '#f3f4f6', color: '#374151' }
    }
    const style = styles[status] || styles.aktif
    return (
      <span style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '50px',
        fontSize: '0.875rem',
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`
  }

  return (
    <AdminLayout>
      <div className="orders-page">
        <div className="page-header-admin">
          <div>
            <h1>Manajemen Sewa</h1>
            <p>Kelola pesanan sewa kostum</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm)
              if (showForm) handleCancelForm()
            }}
          >
            {showForm ? 'Tutup Form' : '+ Tambah Pesanan'}
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <div className="order-form-container">
            <h2>{editingId ? 'Edit Pesanan' : 'Tambah Pesanan Baru'}</h2>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nama_penyewa">Nama Penyewa *</label>
                  <input
                    id="nama_penyewa"
                    type="text"
                    value={formData.nama_penyewa}
                    onChange={(e) => setFormData({ ...formData, nama_penyewa: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="no_hp">No. HP *</label>
                  <input
                    id="no_hp"
                    type="tel"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="kostum_id">Kostum *</label>
                  <select
                    id="kostum_id"
                    value={formData.kostum_id}
                    onChange={handleKostumChange}
                    required
                  >
                    <option value="">Pilih Kostum</option>
                    {kostums.map((kostum) => (
                      <option key={kostum.id} value={kostum.id}>
                        {kostum.nama} - {formatCurrency(kostum.harga_sewa)} (Tersedia: {kostum.kuantitas_tersedia || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="kuantitas">Kuantitas *</label>
                  <input
                    id="kuantitas"
                    type="number"
                    value={formData.kuantitas}
                    onChange={(e) => setFormData({ ...formData, kuantitas: e.target.value })}
                    required
                    min="1"
                    max={formData.kostum_id ? kostums.find(k => k.id === formData.kostum_id)?.kuantitas_tersedia || 1 : 1}
                  />
                  {formData.kostum_id && (
                    <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                      Tersedia: {kostums.find(k => k.id === formData.kostum_id)?.kuantitas_tersedia || 0}
                    </small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="harga_sewa">Harga Sewa *</label>
                  <input
                    id="harga_sewa"
                    type="number"
                    value={formData.harga_sewa}
                    onChange={(e) => setFormData({ ...formData, harga_sewa: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tanggal_sewa">Tanggal Sewa *</label>
                  <input
                    id="tanggal_sewa"
                    type="date"
                    value={formData.tanggal_sewa}
                    onChange={(e) => setFormData({ ...formData, tanggal_sewa: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tanggal_kembali_rencana">Tanggal Kembali (Rencana) *</label>
                  <input
                    id="tanggal_kembali_rencana"
                    type="date"
                    value={formData.tanggal_kembali_rencana}
                    onChange={(e) => setFormData({ ...formData, tanggal_kembali_rencana: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tanggal_kembali_aktual">Tanggal Kembali (Aktual)</label>
                  <input
                    id="tanggal_kembali_aktual"
                    type="date"
                    value={formData.tanggal_kembali_aktual}
                    onChange={(e) => {
                      const aktual = e.target.value
                      const denda = calculateDenda(
                        formData.tanggal_kembali_rencana,
                        aktual,
                        formData.harga_sewa
                      )
                      setFormData({
                        ...formData,
                        tanggal_kembali_aktual: aktual,
                        denda: denda.toString()
                      })
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="denda">Denda</label>
                  <input
                    id="denda"
                    type="number"
                    value={formData.denda}
                    onChange={(e) => setFormData({ ...formData, denda: e.target.value })}
                    min="0"
                    readOnly
                  />
                  <small style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                    Denda dihitung otomatis 10% per hari keterlambatan
                  </small>
                </div>

                <div className="form-group">
                  <label>Total Bayar</label>
                  <input
                    type="text"
                    value={formatCurrency(calculateTotal(formData.harga_sewa, formData.denda))}
                    readOnly
                    style={{ fontWeight: 600, color: 'var(--gold)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="catatan">Catatan</label>
                <textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="3"
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelForm}
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
        )}

        <div className="orders-content">
          <div className="filter-tabs">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              Semua
            </button>
            <button
              className={filterStatus === 'aktif' ? 'active' : ''}
              onClick={() => setFilterStatus('aktif')}
            >
              Aktif
            </button>
            <button
              className={filterStatus === 'terlambat' ? 'active' : ''}
              onClick={() => setFilterStatus('terlambat')}
            >
              Terlambat
            </button>
            <button
              className={filterStatus === 'selesai' ? 'active' : ''}
              onClick={() => setFilterStatus('selesai')}
            >
              Selesai
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Order</th>
                  <th>Penyewa</th>
                  <th>Kostum</th>
                  <th>Qty</th>
                  <th>Tanggal Sewa</th>
                  <th>Kembali (Rencana)</th>
                  <th>Kembali (Aktual)</th>
                  <th>Harga</th>
                  <th>Denda</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>
                        {order.kode_order}
                      </td>
                      <td>
                        <div>{order.nama_penyewa}</div>
                        <small style={{ color: 'var(--gray-600)' }}>{order.no_hp}</small>
                      </td>
                      <td>{order.kostum?.nama || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--gold)' }}>
                        {order.kuantitas || 1}
                      </td>
                      <td>{formatDate(order.tanggal_sewa)}</td>
                      <td>{formatDate(order.tanggal_kembali_rencana)}</td>
                      <td>{formatDate(order.tanggal_kembali_aktual)}</td>
                      <td>{formatCurrency(order.harga_sewa)}</td>
                      <td style={{ color: order.denda > 0 ? '#dc2626' : 'inherit' }}>
                        {formatCurrency(order.denda)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(order.total_bayar)}
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(order)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(order.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center' }}>
                      Belum ada pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminOrders
