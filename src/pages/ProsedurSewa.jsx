import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/StaticPages.css'

const ProsedurSewa = () => {
  const [content, setContent] = useState('')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'prosedur_sewa')
      .maybeSingle()

    if (data) {
      setContent(data.value)
    }
  }

  const renderContent = () => {
    if (!content) return null

    const lines = content.split('\n').filter(line => line.trim())

    return (
      <div className="procedure-list">
        {lines.map((line, index) => {
          const match = line.match(/^(\d+)\.\s*(.+)/)
          if (match) {
            return (
              <div key={index} className="procedure-item">
                <div className="procedure-number">{match[1]}</div>
                <div className="procedure-text">{match[2]}</div>
              </div>
            )
          }
          return null
        })}
      </div>
    )
  }

  return (
    <div className="static-page">
      <div className="page-header">
        <div className="container">
          <h1>Prosedur Sewa</h1>
          <p>Ketentuan dan tata cara sewa kostum di Roro Kostum</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="content-box">
            {renderContent()}
          </div>

          <div className="info-box">
            <h3>Catatan Penting</h3>
            <ul>
              <li>Pastikan Anda telah membaca dan memahami semua ketentuan sebelum menyewa</li>
              <li>Untuk pertanyaan lebih lanjut, silakan hubungi admin melalui WhatsApp</li>
              <li>Kami berhak menolak penyewaan tanpa memberikan alasan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProsedurSewa
