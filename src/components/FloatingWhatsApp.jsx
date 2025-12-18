import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/FloatingWhatsApp.css'

const FloatingWhatsApp = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    fetchWhatsAppNumber()
  }, [])

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

  const handleClick = () => {
    const message = encodeURIComponent('Halo, saya ingin menanyakan ketersediaan dan harga kostum.')
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  if (!whatsappNumber) return null

  return (
    <button className="floating-whatsapp" onClick={handleClick} aria-label="Chat WhatsApp">
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
      >
        <path d="M16 0C7.164 0 0 7.164 0 16c0 2.832.748 5.49 2.048 7.792L.096 30.592l7.136-1.872A15.936 15.936 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.376c-2.544 0-4.94-.708-6.976-1.936l-.5-.296-5.184 1.36 1.384-5.056-.324-.52A13.312 13.312 0 012.624 16c0-7.364 5.988-13.352 13.352-13.352S29.328 8.636 29.328 16 23.34 29.376 16 29.376z" />
        <path d="M23.28 19.456c-.384-.192-2.268-1.12-2.62-1.248-.352-.128-.608-.192-.864.192-.256.384-.992 1.248-1.216 1.504-.224.256-.448.288-.832.096-.384-.192-1.62-.596-3.084-1.904-1.14-.992-1.908-2.216-2.132-2.6-.224-.384-.024-.592.168-.784.172-.172.384-.448.576-.672.192-.224.256-.384.384-.64.128-.256.064-.48-.032-.672-.096-.192-.864-2.08-1.184-2.848-.312-.752-.628-.648-.864-.66-.224-.012-.48-.016-.736-.016s-.672.096-1.024.48c-.352.384-1.344 1.312-1.344 3.2s1.376 3.712 1.568 3.968c.192.256 2.708 4.136 6.564 5.804.916.396 1.632.632 2.188.808.92.292 1.756.252 2.416.152.736-.108 2.268-.928 2.588-1.824.32-.896.32-1.664.224-1.824-.096-.16-.352-.256-.736-.448z" />
      </svg>
      <span className="floating-whatsapp-text">Cek ketersediaan dan harga</span>
    </button>
  )
}

export default FloatingWhatsApp
