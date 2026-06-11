import { getConfig } from '../utils/storage'
import { formatFechaLarga, formatMonto, waLink } from '../utils/helpers'

export default function ConfirmacionPage({ navigate, reserva }) {
  if (!reserva) { navigate('landing'); return null }
  const config = getConfig()

  const msgWA = `Hola! Hice una reserva:\n👤 ${reserva.clienteNombre}\n📅 ${formatFechaLarga(reserva.fecha)} a las ${reserva.hora} hs\n💅 ${reserva.servicioNombre} con ${reserva.trabajadoraNombre}\nTe mando el comprobante de la seña de ${formatMonto(reserva.sena)}.`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          ¡Reserva registrada!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 15 }}>
          Tu turno está pendiente de confirmación. Recordá abonar la seña para asegurarlo.
        </p>

        {/* Resumen */}
        <div className="summary-box" style={{ textAlign: 'left', marginBottom: 20 }}>
          <div className="summary-row">
            <span className="summary-row-label">Trabajadora</span>
            <span className="summary-row-value">{reserva.trabajadoraNombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Servicio</span>
            <span className="summary-row-value">{reserva.servicioNombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Día</span>
            <span className="summary-row-value" style={{ textTransform: 'capitalize' }}>
              {formatFechaLarga(reserva.fecha)}
            </span>
          </div>
          <div className="summary-row" style={{ borderBottom: 'none' }}>
            <span className="summary-row-label">Horario</span>
            <span className="summary-row-value">{reserva.hora} hs</span>
          </div>
        </div>

        {/* Alias MP */}
        <div className="mp-box" style={{ marginBottom: 20 }}>
          <div className="mp-label">Pagá la seña por MercadoPago</div>
          <div className="mp-alias">{reserva.aliasMP || 'Alias no configurado'}</div>
          <div className="mp-amount">Monto: <strong>{formatMonto(reserva.sena)}</strong></div>
        </div>

        {/* WhatsApp */}
        {config.whatsappSalon && (
          <a
            href={waLink(config.whatsappSalon, msgWA)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-full"
            style={{ background: '#25d366', color: '#fff', display: 'block', textDecoration: 'none', marginBottom: 12 }}
          >
            💬 Enviar comprobante por WhatsApp
          </a>
        )}

        <button
          className="btn btn-secondary btn-full"
          onClick={() => navigate('landing')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
