export const HORARIOS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];

export const hoy = () => new Date().toISOString().split('T')[0];

export const formatFechaLarga = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fecha = new Date(iso + 'T12:00:00');
  return `${dias[fecha.getDay()]} ${d} de ${meses[Number(m)-1]}`;
};

export const formatFecha = (iso) => {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

export const formatMonto = (n) =>
  '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');

export const formatDuracion = (min) =>
  min >= 60 ? `${Math.floor(min/60)}h${min%60 ? ` ${min%60}min` : ''}` : `${min} min`;

export const getHorariosDisponibles = (trabajadoraId, fecha, reservas, bloqueados) => {
  const ocupados = reservas
    .filter(r => r.trabajadoraId === trabajadoraId && r.fecha === fecha && r.estado !== 'cancelado')
    .map(r => r.hora);
  const bloqs = bloqueados
    .filter(b => b.trabajadoraId === trabajadoraId && b.fecha === fecha)
    .map(b => b.hora);
  const taken = new Set([...ocupados, ...bloqs]);
  return HORARIOS.map(h => ({ hora: h, disponible: !taken.has(h) }));
};

export const waLink = (telefono, mensaje) => {
  const num = (telefono || '').replace(/\D/g, '');
  const msg = encodeURIComponent(mensaje);
  return `https://wa.me/${num}?text=${msg}`;
};

export const iniciales = (nombre) =>
  (nombre || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
