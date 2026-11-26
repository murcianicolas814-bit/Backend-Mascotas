import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Badge, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { backendRequest } from "../services/backendApi";

/* =====================================================================
   CONFIGURACIÓN Y RUTAS
   ===================================================================== */
const MOCK_API = "http://localhost:3001";
const LOGO = "/public/logo.jpeg";
const DOG_BANNER_IMG = "/Barra.jpeg";

const RUTAS = {
  panel: "/cliente",
  mascotas: "/cliente/mascotas",
  citas: "/cliente/citas",
  nuevaCita: "/cliente/citas/nueva",
  historial: "/cliente/historial",
  tratamientos: "/cliente/tratamientos",
  pqrs: "/cliente/pqrs",
  login: "/login",
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
.od-cal-day.has-cita { background: rgba(14, 165, 233, 0.1); color: #0369a1; font-weight: 700; }
.od-cal-day.has-cita::after { content: ""; position: absolute; left: 50%; bottom: 2px; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: #0ea5e9; }
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
.od-card-title { font-size: 1.05rem; font-weight: 700; color: #0f2b5c; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.od-stat-card { background: #ffffff; border-radius: 16px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.od-stat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.06); }
.od-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.od-stat-val { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.od-stat-lbl { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.od-cita-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; position: relative; transition: all 0.2s ease; box-shadow: 0 3px 10px rgba(0,0,0,0.02); }
.od-cita-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13,110,253,0.08); border-color: #bfdbfe; }
.od-modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1050; backdrop-filter: blur(4px); }
.od-modal { background: #fff; border-radius: 20px; width: 100%; max-width: 520px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
.od-table { margin: 0; font-size: 0.9rem; }
.od-table thead th { background: #f8fafc; color: #475569; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding: 12px 16px; }
.od-table tbody td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.od-search { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px; font-size: 0.9rem; }
.od-search:focus { background: #ffffff; border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); outline: none; }
.od-pet { display: flex; align-items: center; gap: 14px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px 18px; background: #ffffff; transition: all 0.2s; }
.od-pet:hover { border-color: #0ea5e9; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08); }
.od-pet-avatar { width: 60px; height: 60px; border-radius: 50%; background: #e0f2fe; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 2px solid #0ea5e9; }
.od-pet-avatar img { width: 100%; height: 100%; object-fit: cover; }
.od-chip { display: inline-block; font-size: 0.75rem; background: #f1f5f9; color: #475569; border-radius: 20px; padding: 4px 12px; margin-right: 6px; font-weight: 600; }
.od-donut-wrap { display: flex; justify-content: center; margin: 16px 0; }
.od-donut { width: 110px; height: 110px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.od-donut-inner { width: 80px; height: 80px; border-radius: 50%; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.od-donut-inner strong { font-size: 1.4rem; color: #0ea5e9; }
.od-donut-inner small { font-size: 0.7rem; color: #64748b; }
.btn-agenda { background: #0ea5e9; color: #fff; font-weight: 600; border-radius: 12px; border: 0; font-size: 0.85rem; padding: 10px; transition: all 0.2s; }
.btn-agenda:hover { background: #0284c7; color: #fff; }
.btn-primary-custom { background: #0ea5e9; color: #fff; font-weight: 600; border-radius: 12px; border: 0; padding: 10px 20px; transition: all 0.2s; }
.btn-primary-custom:hover { background: #0284c7; color: #fff; }
@media (max-width: 991px) { .od-layout { flex-direction: column; } .od-sidebar { width: 100%; border-right: 0; border-bottom: 1px solid #e2e8f0; } .od-main { padding: 16px; max-height: none; } .od-banner-dog { display: none; } }
`;

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const hoyISO = () => new Date().toLocaleDateString("en-CA");
const norm = (s = "") => String(s ?? "").trim().toLowerCase();
const INACTIVA = /rechaz|cancel|finaliz|atendid|complet|no_asisti/i;

const normalizarEspecie = (especie = "") => {
  const clave = String(especie).trim().toUpperCase();
  return ({ PERRO: "PERRO", GATO: "GATO", AVE: "AVE", ROEDOR: "ROEDOR", REPTIL: "REPTIL", OTRO: "OTRO" })[clave] || "OTRO";
};

const etiquetaEspecie = (especie = "") => ({
  PERRO: "Perro",
  GATO: "Gato",
  AVE: "Ave",
  ROEDOR: "Roedor",
  REPTIL: "Reptil",
  OTRO: "Otro"
})[normalizarEspecie(especie)];

const fechaLocal = (valor) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

const horaLocal = (valor) => {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
};

const fechaMinimaReserva = () => fechaLocal(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

const mapearMascota = (mascota) => ({
  ...mascota,
  id: String(mascota._id),
  especie: etiquetaEspecie(mascota.especie),
  peso: mascota.pesoKg ? `${mascota.pesoKg} kg` : "",
  tutor: [mascota.cliente?.usuario?.nombres, mascota.cliente?.usuario?.apellidos].filter(Boolean).join(" ")
});

const mapearCita = (cita) => ({
  ...cita,
  id: String(cita._id),
  fecha: fechaLocal(cita.fechaInicio),
  hora: horaLocal(cita.fechaInicio),
  mascotaId: String(cita.mascota?._id || cita.mascota),
  motivo: cita.servicio?.nombre || cita.observaciones || "Consulta general",
  veterinario: cita.empleado?.usuario
    ? `${cita.empleado.usuario.nombres} ${cita.empleado.usuario.apellidos}`.trim()
    : ""
});

const badgeEstado = (estado = "") => {
  const e = norm(estado);
  if (e.includes("confirm")) return "success";
  if (e.includes("atenci")) return "info";
  if (e.includes("rechaz") || e.includes("cancel")) return "danger";
  if (e.includes("finaliz") || e.includes("atendid") || e.includes("complet")) return "secondary";
  return "warning";
};

function leerUsuario() {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;

  try {
    const usuario = JSON.parse(raw);
    if (!usuario?.id || !usuario?.nombre || !usuario?.rol) return null;
    return usuario;
  } catch {
    return null;
  }
}

function BannerSeccion({ titulo, subtitulo }) {
  return (
    <section className="od-banner">
      <div className="od-banner-content">
        <h2>{titulo}</h2>
        <p>{subtitulo}</p>
      </div>
      <img src={DOG_BANNER_IMG} alt="Mascota" className="od-banner-dog" onError={(e) => { e.target.style.display = 'none'; }} />
    </section>
  );
}

function ResumenCliente({ citasActivas, totalMascotas, historialLength, tratActivosLength, pqrsPendientes }) {
  const tarjetas = [
    { titulo: 'Citas activas', valor: citasActivas, icono: '📋', color: '#2563eb', fondo: '#eff6ff' },
    { titulo: 'Mis mascotas', valor: totalMascotas, icono: '🐾', color: '#059669', fondo: '#ecfdf5' },
    { titulo: 'Consultas', valor: historialLength, icono: '🩺', color: '#0891b2', fondo: '#ecfeff' },
    { titulo: 'PQRS Pendientes', valor: pqrsPendientes, icono: '📝', color: '#d97706', fondo: '#fffbeb' }
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

function MiniCalendario({ citas }) {
  const [ref, setRef] = useState(new Date());
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const hoy = hoyISO();
  const celdas = useMemo(() => {
    const primerDia = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    return [...Array(primerDia).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [year, month]);
  const iso = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const conCita = new Set(citas.map((c) => c.fecha));

  return (
    <div className="od-calendar">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="od-cal-nav" onClick={() => setRef(new Date(year, month - 1, 1))}>‹</button>
        <span className="od-cal-title">🐾 {MESES[month]} {year}</span>
        <button className="od-cal-nav" onClick={() => setRef(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="od-cal-grid">
        {DIAS.map((d) => (<span key={d} className="od-cal-head">{d}</span>))}
        {celdas.map((d, i) => d ? (
          <span key={i} className={`od-cal-day ${iso(d) === hoy ? "today" : ""} ${conCita.has(iso(d)) ? "has-cita" : ""}`}>{d}</span>
        ) : (<span key={i} />))}
      </div>
      <Link to={RUTAS.citas} className="btn btn-agenda w-100 mt-3 text-center d-block text-decoration-none">Ver Agenda Completa</Link>
    </div>
  );
}

/* ===================== COMPONENTE PRINCIPAL ===================== */
export default function ClienteDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const rutaActual = location.pathname;

  const [usuario, setUsuario] = useState(undefined);
  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pqrs, setPqrs] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalMascota, setModalMascota] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState(null);
  const [formMascota, setFormMascota] = useState({ nombre: "", especie: "PERRO", raza: "", pesoKg: "" });
  const [guardandoMascota, setGuardandoMascota] = useState(false);
  const [formCita, setFormCita] = useState({ mascotaId: "", servicioId: "", sedeId: "", veterinarioId: "", fecha: "", hora: "", observaciones: "" });
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [formPqrs, setFormPqrs] = useState({ tipo: "Petición", asunto: "", descripcion: "" });

  useEffect(() => {
    const usuarioActual = leerUsuario();
    if (!usuarioActual || !localStorage.getItem("token")) {
      navigate(RUTAS.login, { replace: true });
    } else if (usuarioActual.rol !== "cliente") {
      navigate("/admin", { replace: true });
    } else {
      setUsuario(usuarioActual);
    }
  }, [navigate]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const getMock = async (recurso) => {
        const respuesta = await fetch(`${MOCK_API}/${recurso}`);
        if (!respuesta.ok) throw new Error(`No se pudo consultar ${recurso}`);
        return respuesta.json();
      };
      const [mascotasRespuesta, citasRespuesta, sedesRespuesta, serviciosRespuesta, veterinariosRespuesta, t, h, p] = await Promise.all([
        backendRequest("/mascotas?pagina=1&limite=100&activa=true"),
        backendRequest("/citas?pagina=1&limite=100"),
        backendRequest("/sedes?pagina=1&limite=100&activa=true", { authenticated: false }),
        backendRequest("/servicios?pagina=1&limite=100&estado=activo", { authenticated: false }),
        backendRequest("/empleados/veterinarios/activos"),
        getMock("tratamientos").catch(() => []),
        getMock("consultas").catch(() => []),
        getMock("pqrs").catch(() => [])
      ]);
      const propias = (mascotasRespuesta.data?.mascotas || []).map(mapearMascota);
      const citasBackend = (citasRespuesta.data?.citas || []).map(mapearCita);
      const serviciosBackend = serviciosRespuesta.data?.servicios || [];
      const sedesBackend = sedesRespuesta.data?.sedes || [];
      const veterinariosBackend = veterinariosRespuesta.data?.veterinarios || [];

      if (propias.length === 0 && usuario.nombre) setAviso("No tienes mascotas registradas aún.");
      else setAviso("");
      const ids = new Set(propias.map((x) => String(x.id)));
      setMascotas(propias);
      setCitas(citasBackend.filter((x) => ids.has(String(x.mascotaId))));
      setSedes(sedesBackend);
      setServicios(serviciosBackend);
      setVeterinarios(veterinariosBackend);
      setTratamientos(t.filter((x) => ids.has(String(x.mascotaId))));
      setHistorial(h.filter((x) => ids.has(String(x.mascotaId))));
      setPqrs(p.filter((x) => String(x.clienteId) === String(usuario.id)).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)));
      setError("");
    } catch (error) {
      setError(error.message || "No fue posible conectar con el servidor.");
      mostrarNotificacion("error", error.message || "Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario?.id, usuario?.nombre]);

  const nombreMascota = (id) => mascotas.find((m) => String(m.id) === String(id))?.nombre || "—";
  const hoy = hoyISO();
  const clave = (c) => `${c.fecha} ${c.hora}`;

  const citasActivas = useMemo(() => citas.filter((c) => !INACTIVA.test(c.estado || "")), [citas]);
  const citasFuturas = useMemo(() => citasActivas.filter((c) => c.fecha >= hoy).sort((a, b) => clave(a).localeCompare(clave(b))), [citasActivas, hoy]);
  const citasOrdenadas = useMemo(() => {
    const idsFut = new Set(citasFuturas.map((c) => c.id));
    const resto = citas.filter((c) => !idsFut.has(c.id)).sort((a, b) => clave(b).localeCompare(clave(a)));
    return [...citasFuturas, ...resto];
  }, [citas, citasFuturas]);

  const proxima = citasFuturas[0];
  const pendientes = citas.filter((c) => /programad|solicitad|pendient/i.test(c.estado || "")).length;
  const tratActivos = tratamientos.filter((t) => !/finaliz|complet/i.test(String(t.estado || "")));
  const pqrsPendientesCount = pqrs.filter((p) => p.estado === "Pendiente" || p.estado === "En proceso").length;
  
  const perros = mascotas.filter((m) => /perro/i.test(m.especie)).length;
  const gatos = mascotas.filter((m) => /gato/i.test(m.especie)).length;
  const totalMascotas = mascotas.length;
  const pPerros = totalMascotas ? Math.round((perros / totalMascotas) * 100) : 0;
  const pGatos = totalMascotas ? Math.round((gatos / totalMascotas) * 100) : 0;
  const mascotasFiltradas = mascotas.filter((m) => `${m.nombre} ${m.raza || ""}`.toLowerCase().includes(busqueda.toLowerCase()));

  if (usuario === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <h5 className="text-primary fw-bold">Cargando tu panel...</h5>
        </div>
      </div>
    );
  }

  const cerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?', text: '¿Estás seguro de que deseas salir del sistema?', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        ["token", "usuario", "user", "currentUser", "usuarioActual", "auth", "sesion"].forEach((k) => {
          localStorage.removeItem(k); sessionStorage.removeItem(k);
        });
        navigate(RUTAS.login);
      }
    });
  };

  const abrirModalNuevaMascota = () => {
    setMascotaEditando(null);
    setFormMascota({ nombre: "", especie: "PERRO", raza: "", pesoKg: "" });
    setModalMascota(true);
  };

  const abrirModalEditarMascota = (m) => {
    setMascotaEditando(m.id);
    setFormMascota({ nombre: m.nombre || "", especie: normalizarEspecie(m.especie), raza: m.raza || "", pesoKg: m.pesoKg ?? "" });
    setModalMascota(true);
  };

  const guardarMascota = async (e) => {
    e.preventDefault();
    if (!formMascota.nombre.trim()) { mostrarNotificacion('warning', 'Por favor ingresa el nombre de la mascota'); return; }
    const pesoKg = formMascota.pesoKg === "" ? undefined : Number(formMascota.pesoKg);
    if (pesoKg !== undefined && (!Number.isFinite(pesoKg) || pesoKg < 0)) {
      mostrarNotificacion("warning", "El peso debe ser un número mayor o igual a cero.");
      return;
    }
    setGuardandoMascota(true);
    const payload = {
      nombre: formMascota.nombre.trim(),
      especie: normalizarEspecie(formMascota.especie),
      raza: formMascota.raza.trim(),
      ...(pesoKg !== undefined ? { pesoKg } : {})
    };
    try {
      if (mascotaEditando) {
        await backendRequest(`/mascotas/${mascotaEditando}`, { method: "PATCH", body: payload });
      } else {
        await backendRequest("/mascotas", { method: "POST", body: payload });
      }
      setModalMascota(false);
      mostrarNotificacion('success', 'Mascota guardada exitosamente.');
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion("error", error.message || "No se pudo guardar la mascota.");
    }
    finally { setGuardandoMascota(false); }
  };

  const solicitarCita = async (e) => {
    e.preventDefault();
    if (!formCita.mascotaId || !formCita.servicioId || !formCita.sedeId || !formCita.veterinarioId || !formCita.fecha || !formCita.hora) {
      mostrarNotificacion("warning", "Completa mascota, servicio, sede, veterinario, fecha y hora.");
      return;
    }
    const fechaInicioLocal = new Date(`${formCita.fecha}T${formCita.hora}:00`);
    if (Number.isNaN(fechaInicioLocal.getTime()) || fechaInicioLocal.getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000) {
      mostrarNotificacion("warning", "Las citas deben reservarse con al menos 2 días de anticipación.");
      return;
    }
    const horarioOcupado = citas.some((c) => String(c.fecha) === String(formCita.fecha) && String(c.hora) === String(formCita.hora) && !INACTIVA.test(c.estado || ""));
    if (horarioOcupado) { mostrarNotificacion("warning", "Ya tienes una cita en ese horario. Selecciona otra hora."); return; }

    const confirmacion = await Swal.fire({ title: "¿Deseas confirmar tu cita?", text: "Verifica que los datos sean correctos.", icon: "question", showCancelButton: true, confirmButtonText: "Sí, confirmar", cancelButtonText: "No, revisar", confirmButtonColor: "#198754", cancelButtonColor: "#6c757d", reverseButtons: true });
    if (!confirmacion.isConfirmed) return;
    setGuardandoCita(true);

    try {
      await backendRequest("/citas", {
        method: "POST",
        body: {
          mascota: formCita.mascotaId,
          empleado: formCita.veterinarioId,
          sede: formCita.sedeId,
          servicio: formCita.servicioId,
          fechaInicio: fechaInicioLocal.toISOString(),
          ...(formCita.observaciones.trim() ? { observaciones: formCita.observaciones.trim() } : {})
        }
      });
      await Swal.fire({ title: "¡Cita registrada!", text: "La cita quedó programada en el sistema.", icon: "success", confirmButtonText: "Aceptar", confirmButtonColor: "#198754" });
      setFormCita({ mascotaId: "", servicioId: "", sedeId: "", veterinarioId: "", fecha: "", hora: "", observaciones: "" });
      await cargarDatos();
      navigate(RUTAS.citas);
    } catch (error) {
      mostrarNotificacion("error", error.message || "No fue posible enviar la solicitud.");
    }
    finally { setGuardandoCita(false); }
  };

  const cancelarCita = async (cita) => {
    const confirmacion = await Swal.fire({ title: "¿Deseas cancelar esta cita?", text: `La cita del ${cita.fecha} a las ${cita.hora} será cancelada.`, icon: "warning", showCancelButton: true, confirmButtonText: "Sí, cancelar cita", cancelButtonText: "Conservar cita", confirmButtonColor: "#dc3545", cancelButtonColor: "#6c757d", reverseButtons: true });
    if (!confirmacion.isConfirmed) return;
    try {
      await backendRequest(`/citas/${cita.id}/cancelar`, {
        method: "PATCH",
        body: { motivoCancelacion: "Cancelada por el cliente desde el portal" }
      });
      await Swal.fire({ title: "¡Cita cancelada!", icon: "success", confirmButtonColor: "#198754" });
      await cargarDatos();
    } catch (error) {
      mostrarNotificacion("error", error.message || "No fue posible cancelar la cita.");
    }
  };

  const enviarPqrs = async (e) => {
    e.preventDefault();
    if (!formPqrs.asunto.trim() || !formPqrs.descripcion.trim()) {
      mostrarNotificacion('warning', 'Por favor completa el asunto y la descripción.');
      return;
    }
    
    const confirmacion = await Swal.fire({ 
      title: "¿Enviar PQRS?", 
      text: "Tu solicitud será revisada por nuestro equipo.", 
      icon: "question", 
      showCancelButton: true, 
      confirmButtonText: "Sí, enviar", 
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0ea5e9"
    });
    
    if (!confirmacion.isConfirmed) return;

    try {
      const nuevaPqrs = {
        clienteId: usuario.id,
        nombreCliente: usuario.nombre,
        tipo: formPqrs.tipo,
        asunto: formPqrs.asunto,
        descripcion: formPqrs.descripcion,
        fecha: hoyISO(),
        estado: "Pendiente",
        respuesta: ""
      };
      
      const res = await fetch(`${MOCK_API}/pqrs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevaPqrs) });
      if (!res.ok) throw new Error();
      
      mostrarNotificacion('success', 'PQRS enviada exitosamente. Te responderemos pronto.');
      setFormPqrs({ tipo: "Petición", asunto: "", descripcion: "" });
      await cargarDatos();
    } catch {
      mostrarNotificacion('error', 'No se pudo enviar la PQRS.');
    }
  };

  const menu = [
    { to: RUTAS.panel, icon: "📊", label: "Panel de control" },
    { to: RUTAS.mascotas, icon: "🐾", label: "Mis Mascotas" },
    { to: RUTAS.citas, icon: "📅", label: "Mis Citas", badge: pendientes },
    { to: RUTAS.historial, icon: "🩺", label: "Historial Médico" },
    { to: RUTAS.tratamientos, icon: "💊", label: "Tratamientos" },
    { to: RUTAS.pqrs, icon: "📝", label: "PQRS", badge: pqrsPendientesCount },
  ];

  return (
    <div className="od-layout">
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <aside className="od-sidebar">
        <img src={LOGO} alt="Zoolomascotas MX" className="od-logo" />
        
        <nav className="od-nav">
          {menu.map((m) => (
            <Link key={m.to} to={m.to} className={`od-nav-item ${rutaActual === m.to ? "active" : ""}`}>
              <span>{m.icon}</span>
              <span className="flex-grow-1">{m.label}</span>
              {m.badge > 0 && <span className="badge rounded-pill bg-danger">{m.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-3 mb-2">
          <MiniCalendario citas={citasActivas} />
        </div>

        <button className="od-logout" onClick={cerrarSesion}>
          <span>🚪</span> Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="od-main">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="od-header-title">Zoolomascotas MX</h1>
            <span className="od-header-sub">Panel de Gestión para Propietarios</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="od-bell" aria-label="Notificaciones">
              🔔
              {pendientes > 0 && <span className="od-bell-badge">{pendientes}</span>}
            </button>
            <div className="od-user-card">
              <div className="text-end">
                <div className="fw-bold" style={{ fontSize: "0.9rem", lineHeight: "1.1" }}>{usuario.nombre || "Propietario"}</div>
                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>Cliente</small>
              </div>
              <div className="od-avatar">{(usuario.nombre || "C").charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        {error && <div className="alert alert-danger py-2 rounded-3">{error}</div>}
        {!error && !cargando && aviso && <div className="alert alert-warning py-2 rounded-3">{aviso}</div>}

        {/* PANEL DE CONTROL */}
        {rutaActual === RUTAS.panel && (
          <>
            <BannerSeccion titulo={`¡Bienvenido, ${usuario.nombre?.split(" ")[0] || "Propietario"}!`} subtitulo="Aquí tienes un resumen de tus citas y actividades." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <div className="d-flex justify-content-end mb-3">
              <Link to={RUTAS.nuevaCita} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">+ Solicitar Cita</Link>
            </div>
            <div className="row g-3">
              <div className="col-12 col-xl-8">
                <div className="od-card mb-3">
                  <div className="od-card-title"><span>📋</span> Mis citas de hoy</div>
                  <div className="table-responsive">
                    <table className="table od-table align-middle">
                      <thead><tr><th>Hora</th><th>Mascota</th><th>Motivo</th><th>Estado</th></tr></thead>
                      <tbody>
                        {cargando ? (<tr><td colSpan="4" className="text-center py-3 text-muted">Cargando...</td></tr>) : citasOrdenadas.length === 0 ? (<tr><td colSpan="4" className="text-center py-4 text-muted">No tienes citas programadas.</td></tr>) : (
                          citasOrdenadas.slice(0, 4).map((c) => (
                            <tr key={c.id}>
                              <td>{c.hora}</td>
                              <td className="fw-semibold">{nombreMascota(c.mascotaId)}</td>
                              <td>{c.motivo}</td>
                              <td><span className={`badge bg-${badgeEstado(c.estado)} rounded-pill`}>{c.estado}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="od-card">
                  <div className="od-card-title"><span>🐾</span> Mis mascotas</div>
                  <input className="form-control od-search mb-3" placeholder="🔍 Buscar mascotas por nombre o raza..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                  {mascotasFiltradas.length === 0 ? (<p className="text-muted text-center py-3">No hay mascotas registradas.</p>) : (
                    <div className="d-flex flex-column gap-2">
                      {mascotasFiltradas.slice(0, 3).map((m) => (
                        <div className="od-pet justify-content-between" key={m.id}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="od-pet-avatar">{/gato/i.test(m.especie) ? "🐱" : "🐶"}</div>
                            <div><strong className="d-block" style={{ fontSize: "0.95rem" }}>{m.nombre}</strong><small className="text-muted">{m.especie} {m.raza ? `· ${m.raza}` : ""}</small></div>
                          </div>
                          <button onClick={() => abrirModalEditarMascota(m)} className="btn btn-outline-primary btn-sm rounded-pill px-3">Editar</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-12 col-xl-4">
                <div className="od-card mb-3">
                  <div className="od-card-title"><span>🐾</span> Próxima cita</div>
                  {proxima ? (
                    <div>
                      <div className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>{proxima.fecha} · {proxima.hora}</div>
                      <div className="text-dark fw-semibold" style={{ fontSize: "0.95rem" }}>{nombreMascota(proxima.mascotaId)} — {proxima.motivo}</div>
                      <span className={`badge bg-${badgeEstado(proxima.estado)} rounded-pill mt-2`}>{proxima.estado}</span>
                    </div>
                  ) : (<p className="text-muted" style={{ fontSize: "0.9rem" }}>Sin citas próximas.</p>)}
                </div>
                <div className="od-card mb-3">
                  <div className="od-card-title">Mis atenciones</div>
                  <div className="od-donut-wrap">
                    <div className="od-donut" style={{ background: totalMascotas ? `conic-gradient(#0ea5e9 0 ${pPerros}%, #10b981 ${pPerros}% ${pPerros + pGatos}%, #e2e8f0 ${pPerros + pGatos}% 100%)` : "#e2e8f0" }}>
                      <div className="od-donut-inner"><strong>{totalMascotas}</strong><small>Total</small></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-center gap-3" style={{ fontSize: "0.8rem" }}>
                    <span className="text-primary fw-bold">● Perros {perros} ({pPerros}%)</span>
                    <span className="text-success fw-bold">● Gatos {gatos} ({pGatos}%)</span>
                  </div>
                </div>
                <div className="od-card">
                  <div className="od-card-title"><span>📁</span> Últimos registros clínicos</div>
                  <Link to={RUTAS.historial} className="btn btn-primary w-100 btn-sm fw-bold py-2 mt-1 rounded-pill">Ver todos mis historiales</Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MIS MASCOTAS */}
        {rutaActual === RUTAS.mascotas && (
          <section>
            <BannerSeccion titulo="Mis Mascotas" subtitulo="Administra y actualiza la información de tus compañeros peludos." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <input className="form-control od-search w-50" placeholder="🔍 Buscar por nombre o raza..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <button onClick={abrirModalNuevaMascota} className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm">+ Agregar Mascota</button>
            </div>
            {cargando ? (<div className="od-card text-center py-4">Cargando mascotas...</div>) : mascotasFiltradas.length === 0 ? (
              <div className="od-card text-center py-5">
                <div style={{ fontSize: "3rem" }}>🐶🐱</div>
                <h5 className="mt-2">No se encontraron mascotas</h5>
                <p className="text-muted">Agrega a tus peluditos para gestionar sus citas e historial.</p>
                <button onClick={abrirModalNuevaMascota} className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">Agregar mi primera mascota</button>
              </div>
            ) : (
              <div className="row g-3">
                {mascotasFiltradas.map((m) => (
                  <div className="col-12 col-md-6 col-xl-4" key={m.id}>
                    <div className="od-card h-100 position-relative text-center">
                      <div className="od-pet-avatar mx-auto mb-3" style={{ width: 90, height: 90, fontSize: "2.5rem" }}>
                        {/gato/i.test(m.especie) ? "🐱" : "🐶"}
                      </div>
                      <h5 className="fw-bold mb-1">{m.nombre}</h5>
                      <div className="mb-3">
                        <span className="od-chip">{m.especie || "Sin especie"}</span>
                        <span className="od-chip">{m.raza || "Mestizo"}</span>
                      </div>
                      <hr style={{ borderColor: "#e2e8f0" }} />
                      <div style={{ fontSize: "0.9rem", textAlign: "left" }}>
                        <p className="mb-2"><strong>Edad:</strong> No especificada</p>
                        <p className="mb-2"><strong>Peso:</strong> {m.peso || "No registrado"}</p>
                        <p className="mb-3"><strong>Tutor:</strong> {m.tutor || usuario.nombre}</p>
                      </div>
                      <button onClick={() => abrirModalEditarMascota(m)} className="btn btn-outline-primary btn-sm w-100 rounded-pill fw-bold">✏️ Editar Datos</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MIS CITAS */}
        {rutaActual === RUTAS.citas && (
          <section>
            <BannerSeccion titulo="Mis Citas Médicas" subtitulo="Consulta el estado de tus citas agendadas o solicita una nueva atención." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <div className="d-flex justify-content-end mb-3">
              <Link to={RUTAS.nuevaCita} className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">+ Solicitar Cita</Link>
            </div>
            {cargando ? (<div className="od-card text-center py-4">Cargando citas...</div>) : citasOrdenadas.length === 0 ? (
              <div className="od-card text-center py-5">
                <div style={{ fontSize: "3rem" }}>📅</div>
                <h5 className="mt-2">No tienes citas programadas</h5>
                <p className="text-muted">Solicita una cita veterinaria para mantener la salud de tu mascota.</p>
                <Link to={RUTAS.nuevaCita} className="btn btn-primary rounded-pill px-4 fw-bold">Agendar Cita</Link>
              </div>
            ) : (
              <div className="row g-3">
                {citasOrdenadas.map((c) => {
                  const estColor = badgeEstado(c.estado);
                  const noSePuedeCancelar = /cancelad|completad|realizad|atendid|no_asisti/i.test(c.estado || "");
                  return (
                    <div className="col-12 col-md-6 col-xl-4" key={c.id}>
                      <div className="od-cita-card h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-light text-dark border rounded-pill px-3 py-2">SOLICITUD #{c.id}</span>
                          <span className={`badge bg-${estColor} rounded-pill px-3 py-2`}>{c.estado || "Pendiente"}</span>
                        </div>
                        <div className="p-3 rounded-3 mb-3" style={{ background: "#f0f6ff" }}>
                          <div className="row">
                            <div className="col-6"><small className="text-muted d-block">📅 Fecha</small><strong>{c.fecha || "Sin fecha"}</strong></div>
                            <div className="col-6"><small className="text-muted d-block">⏰ Hora</small><strong>{c.hora || "Por definir"}</strong></div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px", background: "#e0f2fe", fontSize: "1.5rem", flexShrink: 0 }}>🐾</div>
                          <div><small className="text-muted d-block">Mascota</small><strong>{nombreMascota(c.mascotaId)}</strong></div>
                        </div>
                        <hr style={{ borderColor: "#e2e8f0" }} />
                        <div className="mb-3"><small className="text-muted d-block">🩺 Motivo</small><strong>{c.motivo || "Consulta general"}</strong></div>
                        <div className="mb-3"><small className="text-muted d-block">👨‍⚕️ Veterinario</small><span>{c.veterinario || "Pendiente de asignación"}</span></div>
                        <div className="mt-auto">
                          {!noSePuedeCancelar ? (
                            <button type="button" onClick={() => cancelarCita(c)} className="btn btn-outline-danger w-100 rounded-pill fw-semibold">✖ Cancelar cita</button>
                          ) : (
                            <div className="text-center text-muted small">
                              {/cancelad/i.test(c.estado || "") ? "Esta cita ya fue cancelada." : "Esta cita ya fue atendida."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SOLICITAR CITA */}
        {rutaActual === RUTAS.nuevaCita && (
          <section>
            <BannerSeccion titulo="Solicitar una cita" subtitulo="Agenda una atención veterinaria para tu compañero peludo." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <div className="row justify-content-center">
              <div className="col-12 col-lg-8">
                <div className="od-card">
                  <div className="od-card-title"><span>📅</span> Formulario de solicitud</div>
                  <p className="text-muted small mb-4">Completa los siguientes datos para solicitar tu atención veterinaria.</p>
                  <form onSubmit={solicitarCita}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">🐾 Selecciona tu mascota *</label>
                      <select className="form-select rounded-3" value={formCita.mascotaId} onChange={(e) => setFormCita({ ...formCita, mascotaId: e.target.value })} required>
                        <option value="">Seleccionar mascota</option>
                        {mascotas.map((m) => (<option key={m.id} value={m.id}>{m.nombre} - {m.especie}</option>))}
                      </select>
                      {mascotas.length === 0 && <small className="text-danger">Primero debes registrar una mascota.</small>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">🩺 Servicio *</label>
                      <select className="form-select rounded-3" value={formCita.servicioId} onChange={(e) => setFormCita({ ...formCita, servicioId: e.target.value })} required>
                        <option value="">Seleccionar servicio</option>
                        {servicios.map((servicio) => (
                          <option key={servicio._id} value={servicio._id}>
                            {servicio.nombre} · ${Number(servicio.precio || 0).toLocaleString("es-CO")}
                          </option>
                        ))}
                      </select>
                      {servicios.length === 0 && <small className="text-danger">No hay servicios activos disponibles.</small>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">🏥 Sede *</label>
                      <select className="form-select rounded-3" value={formCita.sedeId} onChange={(e) => setFormCita({ ...formCita, sedeId: e.target.value })} required>
                        <option value="">Seleccionar sede</option>
                        {sedes.map((sede) => (
                          <option key={sede._id} value={sede._id}>{sede.nombre} · {sede.ciudad}</option>
                        ))}
                      </select>
                      {sedes.length === 0 && <small className="text-danger">No hay sedes activas disponibles.</small>}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">👨‍⚕️ Veterinario *</label>
                      <select className="form-select rounded-3" value={formCita.veterinarioId} onChange={(e) => setFormCita({ ...formCita, veterinarioId: e.target.value })} required>
                        <option value="">Seleccionar veterinario</option>
                        {veterinarios.map((veterinario) => (
                          <option key={veterinario._id} value={veterinario._id}>
                            {veterinario.nombre}{veterinario.cargo ? ` · ${veterinario.cargo}` : ""}
                          </option>
                        ))}
                      </select>
                      {veterinarios.length === 0 && <small className="text-danger">No hay veterinarios activos disponibles.</small>}
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">📆 Fecha deseada *</label>
                        <input type="date" className="form-control rounded-3" min={fechaMinimaReserva()} value={formCita.fecha} onChange={(e) => setFormCita({ ...formCita, fecha: e.target.value })} required />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-bold">⏰ Hora deseada *</label>
                        <input type="time" className="form-control rounded-3" value={formCita.hora} onChange={(e) => setFormCita({ ...formCita, hora: e.target.value })} required />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-bold">Observaciones</label>
                      <textarea className="form-control rounded-3" rows="3" maxLength="500" value={formCita.observaciones} onChange={(e) => setFormCita({ ...formCita, observaciones: e.target.value })} placeholder="Información adicional para la cita (opcional)" />
                    </div>
                    <div className="alert alert-info small rounded-3"><strong>Importante:</strong> La cita debe reservarse con al menos 2 días de anticipación. El sistema confirmará el registro y validará los datos seleccionados.</div>
                    <div className="d-flex justify-content-between flex-wrap gap-2 pt-3 border-top">
                      <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => navigate(RUTAS.citas)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={guardandoCita || mascotas.length === 0 || servicios.length === 0 || sedes.length === 0 || veterinarios.length === 0}>
                        {guardandoCita ? "Enviando solicitud..." : "📅 Agendar cita"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HISTORIAL */}
        {rutaActual === RUTAS.historial && (
          <section>
            <BannerSeccion titulo="Historial Clínico" subtitulo="Revisa los diagnósticos, recetas y antecedentes médicos de tus mascotas." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            {cargando ? (<div className="od-card text-center py-4">Cargando historial médico...</div>) : historial.length === 0 ? (
              <div className="od-card text-center py-5">
                <div style={{ fontSize: "3rem" }}>📋</div>
                <h5 className="mt-2">Sin registros médicos</h5>
                <p className="text-muted">Las consultas y diagnósticos realizados por el veterinario aparecerán aquí.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {historial.slice().sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))).map((h) => (
                  <div className="od-card" key={h.id}>
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <h5 className="fw-bold text-primary mb-0">🩺 Consulta: {nombreMascota(h.mascotaId)}</h5>
                      <span className="badge bg-info px-3 py-2 rounded-pill">📅 {h.fecha || "Sin fecha"}</span>
                    </div>
                    <hr style={{ borderColor: "#e2e8f0" }} />
                    <div className="row g-2" style={{ fontSize: "0.9rem" }}>
                      <div className="col-12 col-md-6"><p className="mb-1"><strong>Motivo de consulta:</strong></p><p className="text-muted">{h.motivo || "No especificado"}</p></div>
                      <div className="col-12 col-md-6"><p className="mb-1"><strong>Diagnóstico:</strong></p><p className="text-dark fw-semibold">{h.diagnostico || "Sin diagnóstico registrado"}</p></div>
                      <div className="col-12"><p className="mb-1"><strong>Observaciones / Indicaciones:</strong></p><div className="p-3 bg-light rounded-3 text-secondary">{h.observaciones || h.observacion || "Sin observaciones adicionales."}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TRATAMIENTOS */}
        {rutaActual === RUTAS.tratamientos && (
          <section>
            <BannerSeccion titulo="Tratamientos Médicos" subtitulo="Plan y seguimiento de medicamentos formulados para tus mascotas." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            {cargando ? (<div className="od-card text-center py-4">Cargando tratamientos...</div>) : tratamientos.length === 0 ? (
              <div className="od-card text-center py-5">
                <div style={{ fontSize: "3rem" }}>💊</div>
                <h5 className="mt-2">No hay tratamientos activos</h5>
                <p className="text-muted">Los medicamentos y recetas formuladas por tu veterinario aparecerán aquí.</p>
              </div>
            ) : (
              <div className="row g-3">
                {tratamientos.map((t) => (
                  <div className="col-12 col-md-6" key={t.id}>
                    <div className="od-card h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-dark mb-0">💊 {t.nombre || t.medicamento || "Tratamiento"}</h5>
                        <span className={`badge bg-${/finaliz|complet/i.test(t.estado || "") ? "secondary" : "success"} rounded-pill`}>{t.estado || "En seguimiento"}</span>
                      </div>
                      <p className="mb-1" style={{ fontSize: "0.9rem" }}><strong>Mascota:</strong> {nombreMascota(t.mascotaId)}</p>
                      <p className="mb-1" style={{ fontSize: "0.9rem" }}><strong>Dosis / Indicaciones:</strong> {t.indicaciones || t.dosis || "Sin detalles"}</p>
                      <div className="mt-3 pt-2 border-top d-flex justify-content-between text-muted" style={{ fontSize: "0.8rem" }}>
                        <span>Inicio: {t.fechaInicio || t.fecha || "—"}</span>
                        <span>Fin: {t.fechaFin || "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PQRS */}
        {rutaActual === RUTAS.pqrs && (
          <section>
            <BannerSeccion titulo="Peticiones, Quejas, Reclamos y Sugerencias" subtitulo="Tu opinión es importante. Envíanos tu solicitud y te responderemos a la brevedad." />
            <ResumenCliente citasActivas={citasActivas.length} totalMascotas={totalMascotas} historialLength={historial.length} tratActivosLength={tratActivos.length} pqrsPendientes={pqrsPendientesCount} />
            
            <div className="row g-4">
              <div className="col-12 col-lg-5">
                <Card className="od-card h-100">
                  <div className="od-card-title"><span>📝</span> Nueva Solicitud</div>
                  <form onSubmit={enviarPqrs}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Tipo de solicitud *</label>
                      <Form.Select 
                        value={formPqrs.tipo} 
                        onChange={(e) => setFormPqrs({...formPqrs, tipo: e.target.value})}
                        className="rounded-3"
                        required
                      >
                        <option value="Petición">Petición</option>
                        <option value="Queja">Queja</option>
                        <option value="Reclamo">Reclamo</option>
                        <option value="Sugerencia">Sugerencia</option>
                      </Form.Select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Asunto *</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3" 
                        placeholder="Ej: Solicitud de historia clínica"
                        value={formPqrs.asunto}
                        onChange={(e) => setFormPqrs({...formPqrs, asunto: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Descripción detallada *</label>
                      <textarea 
                        className="form-control rounded-3" 
                        rows="5" 
                        placeholder="Describe tu solicitud con el mayor detalle posible..."
                        value={formPqrs.descripcion}
                        onChange={(e) => setFormPqrs({...formPqrs, descripcion: e.target.value})}
                        required 
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-primary-custom w-100 rounded-pill fw-bold">
                      Enviar Solicitud
                    </button>
                  </form>
                </Card>
              </div>

              <div className="col-12 col-lg-7">
                <Card className="od-card h-100">
                  <div className="od-card-title"><span>📂</span> Mis Solicitudes</div>
                  {pqrs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <div style={{ fontSize: "3rem" }}>📭</div>
                      <p>No has enviado ninguna solicitud aún.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table od-table align-middle">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Asunto</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pqrs.map((p) => (
                            <tr key={p.id}>
                              <td className="small">{p.fecha}</td>
                              <td><span className="od-chip">{p.tipo}</span></td>
                              <td className="fw-semibold">{p.asunto}</td>
                              <td>
                                <Badge bg={p.estado === "Resuelto" ? "success" : p.estado === "En proceso" ? "info" : "warning"} className="rounded-pill px-3 py-1">
                                  {p.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL MASCOTA */}
      {modalMascota && (
        <div className="od-modal-backdrop">
          <div className="od-modal">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">{mascotaEditando ? "✏️ Editar Mascota" : "🐾 Agregar Nueva Mascota"}</h5>
              <button onClick={() => setModalMascota(false)} className="btn-close" />
            </div>
            <form onSubmit={guardarMascota}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Nombre</label>
                <input type="text" className="form-control form-control-sm rounded-3" value={formMascota.nombre} onChange={(e) => setFormMascota({ ...formMascota, nombre: e.target.value })} placeholder="Ej: Max, Mia" required />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Especie</label>
                  <select className="form-select form-select-sm rounded-3" value={formMascota.especie} onChange={(e) => setFormMascota({ ...formMascota, especie: e.target.value })}>
                    <option value="PERRO">Perro</option><option value="GATO">Gato</option><option value="OTRO">Otro</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Raza</label>
                  <input type="text" className="form-control form-control-sm rounded-3" value={formMascota.raza} onChange={(e) => setFormMascota({ ...formMascota, raza: e.target.value })} placeholder="Ej: Labrador, Criollo" />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Peso (kg)</label>
                  <input type="number" min="0" step="0.1" className="form-control form-control-sm rounded-3" value={formMascota.pesoKg} onChange={(e) => setFormMascota({ ...formMascota, pesoKg: e.target.value })} placeholder="Ej: 12.5" />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" onClick={() => setModalMascota(false)} className="btn btn-light btn-sm fw-bold rounded-pill px-3">Cancelar</button>
                <button type="submit" disabled={guardandoMascota} className="btn btn-primary btn-sm fw-bold px-4 rounded-pill shadow-sm">
                  {guardandoMascota ? "Guardando..." : "Guardar Mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}