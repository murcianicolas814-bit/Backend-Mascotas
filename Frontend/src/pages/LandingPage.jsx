import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [showContacto, setShowContacto] = useState(false);
  const [mensajeContacto, setMensajeContacto] = useState({ nombre: '', correo: '', mensaje: '' });

  const enviarContacto = (e) => {
    e.preventDefault();
    alert('¡Gracias por escribirnos! Nuestro equipo se pondrá en contacto contigo pronto.');
    setShowContacto(false);
    setMensajeContacto({ nombre: '', correo: '', mensaje: '' });
  };

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
      {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (NAVBAR) */}
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
                onClick={() => setShowContacto(true)}
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

      {/* 2. TARJETA DE CONTENIDO PRINCIPAL CENTRADA */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <Card className="border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white bg-opacity-95">
              
              {/* SECCIÓN SOBRE NOSOTROS */}
              <div className="text-center mb-5">
                <h2 className="fw-bold display-6 mb-2" style={{ color: '#0077b6' }}>
                  Sobre Nosotros
                </h2>
                <div
                  className="mx-auto rounded-pill mb-4"
                  style={{ width: '80px', height: '4px', backgroundColor: '#0077b6' }}
                ></div>
              </div>

              <Row className="g-4 mb-5">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fs-4">🐾</span>
                    <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                      ¿Quiénes somos?
                    </h4>
                  </div>
                  <p className="text-secondary small leading-relaxed">
                    En <strong>Zoolomascotas MX</strong> somos un equipo de profesionales apasionados por el bienestar animal. Llevamos más de 10 años brindando atención veterinaria de calidad, con un trato cercano, respetuoso y comprometido con la salud de cada mascota que llega a nuestras instalaciones.
                  </p>
                  <p className="text-secondary small leading-relaxed mb-0">
                    Nuestra misión es ofrecer servicios médicos integrales, combinando experiencia, tecnología y mucho cariño para garantizar que tu compañero reciba la mejor atención posible.
                  </p>
                </Col>

                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fs-4">💙</span>
                    <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                      Nuestros Valores
                    </h4>
                  </div>
                  <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
                    <li><strong>✔ Amor por los animales:</strong> Tratamos a cada paciente con cariño.</li>
                    <li><strong>✔ Profesionalismo:</strong> Conocimientos y equipos actualizados.</li>
                    <li><strong>✔ Honestidad:</strong> Diagnósticos y tratamientos claros.</li>
                    <li><strong>✔ Compromiso:</strong> Acompañamiento en cada etapa de la vida de tu mascota.</li>
                    <li><strong>✔ Accesibilidad:</strong> Atención de calidad adaptada a tus posibilidades.</li>
                  </ul>
                </Col>
              </Row>

              <Row className="g-4 mb-5">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fs-4">🎯</span>
                    <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                      Nuestra Visión
                    </h4>
                  </div>
                  <p className="text-secondary small mb-0">
                    Ser la clínica veterinaria de referencia en la región, reconocida por nuestra excelencia médica, responsabilidad y confianza, promoviendo siempre la tenencia responsable.
                  </p>
                </Col>

                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="fs-4">📋</span>
                    <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                      ¿Por qué elegirnos?
                    </h4>
                  </div>
                  <p className="text-secondary small mb-0">
                    Contamos con instalaciones cómodas, limpias y equipadas con tecnología de última generación. Nuestro personal está disponible para resolver tus dudas en cualquier situación.
                  </p>
                </Col>
              </Row>

              {/* SECCIÓN NUESTROS SERVICIOS */}
              <div className="text-center pt-3 mb-4">
                <h3 className="fw-bold mb-4" style={{ color: '#0077b6' }}>
                  Nuestros Servicios
                </h3>
                <Row className="g-3">
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center">
                      <div className="fs-1 text-primary mb-2">🩺</div>
                      <h6 className="fw-bold text-dark">Consulta General</h6>
                      <small className="text-muted">Chequeos de rutina y prevención</small>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card
                      className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/hospitalizacion')}
                    >
                      <div className="fs-1 text-primary mb-2">🏥</div>
                      <h6 className="fw-bold text-dark">Hospitalización 24/7</h6>
                      <small className="text-muted">Monitoreo médico continuo y recuperación</small>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center">
                      <div className="fs-1 text-primary mb-2">✂️</div>
                      <h6 className="fw-bold text-dark">Peluquería & Baño</h6>
                      <small className="text-muted">Estilismo y limpieza profesional</small>
                    </Card>
                  </Col>
                </Row>
              </div>

            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL CONTÁCTANOS */}
      <Modal show={showContacto} onHide={() => setShowContacto(false)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 bg-primary text-white p-4 rounded-top-4" style={{ backgroundColor: '#0288d1' }}>
          <Modal.Title className="fw-bold fs-4 d-flex align-items-center gap-2">
            <span>💬</span> ¡Ponte en contacto con Zoolomascotas MX!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <Row className="g-4">
            <Col md={5}>
              <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <h6 className="fw-bold text-primary mb-3">📍 Información de Atención</h6>
                <div className="small text-secondary d-flex flex-column gap-3">
                  <div>
                    <strong>📞 Teléfonos / Urgencias:</strong>
                    <div className="text-dark">+57 300 123 4567</div>
                  </div>
                  <div>
                    <strong>💬 WhatsApp Directo:</strong>
                    <div className="text-dark">+57 315 987 6543</div>
                  </div>
                  <div>
                    <strong>✉️ Correo Electrónico:</strong>
                    <div className="text-dark">contacto@zoolomascotasmx.com.co</div>
                  </div>
                  <div>
                    <strong>⏰ Horarios de Atención:</strong>
                    <div className="text-dark">Lunes a Sábado: 8:00 AM — 7:00 PM<br />Urgencias: 24 Horas</div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col md={7}>
              <Card className="border-0 shadow-sm rounded-4 p-3 bg-white">
                <h6 className="fw-bold text-primary mb-3">✉️ Envíanos un Mensaje</h6>
                <Form onSubmit={enviarContacto}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={mensajeContacto.nombre}
                      onChange={(e) => setMensajeContacto({ ...mensajeContacto, nombre: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={mensajeContacto.correo}
                      onChange={(e) => setMensajeContacto({ ...mensajeContacto, correo: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Mensaje o Consulta</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      required
                      placeholder="¿En qué te podemos ayudar?"
                      value={mensajeContacto.mensaje}
                      onChange={(e) => setMensajeContacto({ ...mensajeContacto, mensaje: e.target.value })}
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100 rounded-pill fw-bold" style={{ backgroundColor: '#22c55e' }}>
                    Enviar Mensaje
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

    </div>
  );
};