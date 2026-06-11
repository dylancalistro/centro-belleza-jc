import { useState, useEffect } from 'react'
import { getTrabajadoras, getServicios, getConfig } from '../utils/storage'
import { formatMonto, formatDuracion, iniciales } from '../utils/helpers'

export default function LandingPage({ navigate }) {
  const [trabajadoras, setTrabajadoras] = useState([])
  const [servicios, setServicios] = useState([])
  const [config, setConfig] = useState({})

  useEffect(() => {
    setTrabajadoras(getTrabajadoras().filter(t => t.activa))
    setServicios(getServicios())
    setConfig(getConfig())
  }, [])

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          {config.nombreSalon || 'Centro de Belleza JC'}
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('admin')}
        >
          Admin
        </button>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-tag">💅 Reservá tu turno online</div>
        <h1>{config.nombreSalon || 'Centro de Belleza JC'}</h1>
        <p>Elegí tu trabajadora, el servicio y el horario que mejor te quede</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('reservar')}
        >
          Reservar turno
        </button>
      </div>

      {/* Trabajadoras */}
      {trabajadoras.length > 0 && (
        <div className="section">
          <div className="section-title">Nuestro equipo</div>
          <div className="worker-grid">
            {trabajadoras.map(w => (
              <div key={w.id} className="worker-card" onClick={() => navigate('reservar')}>
                <div className="worker-avatar">
                  {w.foto
                    ? <img src={w.foto} alt={w.nombre} />
                    : iniciales(w.nombre)
                  }
                </div>
                <div className="worker-name">{w.nombre}</div>
                {w.bio && <div className="worker-bio">{w.bio}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />

      {/* Servicios */}
      {servicios.length > 0 && (
        <div className="section">
          <div className="section-title">Nuestros servicios</div>
          <div className="service-list">
            {servicios.map(s => (
              <div key={s.id} className="service-card" style={{ cursor: 'default' }}>
                <div className="service-info">
                  <div className="service-name">{s.nombre}</div>
                  {s.descripcion && <div className="service-desc">{s.descripcion}</div>}
                  <div className="service-meta">
                    <span className="service-duration">⏱ {formatDuracion(s.duracion)}</span>
                  </div>
                </div>
                <div className="service-price">{formatMonto(s.precio)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('reservar')}
            >
              Reservar ahora
            </button>
          </div>
        </div>
      )}

      {/* Info seña */}
      <div style={{ background: 'var(--primary-light)', padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--primary-dark)', fontWeight: 600, maxWidth: 400, margin: '0 auto' }}>
          💳 Para confirmar tu turno se requiere una seña de <strong>{formatMonto(getConfig().senaFija || 10000)}</strong> vía MercadoPago
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div style={{ fontSize: 18, fontWeight: 800 }}>{config.nombreSalon || 'Centro de Belleza JC'}</div>
        <p>Tu belleza, nuestra pasión</p>
        {config.whatsappSalon && (
          <a
            href={`https://wa.me/${config.whatsappSalon}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#a8d5a2', display: 'inline-block', marginTop: 12, fontSize: 14 }}
          >
            💬 Contactanos por WhatsApp
          </a>
        )}
      </footer>
    </div>
  )
}
