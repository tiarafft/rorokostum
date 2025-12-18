import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/DetailKostum.css'

const DetailKostum = () => {
  const { id } = useParams()
  const [kostum, setKostum] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKostum()
    fetchWhatsAppNumber()
  }, [id])

  const convertPexelsUrl = (url) => {
    if (!url) return 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=800'

    if (url.includes('supabase.co') || url.includes('drive.google.com')) {
      return url
    }

    if (url.includes('images.pexels.com')) {
      return url
    }

    const photoIdMatch = url.match(/\/photo\/(\d+)/)
    if (photoIdMatch) {
      const photoId = photoIdMatch[1]
      return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800`
    }

    return url
  }

  const fetchKostum = async () => {
    const { data } = await supabase
      .from('kostum')
      .select('*, kategori(*), gambar_kostum(*)')
      .eq('id', id)
      .maybeSingle()

    if (data) {
      setKostum(data)
      const primaryImage = data.gambar_kostum?.find(img => img.is_primary)
      const imagePath = primaryImage?.path || data.gambar_kostum?.[0]?.path
      setSelectedImage(convertPexelsUrl(imagePath))
    }
    setLoading(false)
  }

  const fetchWhatsAppNumber = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .maybeSingle()

    if (data) {
      setWhatsappNumber(data.value)
    }
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Halo, saya ingin menanyakan ketersediaan dan harga untuk kostum:\n\nNama: ${kostum.nama}\nHarga: Rp ${kostum.harga_sewa.toLocaleString('id-ID')} / 3 hari`
    )
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    )
  }

  if (!kostum) {
    return (
      <div className="not-found">
        <h2>Kostum tidak ditemukan</h2>
        <Link to="/gallery" className="btn-primary">Kembali ke Gallery</Link>
      </div>
    )
  }

  return (
    <div className="detail-kostum">
      <div className="container">
        <Link to="/gallery" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Kembali ke Gallery
        </Link>

        <div className="detail-content">
          <div className="detail-gallery">
            <div className="main-image">
              <img src={selectedImage} alt={kostum.nama} />
            </div>
            {kostum.gambar_kostum && kostum.gambar_kostum.length > 1 && (
              <div className="thumbnail-list">
                {kostum.gambar_kostum.map((image, index) => {
                  const convertedUrl = convertPexelsUrl(image.path)
                  return (
                    <button
                      key={image.id}
                      className={`thumbnail ${selectedImage === convertedUrl ? 'active' : ''}`}
                      onClick={() => setSelectedImage(convertedUrl)}
                    >
                      <img src={convertedUrl} alt={`${kostum.nama} ${index + 1}`} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="detail-info">
            {kostum.kategori && (
              <span className="detail-category">{kostum.kategori.nama}</span>
            )}
            <h1>{kostum.nama}</h1>

            <div className="detail-price">
              <span className="price-label">Harga Sewa</span>
              <span className="price-value">
                Rp {kostum.harga_sewa.toLocaleString('id-ID')}
                <span className="price-period"> / 3 hari</span>
              </span>
            </div>

            <div className="detail-status">
              <span className="status-label">Status:</span>
              {kostum.status_ketersediaan === 'tersedia' ? (
                <span className="status-available">✓ Tersedia</span>
              ) : (
                <span className="status-rented">✗ Sedang Disewa</span>
              )}
            </div>

            <div className="detail-sizes">
              <h3>Ukuran Tersedia</h3>
              <p>{kostum.ukuran_tersedia || 'Silakan tanyakan ke admin'}</p>
            </div>

            {kostum.deskripsi && (
              <div className="detail-description">
                <h3>Deskripsi</h3>
                <p>{kostum.deskripsi}</p>
              </div>
            )}

            <button
              className="btn-primary btn-whatsapp"
              onClick={handleWhatsAppClick}
              disabled={!whatsappNumber}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Cek ketersediaan dan harga
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailKostum
