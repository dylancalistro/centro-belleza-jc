const P = 'jc_';

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(P + key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(P + key, JSON.stringify(val));

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Config ──
export const getConfig = () => load('config', {
  nombreSalon: 'Centro de Belleza JC',
  adminPassword: 'jc2024',
  whatsappSalon: '',  // ej: 5491112345678
  senaFija: 10000,
});
export const saveConfig = (c) => save('config', c);

// ── Trabajadoras ──
export const getTrabajadoras = () => load('trabajadoras', []);
export const saveTrabajadoras = (t) => save('trabajadoras', t);

// ── Servicios ──
export const getServicios = () => load('servicios', []);
export const saveServicios = (s) => save('servicios', s);

// ── Reservas ──
export const getReservas = () => load('reservas', []);
export const saveReservas = (r) => save('reservas', r);

// ── Bloqueados ──
export const getBloqueados = () => load('bloqueados', []);
export const saveBloqueados = (b) => save('bloqueados', b);

// ── Seed inicial (solo si no hay datos) ──
export const seedIfEmpty = () => {
  if (getTrabajadoras().length > 0) return;
  saveTrabajadoras([
    { id: 'w1', nombre: 'Nombre 1', foto: '', alias_mp: 'alias.mp1', bio: 'Especialista en nail art y diseños', activa: true },
    { id: 'w2', nombre: 'Nombre 2', foto: '', alias_mp: 'alias.mp2', bio: 'Experta en acrílicas y semipermanente', activa: true },
  ]);
  saveServicios([
    { id: 's1', nombre: 'Manicura simple', descripcion: 'Limado, cutículas y esmaltado tradicional', duracion: 45, precio: 5000 },
    { id: 's2', nombre: 'Manicura con diseño', descripcion: 'Incluye diseños y nail art personalizado', duracion: 60, precio: 8000 },
    { id: 's3', nombre: 'Uñas acrílicas', descripcion: 'Extensión y esculpido completo con diseño', duracion: 90, precio: 15000 },
    { id: 's4', nombre: 'Semipermanente', descripcion: 'Duración 3 a 4 semanas, amplia paleta de colores', duracion: 60, precio: 7000 },
  ]);
};
