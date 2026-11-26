import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3001';

/* ===================== API HELPERS ===================== */
const api = {
  get: async (recurso) => {
    const res = await fetch(`${API_URL}/${recurso}`);
    if (!res.ok) throw new Error(`Error al consultar ${recurso}`);
    return res.json();
  },
  patch: async (recurso, id, datos) => {
    const res = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error(`Error al actualizar ${recurso}`);
    return res.json();
  },
  post: async (recurso, datos) => {
    const res = await fetch(`${API_URL}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error(`Error al guardar en ${recurso}`);
    return res.json();
  }
};

/* ===================== NOTIFICACIONES TOAST ===================== */
const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true,
  didOpen: (toast) => { toast.addEventListener("mouseenter", Swal.stopTimer); toast.addEventListener("mouseleave", Swal.resumeTimer); }
});
const mostrarNotificacion = (icon, texto) => Toast.fire({ icon, title: texto });

/* ===================== CSS ===================== */
const CSS = `
.od-layout { display: flex; min-height: 100vh; background: #f0f4f8; font-family: 'Poppins', system-ui, -apple-system, sans-serif; }
.od-sidebar { width: 260px; flex-shrink: 0; background: #ffffff; border-right: 1px solid #e2e8f0; padding: 20px 16px; display: flex; flex-direction: column; }
.od-logo { width: 110px; margin: 0 auto 24px auto; display: block; border-radius: 8px; }
.od-nav { display: flex; flex-direction: column; gap: 8px; }
.od-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #64748b; font-weight: 600; font-size: 0.9rem; text-decoration: none; text-align: left; transition: all .2s ease; cursor: pointer; }
.od-nav-item:hover { background: #f8fafc; border-color: #cbd5e1; }
.od-nav-item.active { background: #e0f2fe; color: #0369a1; border-color: #7dd3fc; box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1); }
.od-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; margin-top: 12px; border: 1px solid #fee2e2; border-radius: 12px; background: #ffffff; color: #ef4444; font-weight: 700; font-size: 0.9rem; text-align: left; transition: all .2s ease; cursor: pointer; }
.od-logout:hover { background: #fef2f2; border-color: #fca5a5; }
.od-calendar { padding: 16px; background: #ffffff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
.od-cal-title { color: #0369a1; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.od-cal-nav { border: 0; background: transparent; font-weight: bold; color: #0369a1; cursor: pointer; font-size: 1.1rem; padding: 0 8px; }
.od-cal-nav:hover { background: #f1f5f9; border-radius: 50%; }
.od-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 0.75rem; margin-top: 12px; }
.od-cal-head { font-weight: 700; color: #94a3b8; }
.od-cal-day { padding: 4px 0; border-radius: 50%; position: relative; color: #475569; transition: all 0.2s; }
.od-cal-day.today { background: #0ea5e9; color: #fff; font-weight: 700; }
.od-main { flex: 1; padding: 24px 32px; min-width: 0; overflow-y: auto; max-height: 100vh; }
.od-header-title { font-size: 1.5rem; font-weight: 800; color: #0f2b5c; margin: 0; }
.od-header-sub { color: #64748b; font-size: 0.85rem; }
.od-user-card { display: flex; align-items: center; gap: 12px; background: #ffffff; padding: 8px 16px; border-radius: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f1f5f9; }
.od-avatar { width: 40px; height: 40px; border-radius: 50%; background: #0ea5e9; color: #fff; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
.od-bell { position: relative; width: 40px; height: 40px; border: 1px solid #f1f5f9; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; font-size: 1.1rem; }
.od-bell-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
.od-banner { position: relative; overflow: hidden; min-height: 160px; display: flex; align-items: center; border-radius: 16px; padding: 25px 30px; margin-bottom: 24px; background: linear-gradient(90deg, #c3dafe 0%, #dbeafe 60%, #eff6ff 100%); }
.od-banner-content { position: relative; z-index: 2; max-width: 65%; }
.od-banner h2 { color: #0f2b5c; font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; }
.od-banner p { color: #475569; font-size: 0.95rem; font-weight: 500; }
.od-banner .btn { color: #0f2b5c !important; font-weight: 700; }
.od-banner-dog { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: right center; z-index: 0; opacity: 0.6; }
.od-card { background: #ffffff; border-radius: 16px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
.od-stat-card { background: #ffffff; border-radius: 16px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease; }
.od-stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.06); }
.od-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.od-stat-val { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.od-stat-lbl { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.od-table { margin: 0; font-size: 0.9rem; }
.od-table thead th { background: #f8fafc; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding: 12px 16px; }
.od-table tbody td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.od-search { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; font-size: 0.9rem; }
.od-search:focus { background: #ffffff; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); outline: none; }
.btn-primary-custom { background: #0ea5e9; color: #fff; font-weight: 600; border-radius: 12px; border: 0; padding: 10px 20px; transition: all 0.2s; }
.btn-primary-custom:hover { background: #0284c7; color: #fff; }
@media (max-width: 991px) { .od-layout { flex-direction: column; } .od-sidebar { width: 100%; border-right: 0; border-bottom: 1px solid #e2e8f0; } .od-main { padding: 16px; max-height: none; } .od-banner-dog { display: none; } }
`;

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

/* ===================== COMPONENTES REUTILIZABLES ===================== */
function BannerSeccion({ titulo, subtitulo }) {
  return (
    <section className="od-banner">
      <div className="od-banner-content">
        <h2>{titulo}</h2>
        <p>{subtitulo}</p>
      </div>
      <img src="/Barra.jpeg" alt="Mascota" className="od-banner-dog" onError={(e) => { e.target.style.display = 'none'; }} />
    </section>
  );
}

function ResumenRecepcion({ citasHoy, pagosPendientes, pacientesNuevos, facturasMes, pqrsPendientes }) {
  const tarjetas = [
    { titulo: 'Citas Hoy', valor: citasHoy, icono: '📅', color: '#2563eb', fondo: '#eff6ff' },
    { titulo: 'PQRS Pendientes', valor: pqrsPendientes, icono: '📝', color: '#d97706', fondo: '#fffbeb' },
    { titulo: 'Pacientes Nuevos', valor: pacientesNuevos, icono: '🐾', color: '#059669', fondo: '#ecfdf5' },
    { titulo: 'Facturas Mes', valor: facturasMes, icono: '📄', color: '#0891b2', fondo: '#ecfeff' }
  ];
  return (
    <div className="row g-3 mb-4">
      {tarjetas.map((item, index) => (
        <div className="col-12 col-sm-6 col-xl-3" key={index}>
          <div className="od-stat-card" style={{ background: item.fondo }}>
            <div className="od-stat-icon" style={{ background: '#ffffff', color: item.color }}>{item.icono}</div>
            <div>
              <div className="od-stat-val" style={{ color: item.color }}>{item.valor}</div>
              <div className="od-stat-lbl">{item.titulo}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniCalendario() {
  const [ref, setRef] = useState(new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const hoy = new Date().getDate();
  const celdas = useMemo(() => {
    const primerDia = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    return [...Array(primerDia).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [year, month]);

  return (
    <div className="od-calendar">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="od-cal-nav" onClick={() => setRef(new Date(year, month - 1, 1))}>‹</button>
        <span className="od-cal-title"> {MESES[month]} {year}</span>
        <button className="od-cal-nav" onClick={() => setRef(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="od-cal-grid">
        {DIAS.map((d) => (<span key={d} className="od-cal-head">{d}</span>))}
        {celdas.map((d, i) => d ? (
          <span key={i} className={`od-cal-day ${d === hoy ? "today" : ""}`}>{d}</span>
        ) : (<span key={i} />))}
      </div>
    </div>
  );
}

/* ===================== COMPONENTE PRINCIPAL ===================== */
export const RecepcionDashboard = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [busqueda, setBusqueda] = useState('');
  
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [consultasRecepcion, setConsultasRecepcion] = useState([]);
  const [pqrs, setPqrs] = useState([]); // 👈 NUEVO ESTADO PARA PQRS
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Gestión de PQRS
  const [pqrsSeleccionada, setPqrsSeleccionada] = useState(null);
  const [formRespuesta, setFormRespuesta] = useState({ estado: 'Pendiente', respuesta: '' });

  // 1. Cargar datos reales de la base de datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [citasData, mascotasData, pagosData, consultasData, pqrsData] = await Promise.all([
          api.get('citas'), api.get('mascotas'), api.get('pagos'), api.get('consultas_recepcion'), api.get('pqrs')
        ]);
        setCitas(citasData);
        setMascotas(mascotasData);
        setPagos(pagosData);
        setConsultasRecepcion(consultasData);
        setPqrs(pqrsData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))); // Ordenar por fecha descendente
      } catch (error) {
        console.error(error);
        mostrarNotificacion('error', 'Error al cargar datos del servidor');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // 2. Unir citas con datos de mascotas
  const citasConDetalles = useMemo(() => {
    return citas.map(c => {
      const mascota = mascotas.find(m => String(m.id) === String(c.mascotaId)) || {};
      return {
        ...c,
        paciente: mascota.nombre || 'Desconocido',
        dueno: mascota.tutor || 'Desconocido',
        rol: c.rol || 'Veterinario'
      };
    });
  }, [citas, mascotas]);

  const citaActiva = citasConDetalles.find(c => c.estado === 'Pendiente' || c.estado === 'Confirmada') || citasConDetalles[0];
  const pagosPendientesCount = pagos.filter(p => p.estado === 'Pendiente').length;
  const pqrsPendientesCount = pqrs.filter(p => p.estado === 'Pendiente' || p.estado === 'En proceso').length; // 👈 CONTADOR PQRS

  const citasFiltradas = citasConDetalles.filter(c =>
    c.dueno.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.paciente.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 3. ACCIONES FUNCIONALES
  const actualizarEstadoCita = async (id, nuevoEstado, mensajeExito) => {
    try {
      await api.patch('citas', id, { estado: nuevoEstado });
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
      mostrarNotificacion('success', mensajeExito);
    } catch {
      mostrarNotificacion('error', 'No se pudo actualizar la cita');
    }
  };

  const confirmarLlegada = (cita) => {
    Swal.fire({
      title: 'Confirmar llegada', text: `¿Confirmar la llegada de ${cita.paciente}?`, icon: 'question',
      showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, confirmar', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) actualizarEstadoCita(cita.id, 'Confirmada', `Llegada de ${cita.paciente} confirmada`);
    });
  };

  const cancelarCita = (cita) => {
    Swal.fire({
      title: 'Cancelar cita', text: `¿Estás seguro de cancelar la cita de ${cita.paciente}?`, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No, mantener'
    }).then((result) => {
      if (result.isConfirmed) actualizarEstadoCita(cita.id, 'Cancelada', `Cita de ${cita.paciente} cancelada`);
    });
  };

  const reprogramarCita = (cita) => {
    Swal.fire({
      title: 'Reprogramar cita',
      html: `<label class="form-label text-start d-block">Nueva Fecha</label><input type="date" class="form-control mb-3" id="nuevaFecha" value="${cita.fecha || ''}"><label class="form-label text-start d-block">Nueva Hora</label><input type="time" class="form-control" id="nuevaHora" value="${cita.hora || ''}">`,
      showCancelButton: true, confirmButtonColor: '#0ea5e9', cancelButtonColor: '#64748b',
      confirmButtonText: 'Reprogramar', cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const fecha = document.getElementById('nuevaFecha').value;
        const hora = document.getElementById('nuevaHora').value;
        if (!fecha || !hora) { Swal.showValidationMessage('Por favor completa fecha y hora'); return false; }
        return { fecha, hora };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.patch('citas', cita.id, { fecha: result.value.fecha, hora: result.value.hora, estado: 'Confirmada' });
          setCitas(prev => prev.map(c => c.id === cita.id ? { ...c, ...result.value, estado: 'Confirmada' } : c));
          mostrarNotificacion('success', `Cita de ${cita.paciente} reprogramada`);
        } catch { mostrarNotificacion('error', 'No se pudo reprogramar la cita'); }
      }
    });
  };

  const registrarPago = (cita) => {
    Swal.fire({
      title: 'Registrar Pago',
      html: `<label class="form-label text-start d-block">Paciente: <b>${cita.paciente}</b></label><label class="form-label text-start d-block">Monto ($)</label><input type="number" class="form-control mb-3" id="montoPago" placeholder="Ej: 80000"><label class="form-label text-start d-block">Método de Pago</label><select class="form-select" id="metodoPago"><option value="Efectivo">Efectivo</option><option value="Tarjeta">Tarjeta</option><option value="Transferencia">Transferencia</option></select>`,
      showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Registrar Pago', cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const monto = document.getElementById('montoPago').value;
        const metodo = document.getElementById('metodoPago').value;
        if (!monto || monto <= 0) { Swal.showValidationMessage('Ingresa un monto válido'); return false; }
        return { monto: Number(monto), metodo };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const nuevoPago = { citaId: cita.id, mascotaId: cita.mascotaId, dueno: cita.dueno, paciente: cita.paciente, monto: result.value.monto, metodo: result.value.metodo, estado: 'Pagado', fecha: new Date().toLocaleDateString('en-CA') };
          const pagoGuardado = await api.post('pagos', nuevoPago);
          setPagos(prev => [pagoGuardado, ...prev]);
          mostrarNotificacion('success', `Pago de $${nuevoPago.monto.toLocaleString()} registrado`);
        } catch { mostrarNotificacion('error', 'No se pudo registrar el pago'); }
      }
    });
  };

  const guardarConsultaRecepcion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevaConsulta = {
      cliente: formData.get('cliente'), telefono: formData.get('telefono'), tipo: formData.get('tipo'),
      descripcion: formData.get('descripcion'), fecha: new Date().toLocaleDateString('en-CA'), estado: 'Pendiente'
    };
    try {
      const consultaGuardada = await api.post('consultas_recepcion', nuevaConsulta);
      setConsultasRecepcion(prev => [consultaGuardada, ...prev]);
      mostrarNotificacion('success', 'Consulta interna registrada exitosamente');
      e.target.reset();
    } catch { mostrarNotificacion('error', 'No se pudo registrar la consulta'); }
  };

  // 👈 FUNCIONES DE GESTIÓN DE PQRS
  const abrirGestionPqrs = (p) => {
    setPqrsSeleccionada(p);
    setFormRespuesta({ estado: p.estado, respuesta: p.respuesta || '' });
  };

  const guardarGestionPqrs = async () => {
    try {
      await api.patch('pqrs', pqrsSeleccionada.id, {
        estado: formRespuesta.estado,
        respuesta: formRespuesta.respuesta
      });
      setPqrs(prev => prev.map(p => p.id === pqrsSeleccionada.id ? { ...p, ...formRespuesta } : p));
      setPqrsSeleccionada(null);
      mostrarNotificacion('success', 'PQRS actualizada correctamente');
    } catch {
      mostrarNotificacion('error', 'No se pudo actualizar la PQRS');
    }
  };

  const cerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?', text: '¿Estás seguro de que deseas salir del sistema?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) navigate('/login');
    });
  };

  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: '🐾' },
    { key: 'agenda', label: 'Agenda', icon: '📅' },
    { key: 'pacientes', label: 'Pacientes', icon: '🐶' },
    { key: 'pagos', label: 'Pagos & Recibos', icon: '💳' },
    { key: 'atencion', label: 'Atención al Cliente', icon: '⚙️', badge: pqrsPendientesCount } // 👈 BADGE EN MENÚ
  ];

  if (cargando) return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="od-layout">
      <style>{CSS}</style>

      <aside className="od-sidebar">
        <img src="/public/logo.jpeg" alt="Zoolomascotas MX" className="od-logo" onError={(e) => { e.target.src = '/Logo.jpg'; }} />
        <nav className="od-nav">
          {menu.map((item) => (
            <button key={item.key} className={`od-nav-item ${seccionActiva === item.key ? 'active' : ''}`} onClick={() => setSeccionActiva(item.key)}>
              <span>{item.icon}</span>
              <span className="flex-grow-1">{item.label}</span>
              {item.badge > 0 && <span className="badge rounded-pill bg-danger">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-3 mb-2"><MiniCalendario /></div>
        <button className="od-logout" onClick={cerrarSesion}><span>🚪</span> Cerrar Sesión</button>
      </aside>

      <main className="od-main">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="od-header-title">Zoolomascotas MX</h1>
            <span className="od-header-sub">Panel de Recepción</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* 👈 CAMPANITA CON CONTADOR DE PQRS */}
            <button className="od-bell" aria-label="Notificaciones" style={{ position: 'relative' }}>
              🔔
              {pqrsPendientesCount > 0 && <span className="od-bell-badge">{pqrsPendientesCount}</span>}
            </button>
            <div className="od-user-card">
              <div className="text-end">
                <div className="fw-bold" style={{ fontSize: "0.9rem", lineHeight: "1.1" }}>Lorena</div>
                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Recepcionista</small>
                <Badge bg="success" className="rounded-pill" style={{ fontSize: '10px' }}>Disponible</Badge>
              </div>
              <div className="od-avatar">L</div>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
        {seccionActiva === 'dashboard' && (
          <>
            <BannerSeccion titulo="¡Bienvenida, Lorena!" subtitulo="Gestiona citas, pagos y atención al cliente desde aquí." />
            <ResumenRecepcion citasHoy={citasConDetalles.length} pagosPendientes={pagosPendientesCount} pacientesNuevos={3} facturasMes={pagos.length} pqrsPendientes={pqrsPendientesCount} />

            <Row className="g-3 mb-4">
              <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  {citaActiva ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle border border-primary border-2 p-1" style={{ width: '50px', height: '50px', background: '#e0f2fe' }}>
                            <div className="w-100 h-100 rounded-circle d-flex align-items-center justify-content-center" style={{ fontSize: '1.5rem' }}>
                              {citaActiva.paciente.toLowerCase().includes('gato') || mascotas.find(m=>String(m.id)===String(citaActiva.mascotaId))?.especie?.includes('Gato') ? '🐱' : '🐕'}
                            </div>
                          </div>
                          <div>
                            <h5 className="fw-bold text-primary mb-0">{citaActiva.paciente}</h5>
                            <small className="text-muted">Dueño: {citaActiva.dueno} | 📍 Sede Principal</small>
                          </div>
                        </div>
                        <Badge bg={citaActiva.estado === 'Confirmada' ? 'success' : 'warning'} className="rounded-pill px-3 py-2">
                          Estado: {citaActiva.estado}
                        </Badge>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <Button variant="success" className="rounded-pill fw-bold flex-grow-1 border-0 py-2" onClick={() => confirmarLlegada(citaActiva)}>Confirmar Llegada</Button>
                        <Button variant="danger" className="rounded-pill fw-bold flex-grow-1 border-0 py-2" onClick={() => cancelarCita(citaActiva)}>Cancelar Cita</Button>
                        <Button variant="warning" className="rounded-pill fw-bold flex-grow-1 border-0 text-white py-2" onClick={() => reprogramarCita(citaActiva)}>Reprogramar</Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted">No hay citas pendientes para mostrar.</div>
                  )}
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                  <h6 className="fw-bold text-primary mb-2">Recibos De Pago</h6>
                  <div className="d-flex gap-2 mb-2">
                    <Form.Select size="sm" className="rounded-3 border">
                      <option>Consulta General</option>
                      <option>Baño y Corte</option>
                      <option>Vacunación</option>
                    </Form.Select>
                    <Form.Control size="sm" type="text" readOnly value="$ 80,000" className="fw-bold text-center border" />
                  </div>
                  <Button variant="success" className="w-100 rounded-pill fw-bold border-0 py-2 mt-auto" onClick={() => citaActiva && registrarPago(citaActiva)}>
                    Generar Factura
                  </Button>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Citas del día</h5>
                <Form.Control type="text" placeholder="🔍 Buscar por mascota o dueño..." className="od-search" style={{ maxWidth: '280px' }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr><th>Hora</th><th>Dueño</th><th>Paciente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.hora || 'N/A'}</td>
                      <td>{c.dueno}</td>
                      <td className="fw-bold">{c.paciente}</td>
                      <td>{c.motivo || c.servicio || 'N/A'}</td>
                      <td><Badge bg={c.estado === 'Confirmada' || c.estado === 'Atendida' ? 'success' : c.estado === 'Cancelada' ? 'danger' : 'warning'} className="rounded-pill px-3 py-1">{c.estado}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="rounded-pill me-1" onClick={() => confirmarLlegada(c)} title="Confirmar">✓</Button>
                        <Button size="sm" variant="outline-warning" className="rounded-pill" onClick={() => reprogramarCita(c)} title="Reprogramar">↻</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {/* AGENDA */}
        {seccionActiva === 'agenda' && (
          <>
            <BannerSeccion titulo="Agenda Completa" subtitulo="Visualiza y gestiona todas las citas programadas." />
            <ResumenRecepcion citasHoy={citasConDetalles.length} pagosPendientes={0} pacientesNuevos={0} facturasMes={0} pqrsPendientes={pqrsPendientesCount} />
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <Table responsive hover className="align-middle">
                <thead><tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>Dueño</th><th>Servicio</th><th>Profesional</th><th>Estado</th></tr></thead>
                <tbody>
                  {citasConDetalles.map((c) => (
                    <tr key={c.id}>
                      <td>{c.fecha}</td><td>{c.hora}</td><td className="fw-bold">{c.paciente}</td><td>{c.dueno}</td>
                      <td>{c.motivo || 'N/A'}</td><td>{c.rol}</td>
                      <td><Badge bg={c.estado === 'Confirmada' ? 'success' : c.estado === 'Cancelada' ? 'danger' : 'warning'} className="rounded-pill">{c.estado}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {/* PACIENTES */}
        {seccionActiva === 'pacientes' && (
          <>
            <BannerSeccion titulo="Pacientes Registrados" subtitulo="Consulta y gestiona la información de las mascotas." />
            <ResumenRecepcion citasHoy={0} pagosPendientes={0} pacientesNuevos={mascotas.length} facturasMes={0} pqrsPendientes={pqrsPendientesCount} />
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Lista de pacientes</h5>
                <Form.Control type="text" placeholder="🔍 Buscar paciente..." className="od-search" style={{ maxWidth: '300px' }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <Table responsive hover className="align-middle">
                <thead><tr><th>Nombre</th><th>Especie</th><th>Raza</th><th>Dueño</th><th>Teléfono</th></tr></thead>
                <tbody>
                  {mascotas.filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || m.tutor.toLowerCase().includes(busqueda.toLowerCase())).map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.nombre}</td><td>{p.especie}</td><td>{p.raza || 'Mestizo'}</td><td>{p.tutor}</td><td>{p.telefono || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {/* PAGOS */}
        {seccionActiva === 'pagos' && (
          <>
            <BannerSeccion titulo="Pagos y Recibos" subtitulo="Gestiona los pagos y genera facturas." />
            <ResumenRecepcion citasHoy={0} pagosPendientes={pagosPendientesCount} pacientesNuevos={0} facturasMes={pagos.length} pqrsPendientes={pqrsPendientesCount} />
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Historial de Pagos</h5>
                <Button className="btn-primary-custom" onClick={() => registrarPago(citaActiva || {})}>+ Nuevo Pago</Button>
              </div>
              <Row className="g-3">
                {pagos.map((pago) => (
                  <Col md={4} key={pago.id}>
                    <Card className="border h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">{pago.paciente}</h6>
                          <Badge bg={pago.estado === 'Pagado' ? 'success' : 'warning'} className="rounded-pill">{pago.estado}</Badge>
                        </div>
                        <p className="text-muted small mb-1">{pago.dueno} • {pago.fecha}</p>
                        <h4 className="text-primary fw-bold mb-3">${pago.monto.toLocaleString()}</h4>
                        <Button variant="outline-primary" className="w-100 rounded-pill" size="sm">📄 Ver Factura</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </>
        )}

        {/* ATENCIÓN AL CLIENTE (PQRS + CONSULTAS INTERNAS) */}
        {seccionActiva === 'atencion' && (
          <>
            <BannerSeccion titulo="Atención al Cliente" subtitulo="Gestiona las PQRS de los clientes y registra consultas internas." />
            <ResumenRecepcion citasHoy={0} pagosPendientes={pagosPendientesCount} pacientesNuevos={0} facturasMes={pagos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <Row className="g-4 mb-4">
              {/* 1. PQRS DE CLIENTES (VIENEN DEL SISTEMA) */}
              <Col lg={12}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">📥 PQRS de Clientes</h5>
                    <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">{pqrsPendientesCount} Pendientes</Badge>
                  </div>
                  <Table responsive hover className="align-middle">
                    <thead>
                      <tr><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {pqrs.length === 0 ? (
                        <tr><td colSpan="6" className="text-center text-muted py-3">No hay PQRS registradas aún.</td></tr>
                      ) : (
                        pqrs.map((p) => (
                          <tr key={p.id}>
                            <td className="small">{p.fecha}</td>
                            <td className="fw-semibold">{p.nombreCliente}</td>
                            <td><span className="od-chip">{p.tipo}</span></td>
                            <td>{p.asunto}</td>
                            <td>
                              <Badge bg={p.estado === 'Resuelto' ? 'success' : p.estado === 'En proceso' ? 'info' : 'warning'} className="rounded-pill px-3 py-1">
                                {p.estado}
                              </Badge>
                            </td>
                            <td>
                              <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => abrirGestionPqrs(p)}>
                                Gestionar
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card>
              </Col>

              {/* 2. CONSULTAS INTERNAS (REGISTRO MANUAL POR TELÉFONO/PRESENCIAL) */}
              <Col lg={12}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3">📝 Registrar Consulta Interna (Llamadas/Presencial)</h5>
                  <Form onSubmit={guardarConsultaRecepcion}>
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <Form.Label>Nombre del cliente</Form.Label>
                        <Form.Control type="text" name="cliente" placeholder="Ingrese nombre" required />
                      </Col>
                      <Col md={6}>
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control type="tel" name="telefono" placeholder="Ingrese teléfono" required />
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de consulta</Form.Label>
                      <Form.Select name="tipo" required>
                        <option value="">Seleccione...</option>
                        <option>Información general</option>
                        <option>Reclamo</option>
                        <option>Sugerencia</option>
                        <option>Seguimiento</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control as="textarea" name="descripcion" rows={3} placeholder="Describa la consulta o reclamo..." required />
                    </Form.Group>
                    <Button type="submit" className="btn-primary-custom">Registrar Consulta</Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </main>

      {/* 👈 MODAL PARA GESTIONAR PQRS */}
      {pqrsSeleccionada && (
        <Modal show={true} onHide={() => setPqrsSeleccionada(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Gestionar PQRS: {pqrsSeleccionada.tipo}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}><strong>Cliente:</strong> {pqrsSeleccionada.nombreCliente}</Col>
              <Col md={6}><strong>Fecha:</strong> {pqrsSeleccionada.fecha}</Col>
            </Row>
            <div className="mb-3 p-3 bg-light rounded-3">
              <strong>Asunto:</strong> {pqrsSeleccionada.asunto}<br/>
              <strong>Descripción:</strong> {pqrsSeleccionada.descripcion}
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select value={formRespuesta.estado} onChange={(e) => setFormRespuesta({...formRespuesta, estado: e.target.value})}>
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Resuelto">Resuelto</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Respuesta para el cliente</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={formRespuesta.respuesta} 
                onChange={(e) => setFormRespuesta({...formRespuesta, respuesta: e.target.value})}
                placeholder="Escribe aquí la respuesta o solución dada al cliente..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPqrsSeleccionada(null)}>Cancelar</Button>
            <Button variant="primary" onClick={guardarGestionPqrs}>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};