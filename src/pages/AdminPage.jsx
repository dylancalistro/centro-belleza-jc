import { useState, useEffect } from 'react'
import {
  getConfig, saveConfig,
  getTrabajadoras, saveTrabajadoras,
  getServicios, saveServicios,
  getReservas, saveReservas,
  getBloqueados, saveBloqueados,
  genId,
} from '../utils/storage'
import { formatFechaLarga, formatMonto, formatDuracion, waLink, iniciales, hoy } from '../utils/helpers'

// ────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────
function LoginAdmin({ onLogin }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (pass === getConfig().adminPassword) onLogin()
    else { setErr('Contraseña incorrecta'); setPass('') }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--primary-light)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>💅</div>
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 8 }}>Panel de administración</div>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} autoFocus />
          </div>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-full">Entrar</button>
        </form>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Contraseña por defecto: <strong>jc2024</strong>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// TAB: TURNOS
// ────────────────────────────────────────────────
function TabTurnos() {
  const [reservas, setReservas] = useState([])
  const [filtro, setFiltro] = useState('pendiente')
  const [trabajadoras, setTrabajadoras] = useState([])
  const config = getConfig()

  useEffect(() => {
    setReservas(getReservas())
    setTrabajadoras(getTrabajadoras())
  }, [])

  const cambiarEstado = (id, estado) => {
    const updated = reservas.map(r => r.id === id ? { ...r, estado } : r)
    saveReservas(updated)
    setReservas(updated)
  }

  const lista = reservas
    .filter(r => filtro === 'todos' || r.estado === filtro)
    .sort((a, b) => (a.fecha + a.hora) > (b.fecha + b.hora) ? 1 : -1)

  const msgRecordatorio = (r) =>
    `Hola ${r.clienteNombre}! 👋 Te recordamos tu turno en ${config.nombreSalon} mañana ${formatFechaLarga(r.fecha)} a las ${r.hora} hs con ${r.trabajadoraNombre} (${r.servicioNombre}). ¡Te esperamos! 💅`

  return (
    <div className="admin-section">
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['pendiente', 'confirmado', 'cancelado', 'todos'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filtro === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltro(f)}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {lista.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          No hay turnos {filtro !== 'todos' ? filtro + 's' : ''}
        </div>
      )}

      {lista.map(r => (
        <div key={r.id} className="turno-row">
          <div className="turno-info-col">
            <div className="turno-cliente">{r.clienteNombre}</div>
            <div className="turno-detalle">
              📅 {formatFechaLarga(r.fecha)} · {r.hora} hs
            </div>
            <div className="turno-detalle">💅 {r.servicioNombre} · {r.trabajadoraNombre}</div>
            {r.clienteTel && (
              <div className="turno-detalle">📱 {r.clienteTel}</div>
            )}
            <div style={{ marginTop: 6 }}>
              <span className={`badge badge-${r.estado}`}>{r.estado}</span>
            </div>
          </div>
          <div className="turno-actions">
            {r.estado === 'pendiente' && (
              <button className="btn btn-sm btn-primary" onClick={() => cambiarEstado(r.id, 'confirmado')}>
                ✓ Confirmar
              </button>
            )}
            {r.estado !== 'cancelado' && (
              <button className="btn btn-sm btn-danger" onClick={() => { if (window.confirm('¿Cancelar turno?')) cambiarEstado(r.id, 'cancelado') }}>
                Cancelar
              </button>
            )}
            {r.clienteTel && (
              <a
                href={waLink(r.clienteTel, msgRecordatorio(r))}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ background: '#25d366', color: '#fff', textDecoration: 'none' }}
                title="Enviar recordatorio"
              >
                💬
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────
// TAB: TRABAJADORAS
// ────────────────────────────────────────────────
function TabTrabajadoras() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({ nombre: '', foto: '', alias_mp: '', bio: '' })
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => setLista(getTrabajadoras()), [])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const guardar = () => {
    if (!form.nombre.trim()) return
    let updated
    if (editId) {
      updated = lista.map(t => t.id === editId ? { ...t, ...form } : t)
    } else {
      updated = [...lista, { id: genId(), ...form, activa: true }]
    }
    saveTrabajadoras(updated)
    setLista(updated)
    setForm({ nombre: '', foto: '', alias_mp: '', bio: '' })
    setEditId(null)
    setShowForm(false)
    flash(editId ? '✅ Guardado' : '✅ Trabajadora agregada')
  }

  const editar = (t) => {
    setForm({ nombre: t.nombre, foto: t.foto || '', alias_mp: t.alias_mp || '', bio: t.bio || '' })
    setEditId(t.id)
    setShowForm(true)
  }

  const toggleActiva = (id) => {
    const updated = lista.map(t => t.id === id ? { ...t, activa: !t.activa } : t)
    saveTrabajadoras(updated)
    setLista(updated)
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="admin-section">
      {msg && <div className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

      {!showForm ? (
        <button className="btn btn-primary btn-full" onClick={() => { setShowForm(true); setEditId(null); setForm({ nombre: '', foto: '', alias_mp: '', bio: '' }) }}>
          + Agregar trabajadora
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>
            {editId ? 'Editar trabajadora' : 'Nueva trabajadora'}
          </div>
          <div className="field">
            <label>Nombre *</label>
            <input type="text" value={form.nombre} onChange={F('nombre')} placeholder="Ej: Ana García" />
          </div>
          <div className="field">
            <label>URL de foto (opcional)</label>
            <input type="url" value={form.foto} onChange={F('foto')} placeholder="https://..." />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Podés usar el link de una foto de Google Drive, WhatsApp o cualquier URL pública
            </div>
          </div>
          <div className="field">
            <label>Alias MercadoPago *</label>
            <input type="text" value={form.alias_mp} onChange={F('alias_mp')} placeholder="Ej: nombre.apellido" />
          </div>
          <div className="field">
            <label>Descripción (opcional)</label>
            <input type="text" value={form.bio} onChange={F('bio')} placeholder="Ej: Especialista en nail art" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={guardar}>Guardar</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {lista.map(t => (
          <div key={t.id} style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
            padding: '13px 16px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: t.activa ? 1 : 0.5
          }}>
            <div className="worker-avatar" style={{ width: 44, height: 44, fontSize: 18, flexShrink: 0 }}>
              {t.foto ? <img src={t.foto} alt={t.nombre} /> : iniciales(t.nombre)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{t.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                MP: {t.alias_mp || '—'}{t.bio ? ` · ${t.bio}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => editar(t)}>Editar</button>
              <button className="btn btn-sm" style={{ background: '#f0f0f0', color: '#666' }} onClick={() => toggleActiva(t.id)}>
                {t.activa ? 'Pausar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// TAB: SERVICIOS
// ────────────────────────────────────────────────
function TabServicios() {
  const [lista, setLista] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracion: '', precio: '' })
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => setLista(getServicios()), [])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const guardar = () => {
    if (!form.nombre.trim() || !form.precio) return
    const item = { ...form, duracion: Number(form.duracion) || 60, precio: Number(form.precio) }
    let updated
    if (editId) {
      updated = lista.map(s => s.id === editId ? { ...s, ...item } : s)
    } else {
      updated = [...lista, { id: genId(), ...item }]
    }
    saveServicios(updated)
    setLista(updated)
    setForm({ nombre: '', descripcion: '', duracion: '', precio: '' })
    setEditId(null)
    setShowForm(false)
    flash(editId ? '✅ Guardado' : '✅ Servicio agregado')
  }

  const editar = (s) => {
    setForm({ nombre: s.nombre, descripcion: s.descripcion || '', duracion: String(s.duracion), precio: String(s.precio) })
    setEditId(s.id)
    setShowForm(true)
  }

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar servicio?')) return
    const updated = lista.filter(s => s.id !== id)
    saveServicios(updated)
    setLista(updated)
  }

  const F = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="admin-section">
      {msg && <div className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

      {!showForm ? (
        <button className="btn btn-primary btn-full" onClick={() => { setShowForm(true); setEditId(null); setForm({ nombre: '', descripcion: '', duracion: '', precio: '' }) }}>
          + Agregar servicio
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>
            {editId ? 'Editar servicio' : 'Nuevo servicio'}
          </div>
          <div className="field">
            <label>Nombre *</label>
            <input type="text" value={form.nombre} onChange={F('nombre')} placeholder="Ej: Manicura con diseño" />
          </div>
          <div className="field">
            <label>Descripción (opcional)</label>
            <input type="text" value={form.descripcion} onChange={F('descripcion')} placeholder="Ej: Incluye nail art personalizado" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Duración (min) *</label>
              <input type="number" value={form.duracion} onChange={F('duracion')} placeholder="60" inputMode="numeric" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Precio *</label>
              <input type="number" value={form.precio} onChange={F('precio')} placeholder="8000" inputMode="numeric" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={guardar}>Guardar</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {lista.map(s => (
          <div key={s.id} className="service-card" style={{ cursor: 'default', marginBottom: 10 }}>
            <div className="service-info">
              <div className="service-name">{s.nombre}</div>
              {s.descripcion && <div className="service-desc">{s.descripcion}</div>}
              <div className="service-meta">
                <span className="service-duration">⏱ {formatDuracion(s.duracion)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <div className="service-price">{formatMonto(s.precio)}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => editar(s)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => eliminar(s.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────
// TAB: CONFIGURACIÓN
// ────────────────────────────────────────────────
function TabConfig({ onLogout }) {
  const [config, setConfig] = useState(getConfig())
  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [passErr, setPassErr] = useState('')
  const [msg, setMsg] = useState('')

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const guardarConfig = () => {
    saveConfig(config)
    flash('✅ Configuración guardada')
  }

  const cambiarPass = () => {
    setPassErr('')
    if (passActual !== getConfig().adminPassword) { setPassErr('Contraseña actual incorrecta'); return }
    if (passNueva.length < 4) { setPassErr('Mínimo 4 caracteres'); return }
    if (passNueva !== passConfirm) { setPassErr('Las contraseñas no coinciden'); return }
    const updated = { ...config, adminPassword: passNueva }
    saveConfig(updated)
    setConfig(updated)
    setPassActual(''); setPassNueva(''); setPassConfirm('')
    flash('✅ Contraseña actualizada')
  }

  const C = (k) => (e) => setConfig(c => ({ ...c, [k]: e.target.value }))

  return (
    <div className="admin-section">
      {msg && <div className="alert alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Datos del salón</div>
        <div className="field">
          <label>Nombre del salón</label>
          <input type="text" value={config.nombreSalon} onChange={C('nombreSalon')} />
        </div>
        <div className="field">
          <label>WhatsApp del salón (con código de país)</label>
          <input type="tel" value={config.whatsappSalon} onChange={C('whatsappSalon')} placeholder="5491112345678" inputMode="tel" />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Ej: 5491155443322 (549 + número sin el 0 y sin el 15)
          </div>
        </div>
        <div className="field">
          <label>Monto de la seña ($)</label>
          <input type="number" value={config.senaFija} onChange={e => setConfig(c => ({ ...c, senaFija: Number(e.target.value) }))} inputMode="numeric" />
        </div>
        <button className="btn btn-primary btn-full" onClick={guardarConfig}>Guardar</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Cambiar contraseña</div>
        <div className="field">
          <label>Contraseña actual</label>
          <input type="password" value={passActual} onChange={e => setPassActual(e.target.value)} />
        </div>
        <div className="field">
          <label>Nueva contraseña</label>
          <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} />
        </div>
        <div className="field">
          <label>Confirmar nueva</label>
          <input type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} />
        </div>
        {passErr && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{passErr}</div>}
        <button className="btn btn-primary btn-full" onClick={cambiarPass}>Cambiar contraseña</button>
      </div>

      <button className="btn btn-danger btn-full" onClick={() => { if (window.confirm('¿Cerrar sesión?')) onLogout() }}>
        Cerrar sesión
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────
// ADMIN PAGE (contenedor)
// ────────────────────────────────────────────────
export default function AdminPage({ navigate }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState('turnos')

  if (!loggedIn) return <LoginAdmin onLogin={() => setLoggedIn(true)} />

  const TABS = [
    { id: 'turnos',       label: 'Turnos' },
    { id: 'trabajadoras', label: 'Equipo' },
    { id: 'servicios',    label: 'Servicios' },
    { id: 'config',       label: 'Config' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('landing')}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}
        >
          ←
        </button>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Panel de administración</div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'turnos'       && <TabTurnos />}
      {tab === 'trabajadoras' && <TabTrabajadoras />}
      {tab === 'servicios'    && <TabServicios />}
      {tab === 'config'       && <TabConfig onLogout={() => { setLoggedIn(false); navigate('landing') }} />}
    </div>
  )
}
