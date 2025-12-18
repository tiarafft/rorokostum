import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/Home.css'

const Home = () => {
  const [featuredKostum, setFeaturedKostum] = useState([])

  useEffect(() => {
    fetchFeaturedKostum()
  }, [])

  const fetchFeaturedKostum = async () => {
    const { data: kostumData } = await supabase
      .from('kostum')
      .select('*, gambar_kostum(*)')
      .eq('status_ketersediaan', 'tersedia')
      .limit(6)

    if (kostumData) {
      setFeaturedKostum(kostumData)
    }
  }

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

  const getPrimaryImage = (kostum) => {
    const primaryImage = kostum.gambar_kostum?.find(img => img.is_primary)
    const imagePath = primaryImage?.path || kostum.gambar_kostum?.[0]?.path
    return convertPexelsUrl(imagePath)
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Kalau Bisa Sewa, Buat Apa Beli</h1>
          <p className="hero-subtitle">
            Kostum berkualitas premium untuk setiap momen spesial Anda
          </p>
          <Link to="/gallery" className="btn-primary">
            Lihat Koleksi Kami
          </Link>
        </div>
      </section>

      <section className="section usp-section">
        <div className="container">
          <h2 className="section-title">Kenapa Memilih Roro Kostum?</h2>
          <div className="usp-grid">
            <div className="usp-card">
              <div className="usp-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>Koleksi Terlengkap</h3>
              <p>Ratusan pilihan kostum dari berbagai tema dan karakter untuk semua acara Anda</p>
            </div>

            <div className="usp-card">
              <div className="usp-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3>Harga Terjangkau</h3>
              <p>Sistem sewa 3 hari dengan harga kompetitif dan proses pembayaran yang mudah</p>
            </div>

            <div className="usp-card">
              <div className="usp-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2v14H3v3c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V2l-1.5 1.5zM15 20H6c-.55 0-1-.45-1-1v-1h10v2zm4-1c0 .55-.45 1-1 1s-1-.45-1-1v-3H8V5h11v14z" />
                </svg>
              </div>
              <h3>Kebersihan Terjamin</h3>
              <p>Semua kostum dicuci dan dirawat dengan standar profesional sebelum disewakan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title">Kostum Pilihan</h2>
          <p className="section-subtitle">Lihat beberapa kostum populer dari koleksi kami</p>

          {featuredKostum.length > 0 ? (
            <div className="featured-grid">
              {featuredKostum.map((kostum) => (
                <Link
                  key={kostum.id}
                  to={`/kostum/${kostum.id}`}
                  className="featured-card"
                >
                  <div className="featured-image">
                    <img src={getPrimaryImage(kostum)} alt={kostum.nama} />
                  </div>
                  <div className="featured-info">
                    <h3>{kostum.nama}</h3>
                    <p className="featured-price">
                      Rp {kostum.harga_sewa.toLocaleString('id-ID')} / 3 hari
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>
              Belum ada kostum tersedia
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/gallery" className="btn-secondary">
              Lihat Semua Kostum
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
