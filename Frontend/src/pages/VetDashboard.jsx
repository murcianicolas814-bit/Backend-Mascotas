import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, ProgressBar, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

/* ===================== CONEXIÓN JSON SERVER ===================== */
const API_URL = 'http://localhost:3001';

const normCitas = (l) => (l || []).map((c) => ({ ...c, mascotaId: String(c.mascotaId) }));
const normMascotas = (l) => (l || []).map((m) => ({ ...m, id: String(m.id) }));
const normPorMascota = (l) => (l || []).map((x) => ({ ...x, mascotaId: String(x.mascotaId) }));

const api = {
  get: async (recurso) => {
    const respuesta = await fetch(`${API_URL}/${recurso}`);
    if (!respuesta.ok) throw new Error(`Error al consultar ${recurso}`);
    return respuesta.json();
  },
  post: async (recurso, datos) => {
    const respuesta = await fetch(`${API_URL}/${recurso}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    if (!respuesta.ok) throw new Error(`Error al guardar en ${recurso}`);
    return respuesta.json();
  },
  patch: async (recurso, id, datos) => {
    const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    if (!respuesta.ok) throw new Error(`Error al actualizar ${recurso}`);
    return respuesta.json();
  },
  delete: async (recurso, id) => {
    const respuesta = await fetch(`${API_URL}/${recurso}/${id}`, { method: 'DELETE' });
    if (!respuesta.ok) throw new Error(`Error al eliminar de ${recurso}`);
    return true;
  },
  patchDisponibilidad: async (datos) => {
    const respuesta = await fetch(`${API_URL}/disponibilidad`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
    if (!respuesta.ok) throw new Error('Error al actualizar disponibilidad');
    return respuesta.json();
  }
};

/* ===================== HELPERS ===================== */
const pad = (n) => String(n).padStart(2, '0');
const fmtISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => new Date(`${s}T00:00:00`);
const addDias = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return fmtISO(d); };
const aMin = (h) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const deMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const fmtHora = (h) => { const [a, b] = h.split(':').map(Number); return `${pad(a % 12 || 12)}:${pad(b)} ${a >= 12 ? 'PM' : 'AM'}`; };
const fmtFecha = (iso) => parseISO(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOY = fmtISO(new Date());

const FotoConFallback = ({ srcs, ...props }) => {
  const [i, setI] = useState(0);
  if (i >= srcs.length) return null;
  return <img {...props} src={srcs[i]} onError={() => setI(i + 1)} />;
};
const DOCTOR_SRCS = ['/Dr.Alejandro.png', '/Dr.Alejandro.jpg', '/Dr.Alejandro.jpeg', '/Dr.Alejandro.webp'];
const BARRA_SRCS = ['/Barra.jpeg', '/barra.jpeg', '/Barra.jpg', '/Barra.png', '/Barra.webp'];

/* ===================== NOTIFICACIONES TOAST ===================== */
const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
});
const mostrarNotificacion = (icon, texto) => Toast.fire({ icon, title: texto });

/* ===================== COMPONENTE REUTILIZABLE: TARJETAS DE RESUMEN ===================== */
const ResumenGeneral = ({ citasHoy, solicitudes, urgenciasPend, mascotas }) => {
  const tarjetas = [
    { titulo: 'Citas para hoy', cantidad: citasHoy.length, icono: '📋', color: '#2563eb', fondo: '#eff6ff' },
    { titulo: 'Solicitudes pendientes', cantidad: solicitudes.length, icono: '🔔', color: '#d97706', fondo: '#fffbeb' },
    { titulo: 'Urgencias activas', cantidad: urgenciasPend, icono: '🚨', color: '#dc2626', fondo: '#fef2f2' },
    { titulo: 'Pacientes registrados', cantidad: mascotas.length, icono: '🐾', color: '#059669', fondo: '#ecfdf5' }
  ];

  return (
    <Row className="g-3 mb-4">
      {tarjetas.map((item, index) => (
        <Col xs={6} xl={3} key={index}>
          <Card 
            className="border-0 shadow-sm rounded-4 h-100" 
            style={{ background: item.fondo, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
          >
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-semibold text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{item.titulo}</small>
                  <h2 className="fw-bold mb-0 mt-1" style={{ color: item.color }}>{item.cantidad}</h2>
                </div>
                <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48, background: '#ffffff', fontSize: 22 }}>
                  {item.icono}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/* ===================== BANNER ===================== */
const Banner = ({ titulo, subtitulo }) => (
  <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative bg-white">
    <div className="p-4 d-flex justify-content-between align-items-center" style={{ position: 'relative', background: 'linear-gradient(90deg, #c3dafe 0%, #dbeafe 60%, #eff6ff 100%)', minHeight: '130px' }}>
      <FotoConFallback srcs={BARRA_SRCS} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center', zIndex: 0, opacity: 0.6 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="fw-bold mb-1" style={{ color: '#0f2b5c', fontSize: '1.8rem' }}>{titulo}</h2>
        {subtitulo && <p className="text-secondary small mb-0 fw-semibold">{subtitulo}</p>}
      </div>
    </div>
  </Card>
);

const BANNER_TEXTOS = {
  agenda: ['Mi Agenda', 'Revisa, confirma y reprograma tus citas.'],
  pacientes: ['Pacientes', 'Consulta el expediente de cada mascota.'],
  historial: ['Historial Clínico', 'Todas tus consultas registradas en un solo lugar.'],
  tratamientos: ['Tratamientos', 'Controla la medicación y el progreso de cada paciente.'],
  disponibilidad: ['Disponibilidad', 'Configura tu horario, estado y bloqueos.']
};

const colorEstado = { 'Pendiente': 'warning', 'Confirmada': 'primary', 'En atención': 'info', 'Completada': 'success', 'Reprogramación sugerida': 'secondary', 'Rechazada': 'danger', 'Cancelada': 'dark' };
const colorMotivo = { 'Vacunación': 'primary', 'Urgencia': 'danger', 'Consulta': 'success', 'Chequeo': 'info', 'Control': 'secondary', 'Cirugía': 'dark' };

/* ===================== COMPONENTE PRINCIPAL ===================== */
export const VetDashboard = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [cargando, setCargando] = useState(true);

  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroAgenda, setFiltroAgenda] = useState('Todas');
  const [busquedaAgenda, setBusquedaAgenda] = useState('');
  const [verSoloAtendidos, setVerSoloAtendidos] = useState(true);
  const [busquedaHist, setBusquedaHist] = useState('');
  const [filtroTrat, setFiltroTrat] = useState('Todos');

  const [mesVista, setMesVista] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const cambiarMes = (n) => setMesVista((d) => new Date(d.getFullYear(), d.getMonth() + n, 1));
  const irAHoy = () => setMesVista(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [estadoVet, setEstadoVet] = useState('disponible');
  const [horario, setHorario] = useState({});
  const [almuerzo, setAlmuerzo] = useState({ inicio: '12:00', fin: '13:00' });
  const [duracion, setDuracion] = useState(30);
  const [aceptaUrgencias, setAceptaUrgencias] = useState(true);
  const [bloqueos, setBloqueos] = useState([]);
  const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: HOY, inicio: '08:00', fin: '10:00', motivo: '' });

  const [modal, setModal] = useState(null);
  const [formReprog, setFormReprog] = useState({ fecha: HOY, hora: '08:00', mensaje: '' });
  const medVacio = { nombre: '', dosis: '', frecuencia: '', duracionDias: 5, via: 'Oral', indicaciones: '' };
  const [formConsulta, setFormConsulta] = useState({});
  const [erroresForm, setErroresForm] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [mascotasDB, citasDB, consultasDB, tratamientosDB, disponibilidadDB] = await Promise.all([
          api.get('mascotas'), api.get('citas'), api.get('consultas'), api.get('tratamientos'), api.get('disponibilidad')
        ]);
        setMascotas(normMascotas(mascotasDB));
        setCitas(normCitas(citasDB));
        setConsultas(normPorMascota(consultasDB));
        setTratamientos(normPorMascota(tratamientosDB));

        if (disponibilidadDB) {
          setEstadoVet(disponibilidadDB.estadoVet || 'disponible');
          setHorario(disponibilidadDB.horario || {});
          setAlmuerzo(disponibilidadDB.almuerzo || { inicio: '12:00', fin: '13:00' });
          setDuracion(disponibilidadDB.duracion || 30);
          setAceptaUrgencias(disponibilidadDB.aceptaUrgencias ?? true);
          setBloqueos(disponibilidadDB.bloqueos || []);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarNotificacion('error', 'No se pudieron cargar los datos. Verifica JSON Server.');
      } finally { setCargando(false); }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try { setCitas(normCitas(await api.get('citas'))); } catch { /* silencioso */ }
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const actualizarCita = async (id, cambios) => {
    try {
      const actualizada = await api.patch('citas', id, cambios);
      setCitas((prev) => prev.map((c) => c.id === id ? actualizada : c));
      return actualizada;
    } catch { mostrarNotificacion('error', 'No se pudo actualizar la cita.'); return null; }
  };

  const conflicto = (fecha, hora, ignorarId) => {
    const dia = horario[parseISO(fecha).getDay()];
    if (!dia || !dia.activo) return `No atiendes este día.`;
    const m = aMin(hora);
    if (m < aMin(dia.inicio) || m + duracion > aMin(dia.fin)) return `Fuera de horario.`;
    if (m < aMin(almuerzo.fin) && m + duracion > aMin(almuerzo.inicio)) return 'Coincide con tu descanso.';
    const b = bloqueos.find((x) => x.fecha === fecha && m < aMin(x.fin) && m + duracion > aMin(x.inicio));
    if (b) return `Bloqueo activo: ${b.motivo || 'No disponible'}.`;
    const otra = citas.find((c) => c.id !== ignorarId && c.fecha === fecha && ['Confirmada', 'En atención'].includes(c.estado) && m < aMin(c.hora) + duracion && m + duracion > aMin(c.hora));
    if (otra) return `Ya tienes cita con ${mascotaDe(otra.mascotaId).nombre} a las ${fmtHora(otra.hora)}.`;
    return null;
  };

  const sugerirHorario = (fecha, hora, ignorarId) => {
    for (let d = 0; d < 21; d++) {
      const f = addDias(fecha, d);
      const dia = horario[parseISO(f).getDay()];
      if (!dia || !dia.activo) continue;
      for (let m = aMin(dia.inicio); m + duracion <= aMin(dia.fin); m += duracion) {
        if (f === fecha && m <= aMin(hora)) continue;
        if (!conflicto(f, deMin(m), ignorarId)) return { fecha: f, hora: deMin(m) };
      }
    }
    return { fecha, hora };
  };

  const confirmarCita = async (c) => {
    const problema = conflicto(c.fecha, c.hora, c.id);
    if (problema && !(c.motivo === 'Urgencia' && aceptaUrgencias)) {
      mostrarNotificacion('warning', `No puedes confirmar: ${problema}`);
      abrirReprogramar(c);
      return;
    }
    const actualizada = await actualizarCita(c.id, { estado: 'Confirmada' });
    if (actualizada) mostrarNotificacion('success', `Cita de ${mascotaDe(c.mascotaId).nombre} confirmada.`);
  };

  const abrirReprogramar = (c) => {
    setModal({ tipo: 'reprogramar', cita: c });
    setFormReprog({ fecha: c.fecha || HOY, hora: c.hora || '09:00', mensaje: 'No tengo disponibilidad en ese horario. Te propongo esta alternativa.' });
    try {
      const sugerencia = sugerirHorario(c.fecha, c.hora, c.id);
      if (sugerencia) setFormReprog({ fecha: sugerencia.fecha, hora: sugerencia.hora, mensaje: formReprog.mensaje });
    } catch (error) { console.error(error); }
  };

  const enviarSugerencia = async () => {
    const c = modal.cita;
    if (conflicto(formReprog.fecha, formReprog.hora, c.id)) {
      mostrarNotificacion('error', 'El nuevo horario tampoco está libre.');
      return;
    }
    const actualizada = await actualizarCita(c.id, { estado: 'Reprogramación sugerida', sugerencia: { fecha: formReprog.fecha, hora: formReprog.hora, mensaje: formReprog.mensaje } });
    if (actualizada) { setModal(null); mostrarNotificacion('success', 'Propuesta de horario enviada al cliente.'); }
  };

  const iniciarAtencion = async (c) => {
    const actualizada = await actualizarCita(c.id, { estado: 'En atención' });
    if (actualizada) mostrarNotificacion('info', `Atención iniciada con ${mascotaDe(c.mascotaId).nombre}.`);
  };

  const simularSolicitudCliente = async () => {
    if (mascotas.length === 0) return mostrarNotificacion('warning', 'No hay mascotas registradas.');
    const m = mascotas[Math.floor(Math.random() * mascotas.length)];
    const f = addDias(HOY, Math.floor(Math.random() * 4));
    const h = deMin(aMin('08:00') + 30 * Math.floor(Math.random() * 16));
    try {
      const guardada = await api.post('citas', { fecha: f, hora: h, mascotaId: m.id, motivo: 'Consulta', estado: 'Pendiente', nota: 'Solicitud web', sugerencia: null });
      setCitas((p) => [...p, guardada]);
      mostrarNotificacion('warning', `🔔 Nueva solicitud de ${m.tutor} para ${m.nombre}.`);
    } catch { mostrarNotificacion('error', 'No se pudo registrar la solicitud.'); }
  };

  const guardarDisponibilidad = async () => {
    try {
      await api.patchDisponibilidad({ estadoVet, horario, almuerzo, duracion, aceptaUrgencias, bloqueos });
      mostrarNotificacion('success', 'Disponibilidad actualizada correctamente.');
    } catch { mostrarNotificacion('error', 'No se pudo guardar la disponibilidad.'); }
  };

  const guardarConsulta = async () => {
    const c = modal.cita;
    const nuevosErrores = {};
    if (!formConsulta.diagnostico?.trim()) nuevosErrores.diagnostico = 'El diagnóstico es obligatorio.';
    if (!formConsulta.peso?.trim()) nuevosErrores.peso = 'El peso es obligatorio.';
    if (Object.keys(nuevosErrores).length > 0) {
      setErroresForm(nuevosErrores);
      mostrarNotificacion('error', 'Por favor completa los campos obligatorios.');
      return;
    }
    setErroresForm({});
    const meds = (formConsulta.medicamentos || []).filter((m) => m.nombre.trim());
    const nuevaConsulta = { citaId: c.id, fecha: c.fecha, hora: c.hora, mascotaId: c.mascotaId, motivo: c.motivo, ...formConsulta, medicamentos: meds, vet: 'Dr. Carlos' };
    try {
      const consultaGuardada = await api.post('consultas', nuevaConsulta);
      setConsultas((p) => [consultaGuardada, ...p]);
      await actualizarCita(c.id, { estado: 'Completada' });
      setModal(null); setFormConsulta({});
      mostrarNotificacion('success', `Consulta de ${mascotaDe(c.mascotaId).nombre} finalizada y guardada.`);
    } catch { mostrarNotificacion('error', 'Error al guardar la consulta.'); }
  };

  const cambiarEstadoTratamiento = async (t, nuevoEstado) => {
    try {
      const actualizado = await api.patch('tratamientos', t.id, { estado: nuevoEstado });
      setTratamientos((p) => p.map((x) => (x.id === t.id ? actualizado : x)));
      mostrarNotificacion('success', `Tratamiento marcado como ${nuevoEstado.toLowerCase()}.`);
    } catch { mostrarNotificacion('error', 'No se pudo actualizar el tratamiento.'); }
  };

  const setMed = (i, campo, valor) => setFormConsulta((f) => ({ ...f, medicamentos: f.medicamentos.map((m, k) => (k === i ? { ...m, [campo]: valor } : m)) }));

  /* ===================== DERIVADOS ===================== */
  const mascotaDe = (id) => mascotas.find((m) => m.id === id) || {};
  const citasHoy = citas.filter((c) => c.fecha === HOY).sort((a, b) => a.hora.localeCompare(b.hora));
  const solicitudes = citas.filter((c) => c.estado === 'Pendiente').sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const proxima = citas.filter((c) => ['Confirmada', 'Pendiente'].includes(c.estado) && (c.fecha + c.hora) >= (HOY + '00:00')).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0];
  
  const agendaFiltrada = citas.filter((c) => {
    const coincideEstado = filtroAgenda === 'Todas' || c.estado === filtroAgenda;
    const m = mascotaDe(c.mascotaId);
    const texto = [m.nombre, m.tutor, c.motivo, c.estado].join(' ').toLowerCase();
    return coincideEstado && texto.includes(busquedaAgenda.toLowerCase());
  }).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  const consultasFiltradas = useMemo(() => consultas.filter((h) => {
    const m = mascotaDe(h.mascotaId);
    const t = busquedaHist.toLowerCase();
    return !t || [m.nombre, m.tutor, h.diagnostico, h.motivo].join(' ').toLowerCase().includes(t);
  }).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)), [consultas, busquedaHist]);

  const idsAtendidos = new Set(consultas.map((c) => c.mascotaId));
  const pacientesVista = mascotas.filter((m) => (verSoloAtendidos ? idsAtendidos.has(m.id) : true));
  const urgenciasPend = citas.filter((c) => c.motivo === 'Urgencia' && !['Completada', 'Rechazada'].includes(c.estado)).length;
  
  const perros = consultas.filter((c) => mascotaDe(c.mascotaId).especie?.includes('Perro')).length;
  const gatos = consultas.length - perros;
  const pct = (n) => (consultas.length ? Math.round((n / consultas.length) * 100) : 0);

  const diasTrat = (t) => {
    const transcurridos = Math.max(0, Math.floor((parseISO(HOY) - parseISO(t.inicio)) / 86400000));
    return { transcurridos: Math.min(transcurridos, t.duracionDias), pct: Math.min(100, Math.round((transcurridos / t.duracionDias) * 100)), fin: addDias(t.inicio, t.duracionDias) };
  };
  const tratFiltrados = tratamientos.filter((t) => filtroTrat === 'Todos' || t.estado === filtroTrat);

  const hoyD = mesVista;
  const offset = (mesVista.getDay() + 6) % 7;
  const diasMes = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 0).getDate();
  const celdas = [...Array(offset).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const diasConCitas = new Set(citas.filter((c) => !['Rechazada', 'Cancelada'].includes(c.estado)).map((c) => c.fecha));

  const menu = [
    ['dashboard', '📊 Panel de control'], ['agenda', '📅 Mi Agenda'], ['pacientes', '🐾 Pacientes'],
    ['historial', '🩺 Historial Clínico'], ['tratamientos', '💉 Tratamientos'], ['disponibilidad', '⚙️ Disponibilidad']
  ];

  // 👉 FUNCIÓN PARA CERRAR SESIÓN CON SWEETALERT
  const confirmarCerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: { popup: 'rounded-4' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuario');
        navigate('/login');
      }
    });
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#f0f4f8' }}>
        <div className="text-center"><div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div><h5 className="text-primary fw-bold">Cargando panel veterinario...</h5></div>
      </div>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f0f4f8', fontFamily: "'Poppins', sans-serif" }}>
      {/* SIDEBAR */}
      <div className="p-3 d-flex flex-column" style={{ width: '260px', minWidth: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        <div className="text-center mb-4">
          <img src="/Logo.jpeg" alt="Logo" style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => navigate('/')} onError={(e) => { e.target.src = '/Logo.jpg'; }} />
        </div>
        
        {/* MENÚ CON BORDES Y ESTILO PASTEL */}
        <div className="d-flex flex-column gap-2 mb-3">
          {menu.map(([k, label]) => {
            const isActive = seccionActiva === k;
            return (
              <Button 
                key={k} 
                variant="transparent" 
                onClick={() => setSeccionActiva(k)}
                className="text-start rounded-3 py-2 px-3 fw-semibold small d-flex justify-content-between align-items-center w-100"
                style={{ 
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? '#e0f2fe' : '#ffffff',
                  borderColor: isActive ? '#7dd3fc' : '#e2e8f0',
                  color: isActive ? '#0369a1' : '#64748b',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: isActive ? '0 2px 4px rgba(14, 165, 233, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <span>{label}</span>
                {k === 'agenda' && solicitudes.length > 0 && <Badge bg="danger" pill className="ms-2" style={{ fontSize: '10px' }}>{solicitudes.length}</Badge>}
              </Button>
            );
          })}
        </div>

        {/* CALENDARIO VETERINARIO MEJORADO */}
<Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-3">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <Button 
      variant="light" 
      size="sm" 
      className="rounded-circle py-0 px-2 fw-bold text-primary" 
      onClick={() => {
        const nuevoMes = new Date(mesVista);
        nuevoMes.setMonth(nuevoMes.getMonth() - 1);
        setMesVista(nuevoMes);
      }}
    >
      ‹
    </Button>
    <div 
      className="fw-bold text-primary small text-capitalize d-flex align-items-center gap-1" 
      style={{ cursor: 'pointer' }} 
      onClick={() => setMesVista(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} 
      title="Volver al mes actual"
    >
      🐾 {mesVista.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
    </div>
    <Button 
      variant="light" 
      size="sm" 
      className="rounded-circle py-0 px-2 fw-bold text-primary" 
      onClick={() => {
        const nuevoMes = new Date(mesVista);
        nuevoMes.setMonth(nuevoMes.getMonth() + 1);
        setMesVista(nuevoMes);
      }}
    >
      ›
    </Button>
  </div>
  <div className="d-grid text-muted fw-bold mb-1" style={{ gridTemplateColumns: 'repeat(7,1fr)', fontSize: '11px' }}>
    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} className="text-center">{d}</span>)}
  </div>
  <div className="d-grid text-secondary mb-2" style={{ gridTemplateColumns: 'repeat(7,1fr)', fontSize: '11px', rowGap: '4px' }}>
    {celdas.map((d, i) => {
      if (!d) return <span key={i}></span>;
      const iso = `${mesVista.getFullYear()}-${pad(mesVista.getMonth() + 1)}-${pad(d)}`;
      const esHoy = iso === HOY;
      const tieneCita = diasConCitas.has(iso);
      return (
        <span key={i} className="text-center position-relative" style={{ cursor: 'pointer', padding: '2px 0' }}>
          <span 
            className={`d-inline-flex align-items-center justify-content-center rounded-circle ${esHoy ? 'bg-primary text-white' : tieneCita ? 'bg-info bg-opacity-10 text-primary fw-bold' : ''}`} 
            style={{ width: '24px', height: '24px', fontSize: '11px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { if (!esHoy) e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
            onMouseLeave={(e) => { if (!esHoy && !tieneCita) e.currentTarget.style.backgroundColor = 'transparent'; else if (!esHoy) e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)'; }}
          >
            {d}
          </span>
          {!esHoy && tieneCita && <span style={{ display: 'block', height: 4, width: 4, background: '#0ea5e9', borderRadius: '50%', margin: '0 auto', marginTop: '1px' }} />}
        </span>
      );
    })}
  </div>
  <Button variant="outline-primary" size="sm" className="rounded-pill fw-bold w-100 py-1" style={{ fontSize: '12px' }} onClick={() => setSeccionActiva('agenda')}>
    Ver Agenda Completa
  </Button>
</Card>

        {/* BOTÓN CERRAR SESIÓN ANCLADO AL FINAL */}
        <Button 
          variant="transparent" 
          className="text-start rounded-3 py-2 px-3 fw-semibold small text-danger mt-auto" 
          onClick={confirmarCerrarSesion} 
          style={{ transition: 'all 0.2s ease', border: '1px solid #fee2e2', color: '#ef4444' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          🚪 Cerrar Sesión
        </Button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div><h3 className="fw-bold mb-0" style={{ color: '#0f2b5c' }}>Zoolomascotas MX</h3><small className="text-muted">Panel de Gestión Veterinaria</small></div>
          <div className="d-flex align-items-center gap-3">
            <Button variant="white" className="bg-white shadow-sm rounded-circle position-relative border" style={{ width: 44, height: 44 }} onClick={() => setModal({ tipo: 'solicitudes' })} title="Solicitudes">
              🔔{solicitudes.length > 0 && <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">{solicitudes.length}</Badge>}
            </Button>
            <div className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-4 shadow-sm border">
              <div className="text-end">
                <strong className="d-block text-dark small">Dr. Carlos Veterinario</strong>
                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Medicina General</small>
                <Badge bg={estadoVet === 'disponible' ? 'success' : estadoVet === 'cirugia' ? 'danger' : 'warning'} className="rounded-pill" style={{ fontSize: '10px' }}>
                  {estadoVet === 'disponible' ? 'Disponible' : estadoVet === 'cirugia' ? 'En cirugía' : 'En descanso'}
                </Badge>
              </div>
              <FotoConFallback srcs={DOCTOR_SRCS} alt="Doctor" className="rounded-circle border" style={{ width: '45px', height: '45px', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          </div>
        </div>

        <Banner titulo={seccionActiva === 'dashboard' ? 'Bienvenido de nuevo, Dr. Carlos' : BANNER_TEXTOS[seccionActiva][0]} subtitulo={seccionActiva === 'dashboard' ? (solicitudes.length > 0 ? `Tienes ${solicitudes.length} solicitud(es) de cita por revisar.` : 'Aquí tienes un resumen de tus citas y actividades asignadas.') : BANNER_TEXTOS[seccionActiva][1]} />

        {/* TARJETAS DE RESUMEN (En todas las secciones) */}
        <ResumenGeneral citasHoy={citasHoy} solicitudes={solicitudes} urgenciasPend={urgenciasPend} mascotas={mascotas} />

        {/* ============ DASHBOARD ============ */}
        {seccionActiva === 'dashboard' && (
          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.1rem' }}>📋 Citas del día</h5>
                <Table responsive hover className="align-middle mb-0">
                  <thead className="table-light"><tr className="text-secondary small"><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Dueño</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    {citasHoy.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No tienes citas para hoy. ¡Disfruta tu día!</td></tr>}
                    {citasHoy.map((c) => {
                      const m = mascotaDe(c.mascotaId);
                      return (
                        <tr key={c.id} style={{ transition: 'background-color 0.2s' }}>
                          <td className="fw-semibold text-secondary small">{fmtHora(c.hora)}</td>
                          <td className="fw-bold text-dark">{m.nombre}</td>
                          <td><Badge bg={colorMotivo[c.motivo] || 'secondary'} className="rounded-pill px-3 py-1">{c.motivo}</Badge></td>
                          <td className="small text-secondary">{m.tutor}</td>
                          <td><Badge bg={colorEstado[c.estado]} text={c.estado === 'Pendiente' ? 'dark' : undefined} className="rounded-pill">{c.estado}</Badge></td>
                          <td>
                            {c.estado === 'Pendiente' && <Button size="sm" variant="warning" className="rounded-pill px-3 fw-bold" onClick={() => setSeccionActiva('agenda')}>Revisar</Button>}
                            {c.estado === 'Confirmada' && <Button size="sm" className="rounded-pill px-3 fw-bold border-0" style={{ backgroundColor: '#0288d1' }} onClick={() => iniciarAtencion(c)}>Atender</Button>}
                            {c.estado === 'En atención' && <Button size="sm" variant="success" className="rounded-pill px-3 fw-bold" onClick={() => setModal({ tipo: 'finalizar', cita: c })}>Finalizar</Button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.1rem' }}>🐾 Mis pacientes</h5>
                <Form.Control type="text" placeholder="🔍 Buscar pacientes por nombre o dueño..." className="rounded-pill bg-light border-0 py-2 px-3 mb-3" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                <Row className="g-2">
                  {mascotas.filter((m) => `${m.nombre} ${m.tutor}`.toLowerCase().includes(busqueda.toLowerCase())).map((m) => (
                    <Col md={6} key={m.id}>
                      <div className="border rounded-3 p-3 d-flex align-items-center justify-content-between hover-shadow" style={{ transition: 'all 0.2s', cursor: 'pointer', borderColor: '#dee2e6' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#0288d1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#dee2e6'; }}
                        onClick={() => setModal({ tipo: 'expediente', mascota: m })}>
                        <div><div className="fw-bold small text-dark">{m.nombre}</div><small className="text-muted">{m.tutor}</small></div>
                        <Button size="sm" variant="outline-primary" className="rounded-pill">Ver perfil</Button>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h6 className="fw-bold text-dark mb-3">🐾 Próxima cita</h6>
                {proxima ? (() => {
                  const m = mascotaDe(proxima.mascotaId);
                  return (
                    <>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: 48, height: 48 }}>{m.nombre?.[0]}</div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">{m.nombre}</h6>
                          <small className="text-muted d-block">{m.tutor}</small>
                          <Button variant="outline-primary" size="sm" className="rounded-pill py-0 px-2 mt-1" style={{ fontSize: 11 }} onClick={() => setModal({ tipo: 'expediente', mascota: m })}>Perfil de {m.nombre}</Button>
                        </div>
                      </div>
                      <div className="small text-secondary d-flex flex-column gap-2 border-top pt-3">
                        <div>📅 {fmtFecha(proxima.fecha)} — {fmtHora(proxima.hora)}</div>
                        <div>📍 Sede principal San Mateo</div>
                        <div><Badge bg={colorMotivo[proxima.motivo] || 'secondary'} className="rounded-pill">{proxima.motivo}</Badge> <Badge bg={colorEstado[proxima.estado]} text={proxima.estado === 'Pendiente' ? 'dark' : undefined} className="rounded-pill">{proxima.estado}</Badge></div>
                      </div>
                    </>
                  );
                })() : <p className="text-muted small mb-0">Sin citas próximas.</p>}
              </Card>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h6 className="fw-bold text-dark mb-3">Mis atenciones</h6>
                <div className="text-center py-2">
                  <div className="mx-auto rounded-circle border border-primary border-4 d-flex align-items-center justify-content-center flex-column" style={{ width: 90, height: 90, backgroundColor: '#f0f7ff' }}>
                    <span className="fw-bold fs-4 text-primary">{consultas.length}</span><small className="text-muted" style={{ fontSize: 10 }}>Total</small>
                  </div>
                  <div className="d-flex justify-content-center gap-3 mt-3 small" style={{ fontSize: 12 }}>
                    <span className="text-primary fw-bold">● Perros {perros} ({pct(perros)}%)</span>
                    <span className="text-success fw-bold">● Gatos {gatos} ({pct(gatos)}%)</span>
                  </div>
                </div>
              </Card>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h6 className="fw-bold text-dark mb-3">📁 Últimos registros clínicos</h6>
                {consultasFiltradas.slice(0, 3).map((h) => (
                  <div key={h.id} className="small border-bottom py-2 text-secondary">{fmtFecha(h.fecha)} — <span className="text-dark fw-semibold">{mascotaDe(h.mascotaId).nombre}</span>: {h.motivo}</div>
                ))}
                <Button className="w-100 mt-3 rounded-3 border-0 fw-semibold" style={{ backgroundColor: '#1565c0' }} size="sm" onClick={() => setSeccionActiva('historial')}>Ver todos mis historiales</Button>
              </Card>
            </Col>
          </Row>
        )}

        {/* ============ AGENDA ============ */}
        {seccionActiva === 'agenda' && (
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="p-4" style={{ background: 'linear-gradient(120deg, #eff6ff, #ffffff)', borderBottom: '1px solid #e5edf7' }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div><h4 className="fw-bold mb-1" style={{ color: '#173b70' }}>📅 Agenda médica</h4><p className="text-secondary small mb-0">Administra las citas y el seguimiento de tus pacientes.</p></div>
                <Button size="sm" className="rounded-pill px-3 fw-semibold border-0" style={{ backgroundColor: '#2563eb' }} onClick={simularSolicitudCliente}>+ Nueva solicitud de prueba</Button>
              </div>
            </div>
            <Card.Body className="p-4">
              <Row className="g-2 mb-4">
                <Col lg={7}><Form.Control type="search" placeholder="🔍 Buscar por mascota, tutor o motivo..." className="rounded-3 py-2" value={busquedaAgenda} onChange={(e) => setBusquedaAgenda(e.target.value)} /></Col>
                <Col lg={3}>
                  <Form.Select className="rounded-3 py-2" value={filtroAgenda} onChange={(e) => setFiltroAgenda(e.target.value)}>
                    {['Todas', 'Pendiente', 'Confirmada', 'En atención', 'Reprogramación sugerida', 'Completada', 'Rechazada', 'Cancelada'].map((e) => (<option key={e} value={e}>{e === 'Todas' ? 'Todos los estados' : e}</option>))}
                  </Form.Select>
                </Col>
                <Col lg={2}><Button variant="outline-secondary" className="w-100 rounded-3 py-2" onClick={() => { setBusquedaAgenda(''); setFiltroAgenda('Todas'); }}>Limpiar</Button></Col>
              </Row>
              {solicitudes.length > 0 && (
                <Alert variant="warning" className="rounded-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2 bg-warning bg-opacity-10 text-warning-emphasis">
                  <div><strong>🔔 Tienes {solicitudes.length} solicitud(es) pendientes.</strong><div className="small">Revisa la disponibilidad y responde a tus clientes.</div></div>
                  <Button size="sm" variant="warning" className="rounded-pill fw-bold" onClick={() => setModal({ tipo: 'solicitudes' })}>Revisar solicitudes</Button>
                </Alert>
              )}
              <Table responsive hover className="align-middle mb-0">
                <thead><tr style={{ backgroundColor: '#f8fafc' }}><th className="py-3 text-secondary small">FECHA Y HORA</th><th className="py-3 text-secondary small">PACIENTE</th><th className="py-3 text-secondary small">TUTOR</th><th className="py-3 text-secondary small">MOTIVO</th><th className="py-3 text-secondary small">ESTADO</th><th className="py-3 text-secondary small" style={{ minWidth: 220 }}>ACCIONES</th></tr></thead>
                <tbody>
                  {agendaFiltrada.length === 0 && <tr><td colSpan={6} className="text-center py-5"><div style={{ fontSize: 38 }}>📅</div><h6 className="fw-bold mt-2">No encontramos citas</h6><p className="text-muted small mb-0">Prueba cambiando los filtros.</p></td></tr>}
                  {agendaFiltrada.map((c) => {
                    const m = mascotaDe(c.mascotaId);
                    const prob = c.estado === 'Pendiente' ? conflicto(c.fecha, c.hora, c.id) : null;
                    return (
                      <tr key={c.id} style={{ transition: 'background-color 0.2s' }}>
                        <td><div className="fw-semibold text-dark small">{fmtFecha(c.fecha)}</div><div className="text-primary small fw-bold mt-1">🕒 {fmtHora(c.hora)}</div></td>
                        <td><div className="d-flex align-items-center gap-2"><div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, minWidth: 40, backgroundColor: '#eaf2ff', fontSize: 20 }}>{m.especie?.includes('Gato') ? '🐱' : '🐶'}</div><div><div className="fw-bold text-dark">{m.nombre || 'Mascota'}</div><small className="text-muted">{c.nota || 'Sin observaciones'}</small></div></div></td>
                        <td><div className="fw-semibold small">{m.tutor || 'Sin tutor'}</div><small className="text-muted">{m.telefono || 'Sin teléfono'}</small></td>
                        <td><Badge bg={colorMotivo[c.motivo] || 'secondary'} className="rounded-pill px-3 py-2">{c.motivo}</Badge></td>
                        <td><Badge bg={colorEstado[c.estado] || 'secondary'} text={c.estado === 'Pendiente' ? 'dark' : undefined} className="rounded-pill px-3 py-2">{c.estado}</Badge>{c.sugerencia && <div className="small text-primary mt-2"><strong>Propuesta:</strong><div>{fmtFecha(c.sugerencia.fecha)} {fmtHora(c.sugerencia.hora)}</div></div>}{prob && <div className="small text-danger mt-2">⚠ {prob}</div>}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {c.estado === 'Pendiente' && (<><Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => confirmarCita(c)}>✓ Confirmar</Button><Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => abrirReprogramar(c)}>Reprogramar</Button></>)}
                            {c.estado === 'Confirmada' && (<><Button size="sm" variant="primary" className="rounded-pill px-3" onClick={() => iniciarAtencion(c)}>Atender</Button><Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => abrirReprogramar(c)}>Cambiar hora</Button></>)}
                            {c.estado === 'En atención' && (<Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => setModal({ tipo: 'finalizar', cita: c })}>Finalizar consulta</Button>)}
                            {c.estado === 'Reprogramación sugerida' && (<><Badge bg="info" className="rounded-pill p-2">Esperando respuesta</Badge><Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => { actualizarCita(c.id, { estado: 'Pendiente', sugerencia: null }); mostrarNotificacion('info', 'Vuelta a pendiente.'); }}>Cancelar prop.</Button></>)}
                            {c.estado === 'Completada' && (<Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => { setBusquedaHist(m.nombre); setSeccionActiva('historial'); }}>Ver historial</Button>)}
                            {['Rechazada', 'Cancelada'].includes(c.estado) && (<span className="text-muted small">Sin acciones</span>)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* ============ PACIENTES ============ */}
        {seccionActiva === 'pacientes' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h4 className="fw-bold text-dark mb-0">🐾 Pacientes</h4>
              <Form.Check type="switch" id="solo-atendidos" label="Solo mascotas atendidas" checked={verSoloAtendidos} onChange={(e) => setVerSoloAtendidos(e.target.checked)} />
            </div>
            <Table responsive hover className="align-middle">
              <thead className="table-light"><tr><th>Mascota</th><th>Especie / Raza</th><th>Edad · Sexo</th><th>Peso</th><th>Tutor</th><th>Vacunas</th><th>Alergias</th><th>Atenciones</th><th>Última visita</th><th></th></tr></thead>
              <tbody>
                {pacientesVista.map((p) => {
                  const hist = consultas.filter((c) => c.mascotaId === p.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
                  const trat = tratamientos.filter((t) => t.mascotaId === p.id && t.estado === 'En curso').length;
                  return (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.nombre}{trat > 0 && <Badge bg="info" className="ms-1 rounded-pill">💊 {trat}</Badge>}</td>
                      <td>{p.especie}<div className="small text-muted">{p.raza}</div></td>
                      <td>{p.edad}<div className="small text-muted">{p.sexo} · Esterilizado: {p.esterilizado}</div></td>
                      <td>{p.peso}</td>
                      <td>{p.tutor}<div className="small text-muted">{p.telefono}</div></td>
                      <td><Badge bg={p.vacunas === 'Al día' ? 'success' : 'warning'} text={p.vacunas === 'Al día' ? undefined : 'dark'} className="rounded-pill">{p.vacunas}</Badge></td>
                      <td className="small">{p.alergias}</td>
                      <td><Badge bg="primary" pill>{hist.length}</Badge></td>
                      <td className="small">{hist[0] ? fmtFecha(hist[0].fecha) : '—'}</td>
                      <td><Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => setModal({ tipo: 'expediente', mascota: p })}>Ver expediente</Button></td>
                    </tr>
                  );
                })}
                {pacientesVista.length === 0 && <tr><td colSpan={10} className="text-center text-muted py-4">Aún no has atendido mascotas.</td></tr>}
              </tbody>
            </Table>
          </Card>
        )}

        {/* ============ HISTORIAL ============ */}
        {seccionActiva === 'historial' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="fw-bold text-dark mb-0">🩺 Expedientes e Historiales Clínicos</h4>
              <div className="d-flex gap-2">
                <Form.Control size="sm" className="rounded-pill" placeholder="🔍 Mascota, tutor o diagnóstico" value={busquedaHist} onChange={(e) => setBusquedaHist(e.target.value)} />
                <Button size="sm" variant="success" className="rounded-pill text-nowrap" disabled={!consultasFiltradas.length}>⬇ Exportar Excel/CSV</Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="table-light"><tr><th>Fecha</th><th>Paciente</th><th>Motivo</th><th>Diagnóstico</th><th>Tratamiento</th><th>Medicamentos</th><th>Próx. control</th><th>Vet.</th></tr></thead>
              <tbody>
                {consultasFiltradas.map((h) => {
                  const m = mascotaDe(h.mascotaId);
                  return (
                    <tr key={h.id}>
                      <td className="small">{fmtFecha(h.fecha)}<div className="text-muted">{fmtHora(h.hora)}</div></td>
                      <td className="fw-bold">{m.nombre}<div className="small text-muted fw-normal">{m.tutor}</div></td>
                      <td><Badge bg={colorMotivo[h.motivo] || 'secondary'} className="rounded-pill">{h.motivo}</Badge></td>
                      <td>{h.diagnostico}<div className="small text-muted">{h.peso && `${h.peso} kg`} {h.temperatura && `· ${h.temperatura} °C`}</div></td>
                      <td>{h.tratamiento}</td>
                      <td className="small">{(h.medicamentos || []).map((x) => x.nombre).join(', ') || '—'}</td>
                      <td className="small">{h.proximoControl ? fmtFecha(h.proximoControl) : '—'}</td>
                      <td className="small">{h.vet}</td>
                    </tr>
                  );
                })}
                {consultasFiltradas.length === 0 && <tr><td colSpan={8} className="text-center text-muted py-4">Sin registros clínicos.</td></tr>}
              </tbody>
            </Table>
          </Card>
        )}

        {/* ============ TRATAMIENTOS ============ */}
        {seccionActiva === 'tratamientos' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h4 className="fw-bold text-dark mb-0">💉 Control de Tratamientos y Medicación</h4>
              <Form.Select size="sm" className="rounded-pill w-auto" value={filtroTrat} onChange={(e) => setFiltroTrat(e.target.value)}>
                {['Todos', 'En curso', 'Finalizado', 'Suspendido'].map((e) => <option key={e}>{e}</option>)}
              </Form.Select>
            </div>
            <Row className="g-3 mb-3">
              {[['info', 'En curso'], ['success', 'Finalizado'], ['danger', 'Suspendido']].map(([c, e]) => (
                <Col md={4} key={e}><div className={`rounded-4 p-3 bg-${c} bg-opacity-10 text-${c} fw-bold text-center`}>{tratamientos.filter((t) => t.estado === e).length} {e.toLowerCase()}(s)</div></Col>
              ))}
            </Row>
            <Table responsive hover className="align-middle">
              <thead className="table-light"><tr><th>Paciente</th><th>Medicamento</th><th>Dosis · Vía</th><th>Frecuencia</th><th>Duración</th><th style={{ minWidth: 150 }}>Progreso</th><th>Indicaciones</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {tratFiltrados.map((t) => {
                  const d = diasTrat(t);
                  return (
                    <tr key={t.id}>
                      <td className="fw-bold">{mascotaDe(t.mascotaId).nombre}<div className="small text-muted fw-normal">{mascotaDe(t.mascotaId).tutor}</div></td>
                      <td>{t.nombre}</td>
                      <td>{t.dosis}<div className="small text-muted">{t.via}</div></td>
                      <td>{t.frecuencia}</td>
                      <td className="small">{t.duracionDias} días<div className="text-muted">{fmtFecha(t.inicio)} → {fmtFecha(d.fin)}</div></td>
                      <td><ProgressBar now={t.estado === 'Finalizado' ? 100 : d.pct} variant={t.estado === 'Finalizado' ? 'success' : 'primary'} style={{ height: 8 }} /><small className="text-muted">Día {d.transcurridos}/{t.duracionDias}</small></td>
                      <td className="small">{t.indicaciones || '—'}</td>
                      <td><Badge bg={t.estado === 'En curso' ? 'info' : t.estado === 'Finalizado' ? 'success' : 'danger'} className="rounded-pill">{t.estado}</Badge></td>
                      <td>
                        {t.estado === 'En curso' && (
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-success" className="rounded-pill" onClick={() => cambiarEstadoTratamiento(t, 'Finalizado')}>Finalizar</Button>
                            <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => cambiarEstadoTratamiento(t, 'Suspendido')}>Suspender</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tratFiltrados.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Sin tratamientos activos.</td></tr>}
              </tbody>
            </Table>
          </Card>
        )}

        {/* ============ DISPONIBILIDAD ============ */}
        {seccionActiva === 'disponibilidad' && (
          <Row className="g-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h4 className="fw-bold text-dark mb-3">⚙️ Horario semanal</h4>
                <Table size="sm" className="align-middle">
                  <thead><tr><th>Día</th><th>Atiende</th><th>Desde</th><th>Hasta</th></tr></thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 0].map((i) => (
                      <tr key={i}>
                        <td className="fw-bold">{DIAS[i]}</td>
                        <td><Form.Check type="switch" checked={horario[i]?.activo} onChange={(e) => setHorario({ ...horario, [i]: { ...horario[i], activo: e.target.checked } })} /></td>
                        <td><Form.Control type="time" size="sm" disabled={!horario[i]?.activo} value={horario[i]?.inicio || '08:00'} onChange={(e) => setHorario({ ...horario, [i]: { ...horario[i], inicio: e.target.value } })} /></td>
                        <td><Form.Control type="time" size="sm" disabled={!horario[i]?.activo} value={horario[i]?.fin || '17:00'} onChange={(e) => setHorario({ ...horario, [i]: { ...horario[i], fin: e.target.value } })} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Row className="g-3">
                  <Col md={6}><Form.Label className="fw-bold small">Descanso / almuerzo</Form.Label><div className="d-flex gap-2"><Form.Control type="time" size="sm" value={almuerzo.inicio} onChange={(e) => setAlmuerzo({ ...almuerzo, inicio: e.target.value })} /><Form.Control type="time" size="sm" value={almuerzo.fin} onChange={(e) => setAlmuerzo({ ...almuerzo, fin: e.target.value })} /></div></Col>
                  <Col md={6}><Form.Label className="fw-bold small">Duración de cada cita</Form.Label><Form.Select size="sm" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>{[20, 30, 45, 60].map((d) => <option key={d} value={d}>{d} minutos</option>)}</Form.Select></Col>
                </Row>
                <Button className="rounded-pill px-4 fw-bold border-0 mt-3" style={{ backgroundColor: '#0288d1' }} onClick={guardarDisponibilidad}>Guardar cambios</Button>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold mb-3">Estado actual</h5>
                <Form.Select className="rounded-pill mb-3" value={estadoVet} onChange={(e) => setEstadoVet(e.target.value)}>
                  <option value="disponible">🟢 Disponible para consultas</option>
                  <option value="cirugia">🔴 En cirugía / quirófano</option>
                  <option value="descanso">🟡 En turno de descanso</option>
                </Form.Select>
                <Form.Check type="switch" id="urg" label="Aceptar urgencias fuera de agenda" checked={aceptaUrgencias} onChange={(e) => setAceptaUrgencias(e.target.checked)} />
              </Card>
              <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-3">Bloqueos y ausencias</h5>
                {bloqueos.map((b) => (
                  <div key={b.id} className="d-flex justify-content-between align-items-center border rounded-3 p-2 mb-2 small">
                    <div><b>{fmtFecha(b.fecha)}</b> · {fmtHora(b.inicio)}–{fmtHora(b.fin)}<div className="text-muted">{b.motivo || 'No disponible'}</div></div>
                    <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => setBloqueos((p) => p.filter((x) => x.id !== b.id))}>✕</Button>
                  </div>
                ))}
                <div className="d-flex flex-column gap-2 mt-2">
                  <Form.Control type="date" size="sm" value={nuevoBloqueo.fecha} onChange={(e) => setNuevoBloqueo({ ...nuevoBloqueo, fecha: e.target.value })} />
                  <div className="d-flex gap-2">
                    <Form.Control type="time" size="sm" value={nuevoBloqueo.inicio} onChange={(e) => setNuevoBloqueo({ ...nuevoBloqueo, inicio: e.target.value })} />
                    <Form.Control type="time" size="sm" value={nuevoBloqueo.fin} onChange={(e) => setNuevoBloqueo({ ...nuevoBloqueo, fin: e.target.value })} />
                  </div>
                  <Form.Control size="sm" placeholder="Motivo (vacaciones, cirugía, capacitación...)" value={nuevoBloqueo.motivo} onChange={(e) => setNuevoBloqueo({ ...nuevoBloqueo, motivo: e.target.value })} />
                  <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => { if (aMin(nuevoBloqueo.fin) <= aMin(nuevoBloqueo.inicio)) { mostrarNotificacion('error', 'La hora final debe ser mayor que la inicial.'); return; } setBloqueos((p) => [...p, { ...nuevoBloqueo, id: Date.now() }]); mostrarNotificacion('success', 'Bloqueo agregado.'); }}>+ Agregar bloqueo</Button>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* ===================== MODALES ===================== */}
      <Modal show={modal?.tipo === 'solicitudes'} onHide={() => setModal(null)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>🔔 Solicitudes de cita pendientes</Modal.Title></Modal.Header>
        <Modal.Body>
          {solicitudes.length === 0 && <p className="text-muted mb-0">No hay solicitudes pendientes.</p>}
          {solicitudes.map((c) => {
            const m = mascotaDe(c.mascotaId);
            const prob = conflicto(c.fecha, c.hora, c.id);
            return (
              <div key={c.id} className="border rounded-3 p-3 mb-2 d-flex justify-content-between align-items-center gap-2">
                <div className="small"><b>{m.nombre}</b> ({m.tutor}) — {c.motivo}<br />{fmtFecha(c.fecha)} {fmtHora(c.hora)}{prob ? <div className="text-danger">⚠ {prob}</div> : <div className="text-success">✔ Horario libre</div>}</div>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="success" className="rounded-pill" onClick={() => confirmarCita(c)}>Confirmar</Button>
                  <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => abrirReprogramar(c)}>Proponer otro</Button>
                </div>
              </div>
            );
          })}
        </Modal.Body>
      </Modal>

      <Modal show={modal?.tipo === 'reprogramar'} onHide={() => setModal(null)} centered>
        <Modal.Header closeButton><Modal.Title>Sugerir nuevo horario</Modal.Title></Modal.Header>
        <Modal.Body>
          {modal?.tipo === 'reprogramar' && (<>
            <p className="small text-muted">Cita de <b>{mascotaDe(modal.cita.mascotaId).nombre}</b> Pendiente para {fmtFecha(modal.cita.fecha)} a las {fmtHora(modal.cita.hora)}. Ya cargamos el primer espacio libre de tu agenda.</p>
            <Row className="g-2 mb-2">
              <Col><Form.Label className="small fw-bold">Fecha</Form.Label><Form.Control type="date" min={HOY} value={formReprog.fecha} onChange={(e) => setFormReprog({ ...formReprog, fecha: e.target.value })} /></Col>
              <Col><Form.Label className="small fw-bold">Hora</Form.Label><Form.Control type="time" value={formReprog.hora} onChange={(e) => setFormReprog({ ...formReprog, hora: e.target.value })} /></Col>
            </Row>
            {conflicto(formReprog.fecha, formReprog.hora, modal.cita.id) && <div className="small text-danger mb-2">⚠ {conflicto(formReprog.fecha, formReprog.hora, modal.cita.id)}</div>}
            <Form.Label className="small fw-bold">Mensaje para el cliente</Form.Label>
            <Form.Control as="textarea" rows={3} value={formReprog.mensaje} onChange={(e) => setFormReprog({ ...formReprog, mensaje: e.target.value })} />
          </>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setModal(null)}>Cancelar</Button>
          <Button variant="outline-danger" onClick={() => { actualizarCita(modal.cita.id, { estado: 'Pendiente', sugerencia: null }); setModal(null); mostrarNotificacion('info', 'Vuelta a pendiente sin alternativa.'); }}>Rechazar sin alternativa</Button>
          <Button variant="primary" onClick={enviarSugerencia}>Enviar sugerencia</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modal?.tipo === 'finalizar'} onHide={() => setModal(null)} centered size="lg" scrollable>
        <Modal.Header closeButton><Modal.Title>Finalizar consulta — {modal?.cita && mascotaDe(modal.cita.mascotaId).nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
          {modal?.tipo === 'finalizar' && (<Form>
            <Row className="g-2 mb-2">
              <Col md={3}><Form.Label className="small fw-bold">Peso (kg) *</Form.Label><Form.Control isInvalid={!!erroresForm.peso} value={formConsulta.peso} onChange={(e) => setFormConsulta({ ...formConsulta, peso: e.target.value })} /><Form.Control.Feedback type="invalid">{erroresForm.peso}</Form.Control.Feedback></Col>
              <Col md={3}><Form.Label className="small fw-bold">Temp. (°C)</Form.Label><Form.Control value={formConsulta.temperatura} onChange={(e) => setFormConsulta({ ...formConsulta, temperatura: e.target.value })} /></Col>
              <Col md={6}><Form.Label className="small fw-bold">Próximo control</Form.Label><Form.Control type="date" min={HOY} value={formConsulta.proximoControl} onChange={(e) => setFormConsulta({ ...formConsulta, proximoControl: e.target.value })} /></Col>
            </Row>
            <Form.Label className="small fw-bold">Diagnóstico *</Form.Label>
            <Form.Control as="textarea" rows={2} className="mb-2" isInvalid={!!erroresForm.diagnostico} value={formConsulta.diagnostico} onChange={(e) => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })} />
            <Form.Control.Feedback type="invalid">{erroresForm.diagnostico}</Form.Control.Feedback>
            <Form.Label className="small fw-bold">Tratamiento / procedimiento realizado</Form.Label>
            <Form.Control as="textarea" rows={2} className="mb-2" value={formConsulta.tratamiento} onChange={(e) => setFormConsulta({ ...formConsulta, tratamiento: e.target.value })} />
            <Form.Label className="small fw-bold">Observaciones y recomendaciones al tutor</Form.Label>
            <Form.Control as="textarea" rows={2} className="mb-3" value={formConsulta.observaciones} onChange={(e) => setFormConsulta({ ...formConsulta, observaciones: e.target.value })} />
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">💊 Medicamentos formulados</h6>
              <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => setFormConsulta({ ...formConsulta, medicamentos: [...(formConsulta.medicamentos || []), { ...medVacio }] })}>+ Agregar</Button>
            </div>
            {(formConsulta.medicamentos || []).map((m, i) => (
              <div key={i} className="border rounded-3 p-2 mb-2 bg-light">
                <Row className="g-2">
                  <Col md={4}><Form.Control size="sm" placeholder="Medicamento" value={m.nombre} onChange={(e) => setMed(i, 'nombre', e.target.value)} /></Col>
                  <Col md={2}><Form.Control size="sm" placeholder="Dosis" value={m.dosis} onChange={(e) => setMed(i, 'dosis', e.target.value)} /></Col>
                  <Col md={3}><Form.Control size="sm" placeholder="Frecuencia (c/8 h)" value={m.frecuencia} onChange={(e) => setMed(i, 'frecuencia', e.target.value)} /></Col>
                  <Col md={2}><Form.Control size="sm" type="number" min={1} placeholder="Días" value={m.duracionDias} onChange={(e) => setMed(i, 'duracionDias', Number(e.target.value))} /></Col>
                  <Col md={1}><Button size="sm" variant="outline-danger" className="w-100" onClick={() => setFormConsulta({ ...formConsulta, medicamentos: formConsulta.medicamentos.filter((_, k) => k !== i) })}>✕</Button></Col>
                  <Col md={4}><Form.Select size="sm" value={m.via} onChange={(e) => setMed(i, 'via', e.target.value)}>{['Oral', 'Oftálmica', 'Ótica', 'Tópica', 'Inyectable', 'Subcutánea'].map((v) => <option key={v}>{v}</option>)}</Form.Select></Col>
                  <Col md={8}><Form.Control size="sm" placeholder="Indicaciones (con comida, refrigerar...)" value={m.indicaciones} onChange={(e) => setMed(i, 'indicaciones', e.target.value)} /></Col>
                </Row>
              </div>
            ))}
          </Form>)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setModal(null); setErroresForm({}); }}>Cancelar</Button>
          <Button variant="success" onClick={guardarConsulta}>Guardar y finalizar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modal?.tipo === 'expediente'} onHide={() => setModal(null)} centered size="lg" scrollable>
        <Modal.Header closeButton><Modal.Title>Expediente — {modal?.mascota?.nombre}</Modal.Title></Modal.Header>
        <Modal.Body>
          {modal?.tipo === 'expediente' && (() => {
            const p = modal.mascota;
            const hist = consultas.filter((c) => c.mascotaId === p.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
            const trat = tratamientos.filter((t) => t.mascotaId === p.id);
            return (<>
              <Row className="small g-2 mb-3">
                <Col md={4}><b>Especie:</b> {p.especie}</Col><Col md={4}><b>Raza:</b> {p.raza}</Col><Col md={4}><b>Edad:</b> {p.edad}</Col>
                <Col md={4}><b>Sexo:</b> {p.sexo}</Col><Col md={4}><b>Peso:</b> {p.peso}</Col><Col md={4}><b>Esterilizado:</b> {p.esterilizado}</Col>
                <Col md={4}><b>Tutor:</b> {p.tutor}</Col><Col md={4}><b>Teléfono:</b> {p.telefono}</Col><Col md={4}><b>Vacunas:</b> {p.vacunas}</Col>
                <Col md={12}><b>Alergias:</b> {p.alergias}</Col>
              </Row>
              <h6 className="fw-bold mt-3">Consultas ({hist.length})</h6>
              {hist.map((h) => <div key={h.id} className="small border-bottom py-2">{fmtFecha(h.fecha)} — <b>{h.motivo}</b>: {h.diagnostico}</div>)}
              {hist.length === 0 && <p className="small text-muted">Sin consultas registradas.</p>}
              <h6 className="fw-bold mt-3">Tratamientos ({trat.length})</h6>
              {trat.map((t) => <div key={t.id} className="small border-bottom py-2">{t.nombre} — {t.dosis}, {t.frecuencia} ({t.estado})</div>)}
              {trat.length === 0 && <p className="small text-muted">Sin tratamientos.</p>}
            </>);
          })()}
        </Modal.Body>
      </Modal>
    </div>
  );
};