import React from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const Contacto = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: 'url("public/Fondoregistro.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (NAVBAR UNIFICADO) */}
      <Navbar bg="white" expand="lg" className="shadow-sm py-2 px-4 sticky-top">
        <Container fluid>
          <Navbar.Brand
            onClick={() => navigate('/')}
            className="d-flex align-items-center gap-3 cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/Logo.jpeg"
              alt="Logo Zoolomascotas MX"
              style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/Logo.jpg'; }}
            />
            <span
              className="fs-3 fw-bold"
              style={{
                color: '#0f2b5c',
                fontFamily: "'Montserrat', 'Fredoka', 'Poppins', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
             
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
            <Nav className="gap-2 align-items-center">
              <Button
                variant="primary"
                className="rounded-pill px-3 fw-bold small shadow-sm"
                style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }}
                onClick={() => navigate('/')}
              >
                Nosotros
              </Button>
              <Button
                variant="primary"
                className="rounded-pill px-3 fw-bold small shadow-sm"
                style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }}
                onClick={() => navigate('/hospitalizacion')}
              >
                Hospitalización
              </Button>
              <Button
                variant="primary"
                className="rounded-pill px-3 fw-bold small shadow-sm"
                style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }}
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </Button>
              <Button
                variant="primary"
                className="rounded-pill px-3 fw-bold small shadow-sm"
                style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }}
                onClick={() => navigate('/registro')}
              >
                Crear cuenta
              </Button>
              <Button
                variant="success"
                className="rounded-pill px-4 fw-bold small shadow-sm"
                style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                onClick={() => navigate('/contacto')}
              >
                ¡Contáctanos!
              </Button>
            </Nav>
          </Navbar.Collapse>

          <div className="d-none d-xl-flex align-items-center gap-2 text-secondary small fw-semibold">
            <span>📍</span>
            <span>🛒</span>
            <span className="fst-italic">¡Siempre a tu lado! 🐾</span>
          </div>
        </Container>
      </Navbar>

      {/* 2. TARJETA DE CONTENIDO PRINCIPAL DE CONTACTO */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <Card className="border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white bg-opacity-95 text-center">
              
              {/* ENCABEZADO */}
              <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
                <span className="fs-2 text-primary" style={{ color: '#0f2b5c' }}>🗣️</span>
                <h2 className="fw-bold mb-0" style={{ color: '#0f2b5c' }}>
                  ¡Contáctanos!
                </h2>
              </div>

              {/* TARJETAS DE LAS DOS SEDES */}
              <Row className="g-4 mb-5 text-start">
                
                {/* SEDE PRINCIPAL */}
                <Col md={6}>
                  <Card className="border-0 bg-light rounded-4 p-4 h-100 shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="fs-5 text-primary">📍</span>
                      <h5 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                        Principal Zoolomascotas MX
                      </h5>
                    </div>

                    <div className="d-flex flex-column gap-2 text-secondary small">
                      <div className="d-flex align-items-start gap-2">
                        <span>📍</span>
                        <span>Carrera 1 #33-52, casa 472, segundo y tercer piso, conjunto portal de san ignacio, Soacha, San Mateo</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>📞</span>
                        <span>+57 321 906 7748</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>📱</span>
                        <span>+57 322 800 9723</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>✉️</span>
                        <span>mxzoolomascotas@gmail.com</span>
                      </div>
                      <div className="d-flex align-items-start gap-2 mt-2">
                        <span>🕒</span>
                        <div>
                          <div><strong>Lunes a Sábado:</strong> 9:00 AM - 7:00 PM</div>
                          <div><strong>Domingos y Festivos:</strong> 09:00 AM - 05:00 PM</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* SEDE SPA */}
                <Col md={6}>
                  <Card className="border-0 bg-light rounded-4 p-4 h-100 shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="fs-5 text-primary">📍</span>
                      <h5 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                        Spa Zoolomascotas Mx
                      </h5>
                    </div>

                    <div className="d-flex flex-column gap-2 text-secondary small">
                      <div className="d-flex align-items-start gap-2">
                        <span>📍</span>
                        <span>Carrera 6a este #33-75, Conjunto residencial morella, Soacha San mateo</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>📞</span>
                        <span>+57 321 906 7748</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>📱</span>
                        <span>+57 302 647 2124</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>✉️</span>
                        <span>mxzoolomascotas@gmail.com</span>
                      </div>
                      <div className="d-flex align-items-start gap-2 mt-2">
                        <span>🕒</span>
                        <div>
                          <div><strong>Lunes a Sábado:</strong> 09:00 AM - 07:00 PM</div>
                          <div><strong>Domingos y Festivos:</strong> 09:00 AM - 05:00 PM</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

              </Row>

              {/* SECCIÓN REDES SOCIALES */}
              <div className="pt-2">
                <h6 className="fw-bold mb-3" style={{ color: '#0f2b5c' }}>
                  Síguenos en nuestras redes sociales
                </h6>
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <span className="border border-info rounded-circle p-2 d-inline-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', cursor: 'pointer', color: '#0288d1' }}>
                    f
                  </span>
                  <span className="border border-info rounded-circle p-2 d-inline-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', cursor: 'pointer', color: '#0288d1' }}>
                    📷
                  </span>
                  <span className="border border-info rounded-circle p-2 d-inline-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', cursor: 'pointer', color: '#0288d1' }}>
                    💬
                  </span>
                  <span className="border border-info rounded-circle p-2 d-inline-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', cursor: 'pointer', color: '#0288d1' }}>
                    🎵
                  </span>
                  <span className="border border-info rounded-circle p-2 d-inline-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', cursor: 'pointer', color: '#0288d1' }}>
                    ▶
                  </span>
                </div>
              </div>

            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};