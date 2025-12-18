import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return null
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/tracking', label: 'Tracking Order' },
    { path: '/prosedur-sewa', label: 'Prosedur Sewa' },
    { path: '/company-profile', label: 'Company Profile' },
  ]

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <img src="../dist/logo.png" alt="Roro Kostum Logo" className="logo-image" />
            <span className="logo-text">S</span>
            <span className="logo-subtitle">Production</span>
          </Link>

          <button
            className={`navbar-toggle ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
