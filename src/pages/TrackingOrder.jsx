import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/TrackingOrder.css'

const TrackingOrder = () => {
  const [kodeOrder, setKodeOrder] = useState('')
  const [noHp, setNoHp] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*, kostum(*)')
        .eq('kode_order', kodeOrder.toUpperCase())
        .eq('no_hp', noHp)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        setError('Pesanan tidak ditemukan. Pastikan kode order dan nomor HP sudah benar.')
      } else {
        setOrder(data)
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`
  }

  const getStatusInfo = (status) => {
    const statusInfo = {
      aktif: {
        label: 'Aktif',
        color: '#1e40af',
        bg: '#dbeafe',
        icon: '🔄',
        description: 'Pesanan Anda sedang aktif. Silakan kembalikan kostum sesuai jadwal.'
      },
      selesai: {
        label: 'Selesai',
        color: '#166534',
        bg: '#dcfce7',
        icon: '✓',
        description: 'Pesanan Anda telah selesai. Terima kasih telah menyewa di Roro Kostum!'
      },
      terlambat: {
        label: 'Terlambat',
        color: '#991b1b',
        bg: '#fee2e2',
        icon: '⚠',
        description: 'Pengembalian kostum terlambat. Silakan segera kembalikan untuk menghindari denda lebih lanjut.'
      },
      dibatalkan: {
        label: 'Dibatalkan',
        color: '#374151',
        bg: '#f3f4f6',
        icon: '✗',
        description: 'Pesanan ini telah dibatalkan.'
      }
    }
    return statusInfo[status] || statusInfo.aktif
  }

  const calculateDaysRemaining = (tanggalKembaliRencana, tanggalKembaliAktual) => {
    if (tanggalKembaliAktual) return null

    const today = new Date()
    const returnDate = new Date(tanggalKembaliRencana)
    const diffTime = returnDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <div className="container">
          <h1>Tracking Pesanan</h1>
          <p>Lacak status pesanan sewa kostum Anda</p>
        </div>
      </div>

      <div className="tracking-content">
        <div className="container">
          <div className="tracking-search-card">
            <h2>Masukkan Data Pesanan</h2>
            <form onSubmit={handleSubmit} className="tracking-form">
              <div className="form-group">
                <label htmlFor="kodeOrder">Kode Pesanan</label>
                <input
                  id="kodeOrder"
                  type="text"
                  value={kodeOrder}
                  onChange={(e) => setKodeOrder(e.target.value.toUpperCase())}
                  placeholder="Contoh: ORD240112345"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="noHp">Nomor HP</label>
                <input
                  id="noHp"
                  type="tel"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="08123456789"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Mencari...' : 'Lacak Pesanan'}
              </button>
            </form>

            {error && (
              <div className="tracking-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {order && (
            <div className="tracking-result">
              <div className="status-banner" style={{ background: getStatusInfo(order.status).bg }}>
                <div className="status-icon">{getStatusInfo(order.status).icon}</div>
                <div>
                  <h3 style={{ color: getStatusInfo(order.status).color }}>
                    {getStatusInfo(order.status).label}
                  </h3>
                  <p>{getStatusInfo(order.status).description}</p>
                </div>
              </div>

              <div className="order-details">
                <div className="detail-section">
                  <h3>Informasi Pesanan</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Kode Pesanan</span>
                      <span className="detail-value code">{order.kode_order}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Nama Penyewa</span>
                      <span className="detail-value">{order.nama_penyewa}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kostum</span>
                      <span className="detail-value">{order.kostum?.nama || '-'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kuantitas</span>
                      <span className="detail-value" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                        {order.kuantitas || 1} unit
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span
                        className="detail-value"
                        style={{
                          color: getStatusInfo(order.status).color,
                          fontWeight: 600
                        }}
                      >
                        {getStatusInfo(order.status).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Jadwal Sewa</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Sewa</span>
                      <span className="detail-value">{formatDate(order.tanggal_sewa)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Kembali (Rencana)</span>
                      <span className="detail-value">{formatDate(order.tanggal_kembali_rencana)}</span>
                    </div>
                    {order.tanggal_kembali_aktual && (
                      <div className="detail-item">
                        <span className="detail-label">Tanggal Kembali (Aktual)</span>
                        <span className="detail-value">{formatDate(order.tanggal_kembali_aktual)}</span>
                      </div>
                    )}
                    {!order.tanggal_kembali_aktual && (
                      <div className="detail-item">
                        <span className="detail-label">Sisa Waktu</span>
                        <span className="detail-value">
                          {(() => {
                            const days = calculateDaysRemaining(
                              order.tanggal_kembali_rencana,
                              order.tanggal_kembali_aktual
                            )
                            if (days === null) return '-'
                            if (days > 0) return `${days} hari lagi`
                            if (days === 0) return 'Hari ini'
                            return `Terlambat ${Math.abs(days)} hari`
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Rincian Pembayaran</h3>
                  <div className="payment-details">
                    <div className="payment-row">
                      <span>Harga Sewa</span>
                      <span>{formatCurrency(order.harga_sewa)}</span>
                    </div>
                    {order.denda > 0 && (
                      <div className="payment-row penalty">
                        <span>Denda Keterlambatan</span>
                        <span>{formatCurrency(order.denda)}</span>
                      </div>
                    )}
                    <div className="payment-row total">
                      <span>Total Pembayaran</span>
                      <span>{formatCurrency(order.total_bayar)}</span>
                    </div>
                  </div>
                </div>

                {order.catatan && (
                  <div className="detail-section">
                    <h3>Catatan</h3>
                    <p className="order-notes">{order.catatan}</p>
                  </div>
                )}
              </div>

              <div className="tracking-footer">
                <p>
                  Butuh bantuan? Hubungi kami melalui WhatsApp untuk informasi lebih lanjut.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackingOrder
