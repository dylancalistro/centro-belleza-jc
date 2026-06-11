import { useState, useEffect } from 'react'
import {
  getTrabajadoras, getServicios, getReservas, getBloqueados,
  saveReservas, getConfig, genId
} from '../utils/storage'
import {
  formatFechaLarga, formatMonto, formatDuracion,
  getHorariosDisponibles, iniciales, hoy
} from '../utils/helpers'

const STEPS = ['Trabajadora', 'Servicio', 'Fecha y hora', 'Tus datos', 'Confirmar']

function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => (
        <div key={i} className="step-item">
          <div className={`step-circle ${i < current ? 'done' : i === current ? 'active' : 'pending'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line ${i < current ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ReservarPage({ navigate }) {
  const [step, setStep] = useState(0)
  const [trabajadoras, setTrabajadoras] = useState([])
  const [servicios, setServicios] = useState([])
  const [reservas, setReservas] = useState([])
  const [bloqueados, setBloqueados] = useState([])
  const [config, setConfig] = useState({})

  const [sel, setSel] = useState({
    trabajadora: null,
    servicio: null,
    fecha: hoy(),
    hora: null,
    nombre: '',
    telefono: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setTrabajadoras(getTrabajadoras().filter(t => t.activa))
    setServicios(getServicios())
    setReservas(getReservas())
    setBloqueados(getBloqueados())
    setConfig(getConfig())
  }, [])

  const set = (key, val) => setSel(prev => ({ ...prev, [key]: val }))

  const slots = sel.trabajadora && sel.fecha
    ? getHorariosDisponibles(sel.trabajadora.id, sel.fecha, reservas, bloqueados)
    : []

  const canNext = () => {
    if (step === 0) return !!sel.trabajadora
    if (step === 1) return !!sel.servicio
    if (step === 2) return !!sel.hora
    if (step === 3) {
      const e = {}
      if (!sel.nombre.trim()) e.nombre = 'Ingresá tu nombre'
      if (sel.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Ingresá un teléfono válido'
      setErrors(e)
      return Object.keys(e).length === 0
    }
    return true
  }

  const next = () => { if (canNext()) setStep(s => s + 1) }
  const back = () => { if (step > 0) setStep(s => s - 1) }

  const confirmar = () => {
    const nueva = {
      id: genId(),
      trabajadoraId: sel.trabajadora.id,
      trabajadoraNombre: sel.trabajadora.nombre,
      servicioId: sel.servicio.id,
      servicioNombre: sel.servicio.nombre,
      fecha: sel.fecha,
      hora: sel.hora,
      clienteNombre: sel.nombre.trim(),
      clienteTel: sel.telefono.trim(),
      estado: 'pendiente',
      aliasMP: sel.trabajadora.alias_mp,
      sena: config.senaFija || 10000,
      fechaCreacion: new Date().toISOString(),
    }
    const updated = [...getReservas(), nueva]
    saveReservas(updated)
    navigate('confirmacion', nueva)
  }

  const Header = () => (
    <div style={{ background: 'var(--primary)', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => step === 0 ? navigate('landing') : back()}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}
        >
          ←
        </button>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Reservar turno</div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12 }}>
            Paso {step + 1} de {STEPS.length}: {STEPS[step]}
          </div>
        </div>
      </div>
      <Stepper current={step} />
    </div>
  )

  // ── Step 0: Trabajadora ──
  if (step === 0) return (
    <div>
      <Header />
      <div className="section-sm">
        <div className="section-heading">¿Con quién querés venir?</div>
        <div className="worker-grid">
          {trabajadoras.map(w => (
            <div
              key={w.id}
              className={`worker-card ${sel.trabajadora?.id === w.id ? 'selected' : ''}`}
              onClick={() => set('trabajadora', w)}
            >
              <div className="worker-avatar">
                {w.foto ? <img src={w.foto} alt={w.nombre} /> : iniciales(w.nombre)}
              </div>
              <div className="worker-name">{w.nombre}</div>
              {w.bio && <div className="worker-bio">{w.bio}</div>}
            </div>
          ))}
        </div>
        <div className="mt-24">
          <button className="btn btn-primary btn-full" onClick={next} disabled={!sel.trabajadora}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 1: Servicio ──
  if (step === 1) return (
    <div>
      <Header />
      <div className="section-sm">
        <div className="section-heading">¿Qué servicio querés?</div>
        <div className="service-list">
          {servicios.map(s => (
            <div
              key={s.id}
              className={`service-card ${sel.servicio?.id === s.id ? 'selected' : ''}`}
              onClick={() => set('servicio', s)}
            >
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
        <div className="mt-24">
          <button className="btn btn-primary btn-full" onClick={next} disabled={!sel.servicio}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Fecha y hora ──
  if (step === 2) return (
    <div>
      <Header />
      <div className="section-sm">
        <div className="section-heading">Elegí el día y horario</div>

        <div className="field">
          <label>Día</label>
          <input
            type="date"
            value={sel.fecha}
            min={hoy()}
            onChange={e => { set('fecha', e.target.value); set('hora', null) }}
          />
        </div>

        {sel.fecha && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              {formatFechaLarga(sel.fecha)} · {sel.trabajadora?.nombre}
            </div>
            <div className="section-title">Horarios disponibles</div>
            <div className="slot-grid">
              {slots.map(({ hora, disponible }) => (
                <button
                  key={hora}
                  className={`slot-btn ${!disponible ? 'taken' : sel.hora === hora ? 'selected' : ''}`}
                  disabled={!disponible}
                  onClick={() => disponible && set('hora', hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
            {slots.every(s => !s.disponible) && (
              <div className="alert alert-warning mt-16">
                No hay horarios disponibles este día. Probá con otro día.
              </div>
            )}
          </>
        )}

        <div className="mt-24">
          <button className="btn btn-primary btn-full" onClick={next} disabled={!sel.hora}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 3: Datos del cliente ──
  if (step === 3) return (
    <div>
      <Header />
      <div className="section-sm">
        <div className="section-heading">Tus datos</div>

        <div className="field">
          <label>Nombre y apellido</label>
          <input
            type="text"
            value={sel.nombre}
            onChange={e => set('nombre', e.target.value)}
            placeholder="Ej: María González"
          />
          {errors.nombre && <div className="field-error">{errors.nombre}</div>}
        </div>

        <div className="field">
          <label>WhatsApp (para el recordatorio)</label>
          <input
            type="tel"
            value={sel.telefono}
            onChange={e => set('telefono', e.target.value)}
            placeholder="Ej: 1155443322"
            inputMode="tel"
          />
          {errors.telefono && <div className="field-error">{errors.telefono}</div>}
        </div>

        <div className="alert alert-info mt-12" style={{ fontSize: 13 }}>
          📱 Te vamos a enviar un recordatorio por WhatsApp 24 horas antes de tu turno
        </div>

        <div className="mt-24">
          <button className="btn btn-primary btn-full" onClick={next}>
            Ver resumen
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 4: Confirmar ──
  return (
    <div>
      <Header />
      <div className="section-sm">
        <div className="section-heading">Confirmá tu reserva</div>

        {/* Resumen */}
        <div className="summary-box">
          <div className="summary-row">
            <span className="summary-row-label">Trabajadora</span>
            <span className="summary-row-value">{sel.trabajadora?.nombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Servicio</span>
            <span className="summary-row-value">{sel.servicio?.nombre}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Día</span>
            <span className="summary-row-value" style={{ textTransform: 'capitalize' }}>
              {formatFechaLarga(sel.fecha)}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Horario</span>
            <span className="summary-row-value">{sel.hora} hs</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Tu nombre</span>
            <span className="summary-row-value">{sel.nombre}</span>
          </div>
          <div className="summary-total">
            <div className="summary-row">
              <span className="summary-row-label">Valor del servicio</span>
              <span className="summary-row-value">{formatMonto(sel.servicio?.precio)}</span>
            </div>
          </div>
        </div>

        {/* Seña MP */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>
            Para confirmar tu turno, abonás una seña de:
          </div>
          <div className="mp-box">
            <div className="mp-label">MercadoPago · Alias</div>
            <div className="mp-alias">{sel.trabajadora?.alias_mp || 'Alias no configurado'}</div>
            <div className="mp-amount">Seña: <strong>{formatMonto(config.senaFija || 10000)}</strong></div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Después de pagar, mandá el comprobante por WhatsApp para confirmar el turno
          </div>
          {config.whatsappSalon && (
            <a
              href={`https://wa.me/${config.whatsappSalon}?text=${encodeURIComponent(`Hola! Hice una reserva para ${sel.nombre} el ${formatFechaLarga(sel.fecha)} a las ${sel.hora} con ${sel.trabajadora?.nombre}. Te mando el comprobante de la seña.`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-full mt-12"
              style={{ background: '#25d366', color: '#fff', display: 'block', textDecoration: 'none' }}
            >
              💬 Enviar comprobante por WhatsApp
            </a>
          )}
        </div>

        <div style={{ height: 16 }} />
        <button className="btn btn-primary btn-full" onClick={confirmar}>
          ✅ Confirmar reserva
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
          Tu turno queda en estado "pendiente" hasta que confirmemos el pago
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
