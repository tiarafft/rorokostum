import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/Gallery.css'

const Gallery = () => {
  const [kostums, setKostums] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchKostums()
  }, [])

  useEffect(() => {
    fetchKostums()
  }, [selectedCategory, searchQuery])

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
    setLoading(true)
    let query = supabase
      .from('kostum')
      .select('*, kategori(*), gambar_kostum(*)')

    if (selectedCategory !== 'all') {
      query = query.eq('kategori_id', selectedCategory)
    }

    if (searchQuery) {
      query = query.ilike('nama', `%${searchQuery}%`)
    }

    const { data } = await query.order('created_at', { ascending: false })

    if (data) {
      setKostums(data)
    }
    setLoading(false)
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
    <div className="gallery">
      <div className="gallery-header">
        <div className="container">
          <h1>Gallery Kostum</h1>
          <p>Temukan kostum impian Anda dari koleksi lengkap kami</p>
        </div>
      </div>

      <div className="gallery-content">
        <div className="container">
          <div className="gallery-filters">
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama kostum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="category-filters">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.nama}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : kostums.length > 0 ? (
            <div className="gallery-grid">
              {kostums.map((kostum) => (
                <Link
                  key={kostum.id}
                  to={`/kostum/${kostum.id}`}
                  className="gallery-card"
                >
                  <div className="gallery-card-image">
                    <img src={getPrimaryImage(kostum)} alt={kostum.nama} />
                    {kostum.status_ketersediaan === 'disewa' && (
                      <div className="status-badge rented">Disewa</div>
                    )}
                    {kostum.status_ketersediaan === 'tersedia' && (
                      <div className="status-badge available">Tersedia</div>
                    )}
                  </div>
                  <div className="gallery-card-info">
                    {kostum.kategori && (
                      <span className="gallery-card-category">{kostum.kategori.nama}</span>
                    )}
                    <h3>{kostum.nama}</h3>
                    <p className="gallery-card-price">
                      Rp {kostum.harga_sewa.toLocaleString('id-ID')} / 3 hari
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Tidak ada kostum yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Gallery
