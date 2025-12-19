import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/StaticPages.css'

const CompanyProfile = () => {
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    description: '',
    google_maps_embed: '',
    facebook_url: '',
    instagram_url: ''
  })

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        'company_name',
        'company_address',
        'company_description',
        'google_maps_embed',
        'facebook_url',
        'instagram_url'
      ])

    if (data) {
      const dataMap = {}
      data.forEach(item => {
        if (item.key === 'company_name') dataMap.name = item.value
        if (item.key === 'company_address') dataMap.address = item.value
        if (item.key === 'company_description') dataMap.description = item.value
        if (item.key === 'google_maps_embed') {
          // Extract src URL from iframe HTML if needed
          if (item.value && item.value.includes('<iframe')) {
            const srcMatch = item.value.match(/src="([^"]+)"/)
            dataMap.google_maps_embed = srcMatch ? srcMatch[1] : item.value
          } else {
            dataMap.google_maps_embed = item.value
          }
        }
        if (item.key === 'facebook_url') dataMap.facebook_url = item.value
        if (item.key === 'instagram_url') dataMap.instagram_url = item.value
      })
      setCompanyData(dataMap)
    }
  }

  return (
    <div className="static-page">
      <div className="page-header">
        <div className="container">
          <h1>Company Profile</h1>
          <p>Tentang Roro Kostum Entertainment</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="content-box">
            <div className="company-info">
              <div className="company-section">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <h3>Alamat</h3>
                  <p>{companyData.address || 'Loading...'}</p>
                </div>
              </div>

              <div className="company-section">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3>Tentang Kami</h3>
                  <p>{companyData.description || 'Loading...'}</p>
                </div>
              </div>

              <div className="company-section">
                <div className="icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div>
                  <h3>Visi & Misi</h3>
                  <p>
                    <strong>Visi:</strong> Menjadi penyedia layanan sewa kostum terpercaya dan terlengkap di Indonesia.
                  </p>
                  <p style={{marginTop: '1rem'}}>
                    <strong>Misi:</strong> Memberikan pengalaman sewa kostum yang mudah, terjangkau, dan berkualitas tinggi untuk setiap pelanggan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {companyData.google_maps_embed && (
            <div className="content-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '2rem 2rem 1rem' }}>
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--black)' }}>Lokasi Kami</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                  Temukan lokasi toko kami di peta
                </p>
              </div>
              <div className="map-container">
                <iframe
                  src={companyData.google_maps_embed}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Roro Kostum"
                />
              </div>
            </div>
          )}

          {(companyData.facebook_url || companyData.instagram_url) && (
            <div className="content-box">
              <h2 style={{ marginBottom: '0.5rem', color: 'var(--black)' }}>Ikuti Kami</h2>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
                Dapatkan update terbaru tentang koleksi kostum kami
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {companyData.facebook_url && (
                  <a
                    href={companyData.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.5rem',
                      background: '#1877f2',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {companyData.instagram_url && (
                  <a
                    href={companyData.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="info-box">
            <h3>Hubungi Kami</h3>
            <p>Untuk informasi lebih lanjut atau pertanyaan, jangan ragu untuk menghubungi kami melalui tombol WhatsApp yang tersedia di website.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfile
