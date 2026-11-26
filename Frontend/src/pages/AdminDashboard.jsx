import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  // Vite: construye las rutas respetando la configuración base del proyecto.
  const publicAsset = (nombre) => `${import.meta.env.BASE_URL}${nombre}`;
  const [seccionActiva, setSeccionActiva] = useState('dashboard');

  // --- CALENDARIO FUNCIONAL ---
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  });

  const diasDelMes = new Date(
    mesCalendario.getFullYear(),
    mesCalendario.getMonth() + 1,
    0
  ).getDate();
  // La semana comienza en lunes.
  const espaciosIniciales = (new Date(
    mesCalendario.getFullYear(),
    mesCalendario.getMonth(),
    1
  ).getDay() + 6) % 7;

  const cambiarMes = (cantidad) => {
    setMesCalendario((mesActual) =>
      new Date(mesActual.getFullYear(), mesActual.getMonth() + cantidad, 1)
    );
  };

  const esMismaFecha = (fechaA, fechaB) =>
    fechaA.getFullYear() === fechaB.getFullYear() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getDate() === fechaB.getDate();

  const fechaHoy = new Date();
  const nombreMes = mesCalendario.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric'
  });

  // --- ESTADOS DE INVENTARIO ---
  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [showModalProducto, setShowModalProducto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Vacuna Quinta Canina', categoria: 'Medicamentos', precio: 45000, stock: 28, imagen: publicAsset('Logo.jpeg') },
    { id: 2, nombre: 'Comida Premium Perro 10kg', categoria: 'Alimentos', precio: 120000, stock: 8, imagen: publicAsset('Golden.png') },
    { id: 3, nombre: 'Desparasitante Feline', categoria: 'Medicamentos', precio: 25000, stock: 45, imagen: publicAsset('avatarperro.png') },
    { id: 4, nombre: 'Champú Hipoalergénico', categoria: 'Estética', precio: 32000, stock: 4, imagen: publicAsset('perro.png') }
  ]);
  const [formProducto, setFormProducto] = useState({
    nombre: '', categoria: 'Medicamentos', precio: '', stock: '', imagen: publicAsset('Logo.jpeg')
  });

  // --- ESTADOS DE USUARIOS ---
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [usuarios] = useState([
    { id: 1, nombre: 'Dr. Carlos Rodríguez', correo: 'carlos.vet@zoolomascotas.com', rol: 'Veterinario', estado: 'Activo' },
    { id: 2, nombre: 'Lorena / Laura', correo: 'recepcion@zoolomascotas.com', rol: 'Recepcionista', estado: 'Activo' },
    { id: 3, nombre: 'Juan Pérez', correo: 'juan.cliente@gmail.com', rol: 'Cliente', estado: 'Activo' },
    { id: 4, nombre: 'Dorian Lara', correo: 'admin@zoolomascotas.com', rol: 'Admin', estado: 'Activo' }
  ]);

  // --- AGENDA Y TRATAMIENTOS ---
  const [agendaVeterinarios] = useState([
    { id: 1, fecha: '2026-04-15', hora: '08:30 AM', paciente: 'Kyra', vet: 'Dr. Carlos Rodríguez', servicio: 'Vacunación', estado: 'Confirmada' },
    { id: 2, fecha: '2026-04-15', hora: '10:00 AM', paciente: 'Simba', vet: 'Dr. Carlos Rodríguez', servicio: 'Urgencia', estado: 'En Espera' },
    { id: 3, fecha: '2026-04-16', hora: '11:30 AM', paciente: 'Copito', vet: 'Dra. Andrea Morales', servicio: 'Consulta General', estado: 'Confirmada' }
  ]);

  const [tratamientos] = useState([
    { id: 1, paciente: 'Kyra', dueno: 'Juan Pérez', tratamiento: 'Antibiótico Amoxicilina 250mg', dosis: 'Cada 12 horas / 7 días', vet: 'Dr. Carlos Rodríguez', estado: 'En Curso' },
    { id: 2, paciente: 'Thor', dueno: 'Carol Benavides', tratamiento: 'Tratamiento Dermatológico Shampoo', dosis: '2 veces por semana', vet: 'Dr. Carlos Rodríguez', estado: 'En Curso' },
    { id: 3, paciente: 'Milo', dueno: 'Camila Pérez', tratamiento: 'Desparasitación Interna', dosis: 'Dosis única', vet: 'Dra. Andrea Morales', estado: 'Finalizado' }
  ]);

  // Funciones Inventario
  const abrirModalCrearProducto = () => {
    setProductoEditar(null);
    setFormProducto({ nombre: '', categoria: 'Medicamentos', precio: '', stock: '', imagen: publicAsset('Logo.jpeg') });
    setShowModalProducto(true);
  };

  const abrirModalEditarProducto = (prod) => {
    setProductoEditar(prod);
    setFormProducto({ ...prod });
    setShowModalProducto(true);
  };

  const guardarProducto = (e) => {
    e.preventDefault();
    if (productoEditar) {
      setProductos(productos.map(p => p.id === productoEditar.id ? { ...formProducto, id: p.id, precio: Number(formProducto.precio), stock: Number(formProducto.stock) } : p));
    } else {
      setProductos([...productos, { ...formProducto, id: Date.now(), precio: Number(formProducto.precio), stock: Number(formProducto.stock) }]);
    }
    setShowModalProducto(false);
  };

  const eliminarProducto = (id) => {
    if (window.confirm('¿Confirma que desea eliminar este producto del inventario?')) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaInventario.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.correo.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    u.rol.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#dce8f7', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 1. BARRA LATERAL (SIDEBAR ANCHO CON DIVISORES) */}
      <div
        className="p-3 d-flex flex-column justify-content-between"
        style={{ width: '290px', minWidth: '290px', backgroundColor: '#eef4fc', borderRight: '1.5px solid #b2ccf0' }}
      >
        <div>
          {/* LOGO SUPERIOR */}
          <div className="text-center mb-3 pb-2 border-bottom border-primary border-opacity-25">
            <img
              src={publicAsset('Logo.jpeg')}
              alt="Zoolomascotas MX Logo"
              style={{ maxHeight: '110px', width: 'auto', maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
              onClick={() => setSeccionActiva('dashboard')}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* MENÚ CON LÍNEAS DIVISORAS */}
          <div className="d-flex flex-column">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '🐾' },
              { key: 'agenda', label: 'Mi agenda', icon: '📅' },
              { key: 'tratamientos', label: 'Tratamientos', icon: '💉' },
              { key: 'disponibilidad', label: 'Disponibilidad', icon: '⚙️' },
              { key: 'usuarios', label: 'Gestión de usuarios', icon: '👥' },
              { key: 'inventario', label: 'Gestión Inventario', icon: '📦' },
              { key: 'pqrs', label: 'PQRS', icon: '❗' }
            ].map((item) => (
              <div key={item.key} className="border-bottom border-primary border-opacity-10 py-1">
                <Button
                  variant="transparent"
                  className={`w-100 text-start rounded-3 py-2 px-3 fw-bold small d-flex align-items-center gap-3 border-0 ${
                    seccionActiva === item.key ? 'bg-white text-primary shadow-sm' : 'text-secondary'
                  }`}
                  onClick={() => setSeccionActiva(item.key)}
                  style={{ fontSize: '13.5px' }}
                >
                  <span className="fs-6">{item.icon}</span>
                  <span>{item.label}</span>
                </Button>
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="transparent"
                className="w-100 text-start rounded-3 py-2 px-3 fw-bold small text-danger d-flex align-items-center gap-3 border-0"
                onClick={() => navigate('/')}
              >
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>

        {/* CALENDARIO FUNCIONAL */}
        <Card className="border-0 shadow-sm rounded-4 p-3 bg-white text-center mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Button
              variant="light"
              size="sm"
              className="rounded-circle px-2 py-1"
              aria-label="Mes anterior"
              onClick={() => cambiarMes(-1)}
            >
              ‹
            </Button>
            <div className="fw-bold text-primary small text-capitalize">
              {nombreMes}
            </div>
            <Button
              variant="light"
              size="sm"
              className="rounded-circle px-2 py-1"
              aria-label="Mes siguiente"
              onClick={() => cambiarMes(1)}
            >
              ›
            </Button>
          </div>

          <div
            className="d-grid mb-1 fw-bold text-muted"
            style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', fontSize: '11px' }}
          >
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, indice) => (
              <span key={`${dia}-${indice}`} className="py-1">{dia}</span>
            ))}
          </div>

          <div
            className="d-grid gap-1"
            style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
          >
            {Array.from({ length: espaciosIniciales }, (_, indice) => (
              <span key={`vacio-${indice}`} />
            ))}
            {Array.from({ length: diasDelMes }, (_, indice) => {
              const numeroDia = indice + 1;
              const fechaDia = new Date(
                mesCalendario.getFullYear(),
                mesCalendario.getMonth(),
                numeroDia
              );
              const esHoy = esMismaFecha(fechaDia, fechaHoy);
              const estaSeleccionada = esMismaFecha(fechaDia, fechaSeleccionada);

              return (
                <Button
                  key={numeroDia}
                  variant={estaSeleccionada ? 'primary' : 'light'}
                  size="sm"
                  className={`rounded-circle p-0 mx-auto ${esHoy && !estaSeleccionada ? 'border border-success border-2 text-success fw-bold' : ''}`}
                  style={{ width: '27px', height: '27px', fontSize: '11px' }}
                  aria-label={`Seleccionar ${numeroDia} de ${nombreMes}`}
                  aria-pressed={estaSeleccionada}
                  onClick={() => setFechaSeleccionada(fechaDia)}
                >
                  {numeroDia}
                </Button>
              );
            })}
          </div>

          <small className="text-muted mt-2 mb-2" style={{ fontSize: '10px' }}>
            Fecha seleccionada: {fechaSeleccionada.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </small>
          <Button
            variant="success"
            size="sm"
            className="rounded-pill fw-bold w-100 py-1"
            style={{ fontSize: '12px' }}
            onClick={() => setSeccionActiva('agenda')}
          >
            Ver Agenda Completa
          </Button>
        </Card>
      </div>

      {/* 2. ÁREA DE CONTENIDO */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        
        {/* ENCABEZADO CON DR. ALEJANDRO */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#102a56' }}>Zoolomascotas MX</h3>
            <small className="text-muted" style={{ fontSize: '11px' }}>https://zoolomascotasmx.com.co/home</small>
          </div>

          <div className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-4 shadow-sm">
            <div className="text-end">
              <strong className="d-block text-dark small">Dr. Alejandro</strong>
              <small className="text-muted d-block" style={{ fontSize: '11px' }}>Administrador General</small>
              <Badge bg="success" className="rounded-pill" style={{ fontSize: '10px' }}>Disponible</Badge>
            </div>
            <img
              src={publicAsset('Dr.Alejandro.png')}
              alt="Dr. Alejandro"
              className="rounded-circle border"
              style={{ width: '45px', height: '45px', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = publicAsset('Logo.jpeg'); }}
            />
          </div>
        </div>

        {/* BANNER PRINCIPAL CON BARRA Y PERRITO */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative bg-white">
          <div
            className="p-4 p-md-5 d-flex justify-content-between align-items-center position-relative"
            style={{
              backgroundImage: `url("${publicAsset('Barra.png')}"), linear-gradient(90deg, #dbeafe 0%, #eff6ff 60%, #ffffff 100%)`,
              backgroundPosition: 'left center, center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              minHeight: '140px'
            }}
          >
            <div style={{ zIndex: 2, maxWidth: '600px' }}>
              <h2 className="fw-bold mb-1" style={{ color: '#0f2b5c', fontSize: '1.9rem' }}>
                Bienvenido de nuevo, Dr. Alejandro
              </h2>
              <p className="text-secondary small mb-0">
                {seccionActiva === 'dashboard' && 'Aquí tienes un resumen de la actividad reciente en el sistema.'}
                {seccionActiva === 'agenda' && 'Gestión y seguimiento de las citas asignadas a los veterinarios.'}
                {seccionActiva === 'tratamientos' && 'Control de medicamentos y tratamientos prescritos a los pacientes.'}
                {seccionActiva === 'disponibilidad' && 'Administración de horarios de atención y turnos del personal.'}
                {seccionActiva === 'usuarios' && 'Gestión de accesos, roles y usuarios registrados en la plataforma.'}
                {seccionActiva === 'inventario' && 'Control completo de stock, precios e insumos médicos.'}
                {seccionActiva === 'pqrs' && 'Gestión de peticiones, quejas, reclamos y sugerencias de clientes.'}
              </p>
            </div>

            <img
              src="/avatarperro.png"
              alt="Mascota"
              style={{
                position: 'absolute',
                right: '25px',
                top: '50%',
                transform: 'translateY(-50%)',
                maxHeight: '120px',
                width: 'auto',
                objectFit: 'contain',
                zIndex: 2
              }}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = publicAsset('Golden.png'); }}
            />
          </div>
        </Card>

        {/* ---------------- MÓDULOS DEL ADMINISTRADOR ---------------- */}
        {seccionActiva === 'dashboard' && (
          <>
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 text-white" style={{ backgroundColor: '#22c55e' }}>
                  <div className="d-flex align-items-center gap-3"><div className="fs-3">📅</div><div><h2 className="fw-bold mb-0">8</h2><small style={{ fontSize: '12px' }}>Citas para hoy</small></div></div>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 text-white" style={{ backgroundColor: '#3b82f6' }}>
                  <div className="d-flex align-items-center gap-3"><div className="fs-3">👥</div><div><h2 className="fw-bold mb-0">{usuarios.length}</h2><small style={{ fontSize: '12px' }}>Empleados registrados</small></div></div>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 text-white" style={{ backgroundColor: '#38bdf8' }}>
                  <div className="d-flex align-items-center gap-3"><div className="fs-3">🐾</div><div><h2 className="fw-bold mb-0">83</h2><small style={{ fontSize: '12px' }}>Mascotas atendidas</small></div></div>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm rounded-4 p-3 text-white" style={{ backgroundColor: '#eab308' }}>
                  <div className="d-flex align-items-center gap-3"><div className="fs-3">📦</div><div><h2 className="fw-bold mb-0">{productos.length}</h2><small style={{ fontSize: '12px' }}>Productos en Inventario</small></div></div>
                </Card>
              </Col>
            </Row>

            <Row className="g-4">
              <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3">Últimas Citas Agendadas</h5>
                  <Table responsive hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr className="text-secondary small">
                        <th>Hora</th><th>Paciente</th><th>Motivo</th><th>Veterinario</th><th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendaVeterinarios.map((c) => (
                        <tr key={c.id}>
                          <td className="text-secondary small">{c.hora}</td>
                          <td className="fw-bold text-dark">{c.paciente}</td>
                          <td className="text-secondary small">{c.servicio}</td>
                          <td className="text-secondary small">{c.vet}</td>
                          <td>
                            <Button variant="primary" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => setSeccionActiva('agenda')}>
                              Ir a la cita
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h6 className="fw-bold text-primary mb-3">Permisos y Vacaciones</h6>
                  <div className="border-bottom pb-2 mb-2">
                    <strong className="d-block text-dark small">Tane Idhara</strong>
                    <small className="text-muted d-block" style={{ fontSize: '11px' }}>De 04/14/25 — 19/24/2026</small>
                  </div>
                  <div>
                    <strong className="d-block text-dark small">Carol Benavides</strong>
                    <small className="text-muted d-block" style={{ fontSize: '11px' }}>Día 13/17</small>
                  </div>
                </Card>

                <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h6 className="fw-bold text-primary mb-3">Mascotas Atendidas (30 días)</h6>
                  <div className="text-center py-2">
                    <div className="mx-auto rounded-circle border border-primary border-4 d-flex align-items-center justify-content-center flex-column" style={{ width: '90px', height: '90px', backgroundColor: '#f0f7ff' }}>
                      <span className="fw-bold fs-4 text-primary">83</span>
                      <small className="text-muted" style={{ fontSize: '10px' }}>Total</small>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {seccionActiva === 'agenda' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-primary mb-3">📅 Citas Agendadas por Veterinarios</h5>
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Fecha</th><th>Hora</th><th>Paciente</th><th>Veterinario Asignado</th><th>Servicio</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {agendaVeterinarios.map((a) => (
                  <tr key={a.id}>
                    <td>{a.fecha}</td>
                    <td className="fw-bold">{a.hora}</td>
                    <td className="fw-bold text-dark">{a.paciente}</td>
                    <td>{a.vet}</td>
                    <td><Badge bg="info">{a.servicio}</Badge></td>
                    <td><Badge bg={a.estado === 'Confirmada' ? 'success' : 'warning'}>{a.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {seccionActiva === 'tratamientos' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-primary mb-3">💉 Tratamientos Prescritos</h5>
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Mascota</th><th>Dueño</th><th>Tratamiento</th><th>Dosis / Frecuencia</th><th>Veterinario</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tratamientos.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-bold text-dark">{t.paciente}</td>
                    <td className="text-secondary">{t.dueno}</td>
                    <td className="fw-bold text-primary">{t.tratamiento}</td>
                    <td className="small">{t.dosis}</td>
                    <td>{t.vet}</td>
                    <td><Badge bg={t.estado === 'En Curso' ? 'warning' : 'secondary'}>{t.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {seccionActiva === 'disponibilidad' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-primary mb-3">⚙️ Horarios y Disponibilidad Médica</h5>
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Empleado</th><th>Cargo</th><th>Jornada Horaria</th><th>Estado Hoy</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Dr. Carlos Rodríguez</td><td>Veterinario Cirujano</td><td>08:00 AM - 05:00 PM</td><td><Badge bg="success">Disponible</Badge></td></tr>
                <tr><td>Dra. Andrea Morales</td><td>Veterinaria General</td><td>10:00 AM - 07:00 PM</td><td><Badge bg="success">Disponible</Badge></td></tr>
                <tr><td>Lorena / Laura</td><td>Recepcionista</td><td>07:00 AM - 04:00 PM</td><td><Badge bg="success">En Caja</Badge></td></tr>
              </tbody>
            </Table>
          </Card>
        )}

        {seccionActiva === 'usuarios' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">👥 Usuarios del Sistema y Roles</h5>
              <Button variant="primary" className="rounded-pill px-4 fw-bold">
                + Registrar Nuevo Usuario
              </Button>
            </div>
            <InputGroup className="mb-3 rounded-pill overflow-hidden bg-light border">
              <InputGroup.Text className="bg-transparent border-0">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar usuario..."
                className="bg-transparent border-0 py-2"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
              />
            </InputGroup>
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Nombre Completo</th><th>Correo Electrónico</th><th>Rol Asignado</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-dark">{u.nombre}</td>
                    <td className="text-secondary">{u.correo}</td>
                    <td><Badge bg="info">{u.rol}</Badge></td>
                    <td><Badge bg={u.estado === 'Activo' ? 'success' : 'danger'}>{u.estado}</Badge></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="rounded-pill me-2 px-3">Editar</Button>
                      <Button variant="outline-danger" size="sm" className="rounded-pill px-3">Inactivar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {seccionActiva === 'inventario' && (
          <>
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-primary border-4">
                  <h3 className="fw-bold text-primary mb-0">{productos.length}</h3>
                  <small className="text-muted fw-semibold">Total Productos</small>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-danger border-4">
                  <h3 className="fw-bold text-danger mb-0">{productos.filter(p => p.stock <= 10).length}</h3>
                  <small className="text-muted fw-semibold">Stock Crítico</small>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4">
                  <h3 className="fw-bold text-success mb-0">$ {productos.reduce((acc, p) => acc + (p.precio * p.stock), 0).toLocaleString()}</h3>
                  <small className="text-muted fw-semibold">Valor Total Inventario</small>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold text-dark mb-0">📦 Catálogo General e Insumos Médicos</h5>
                <Button variant="primary" className="rounded-pill px-4 fw-bold" onClick={abrirModalCrearProducto}>
                  + Agregar Nuevo Producto
                </Button>
              </div>

              <InputGroup className="mb-3 rounded-pill overflow-hidden bg-light border">
                <InputGroup.Text className="bg-transparent border-0">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar producto..."
                  className="bg-transparent border-0 py-2"
                  value={busquedaInventario}
                  onChange={(e) => setBusquedaInventario(e.target.value)}
                />
              </InputGroup>

              <Table responsive hover className="align-middle text-center">
                <thead className="table-light">
                  <tr className="small text-secondary">
                    <th>Imagen</th><th>Producto</th><th>Categoría</th><th>Precio Unitario</th><th>Stock</th><th>Estado Stock</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="rounded-3 border"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = publicAsset('Logo.jpeg'); }}
                        />
                      </td>
                      <td className="fw-bold text-dark text-start">{p.nombre}</td>
                      <td><Badge bg="secondary">{p.categoria}</Badge></td>
                      <td className="fw-bold text-success">${p.precio.toLocaleString()}</td>
                      <td className="fw-bold">{p.stock}</td>
                      <td>
                        <Badge bg={p.stock > 10 ? 'success' : 'danger'} className="rounded-pill">
                          {p.stock > 10 ? 'En Stock' : 'Bajo Stock'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="rounded-pill me-2 px-3" onClick={() => abrirModalEditarProducto(p)}>
                          ✏️ Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => eliminarProducto(p.id)}>
                          🗑️ Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}

        {seccionActiva === 'pqrs' && (
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-primary mb-3">❗ Peticiones, Quejas y Reclamos</h5>
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Asunto</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>2026-04-10</td><td className="fw-bold">Juan Pérez</td><td><Badge bg="info">Petición</Badge></td><td>Horario grooming</td><td><Badge bg="success">Resuelto</Badge></td></tr>
              </tbody>
            </Table>
          </Card>
        )}

      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      <Modal show={showModalProducto} onHide={() => setShowModalProducto(false)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-primary fs-5">
            {productoEditar ? '✏️ Editar Producto' : '📦 Registrar Producto en Inventario'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={guardarProducto}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Nombre del Producto</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Ej. Vacuna Rabia Canina"
                value={formProducto.nombre}
                onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Categoría</Form.Label>
              <Form.Select
                value={formProducto.categoria}
                onChange={(e) => setFormProducto({ ...formProducto, categoria: e.target.value })}
              >
                <option>Medicamentos</option>
                <option>Alimentos</option>
                <option>Estética</option>
                <option>Accesorios</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Precio ($)</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    placeholder="35000"
                    value={formProducto.precio}
                    onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Stock Inicial</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    placeholder="15"
                    value={formProducto.stock}
                    onChange={(e) => setFormProducto({ ...formProducto, stock: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Ruta de Imagen (/public)</Form.Label>
              <Form.Control
                type="text"
                placeholder="/Logo.jpeg"
                value={formProducto.imagen}
                onChange={(e) => setFormProducto({ ...formProducto, imagen: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" className="rounded-pill fw-bold" onClick={() => setShowModalProducto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="rounded-pill fw-bold px-4">
              {productoEditar ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};