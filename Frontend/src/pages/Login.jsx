import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { backendRequest, guardarSesion } from '../services/backendApi';

export const Login = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault();
    
    const emailLimpio = usuario.trim().toLowerCase();
    const passLimpio = contrasena.trim();

    if (!emailLimpio || !passLimpio) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      const respuesta = await backendRequest('/auth/login', {
        method: 'POST',
        authenticated: false,
        body: { correo: emailLimpio, password: passLimpio }
      });
      const usuarioAutenticado = guardarSesion(respuesta);
      const rutasPorRol = {
        admin: '/admin',
        cliente: '/cliente',
        recepcionista: '/recepcion',
        veterinario: '/veterinario'
      };
      navigate(rutasPorRol[usuarioAutenticado.rol]);
    } catch (error) {
      alert(error.message || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/Fondoregistro.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <Navbar bg="white" expand="lg" className="shadow-sm py-2 px-4 sticky-top">
        <Container fluid>
          <Navbar.Brand onClick={() => navigate('/')} className="d-flex align-items-center gap-3 cursor-pointer" style={{ cursor: 'pointer' }}>
            <img src="/Logo.jpeg" alt="Logo Zoolomascotas MX" style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.src = '/Logo.jpg'; }} />
            <span className="fs-3 fw-bold" style={{ color: '#0f2b5c', fontFamily: "'Montserrat', 'Fredoka', 'Poppins', sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>
              Zoolomascotas
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
            <Nav className="gap-2 align-items-center">
              <Button variant="primary" className="rounded-pill px-3 fw-bold small shadow-sm" style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }} onClick={() => navigate('/')}>Nosotros</Button>
              <Button variant="primary" className="rounded-pill px-3 fw-bold small shadow-sm" style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }} onClick={() => navigate('/hospitalizacion')}>Hospitalización</Button>
              <Button variant="primary" className="rounded-pill px-3 fw-bold small shadow-sm" style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }} onClick={() => navigate('/login')}>Iniciar sesión</Button>
              <Button variant="primary" className="rounded-pill px-3 fw-bold small shadow-sm" style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }} onClick={() => navigate('/registro')}>Crear cuenta</Button>
              <Button variant="success" className="rounded-pill px-4 fw-bold small shadow-sm" style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }} onClick={() => navigate('/contacto')}>¡Contáctanos!</Button>
            </Nav>
          </Navbar.Collapse>

          <div className="d-none d-xl-flex align-items-center gap-2 text-secondary small fw-semibold">
            <span></span><span>🛒</span><span className="fst-italic">¡Siempre a tu lado! 🐾</span>
          </div>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white bg-opacity-95">
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-1" style={{ color: '#0f2b5c' }}>Iniciar Sesión</h3>
                <small className="text-muted d-block">Portal de Gestión Médica y Atención Veterinaria</small>
              </div>

              <Form onSubmit={manejarLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-dark">Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="Ej. cliente@correo.com"
                    className="rounded-pill bg-light border-0 py-2 px-3 small"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-dark">Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    placeholder="••••••••"
                    className="rounded-pill bg-light border-0 py-2 px-3 small"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                  />
                </Form.Group>

                <div className="text-end mb-4">
                  <a href="#olvido" className="small text-primary text-decoration-none fw-semibold" onClick={(e) => { e.preventDefault(); alert('Se ha enviado un enlace de recuperación a su correo.'); }}>
                    ¿Olvidó su contraseña?
                  </a>
                </div>

                <Button type="submit" variant="primary" className="w-100 rounded-pill py-2.5 fw-bold shadow-sm border-0" style={{ backgroundColor: '#0288d1' }}>
                  Ingresar al Sistema
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};