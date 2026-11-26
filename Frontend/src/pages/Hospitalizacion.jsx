import React from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const Hospitalizacion = () => {
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
            {/* 1. BARRA DE NAVEGACIÓN SUPERIOR (NAVBAR) */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-2 px-4 sticky-top">
                <Container fluid>
                    <Navbar.Brand
                        onClick={() => navigate('/')}
                        className="d-flex align-items-center gap-3 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                    >

                        <span
                            className="fs-3 fw-bold"
                            style={{
                                color: '#0f2b5c',
                                fontFamily: "'Montserrat', 'Fredoka', 'Poppins', sans-serif",
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}
                        >
                            <img
                                src="/Logo.jpeg"
                                alt="Logo Zoolomascotas MX"
                                style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }}
                                onError={(e) => { e.target.src = '/Logo.jpg'; }}
                            />
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

            {/* 2. TARJETA DE CONTENIDO DE HOSPITALIZACIÓN */}
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={10} xl={9}>
                        <Card className="border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white bg-opacity-95">

                            {/* ENCABEZADO DE SECCIÓN */}
                            <div className="text-center mb-5">
                                <Badge bg="success" className="px-3 py-2 rounded-pill mb-2 fs-6">
                                    🏥 Servicio Médico 24 Horas
                                </Badge>
                                <h2 className="fw-bold display-6 mb-2" style={{ color: '#0077b6' }}>
                                    Área de Hospitalización Veterinaria
                                </h2>
                                <div
                                    className="mx-auto rounded-pill mb-4"
                                    style={{ width: '80px', height: '4px', backgroundColor: '#0077b6' }}
                                ></div>
                                <p className="text-secondary leading-relaxed">
                                    Contamos con infraestructura de vanguardia y personal médico cualificado presente de día y de noche para el cuidado constante de tu mascota.
                                </p>
                            </div>

                            {/* CARACTERÍSTICAS PRINCIPALES */}
                            <Row className="g-4 mb-5">
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center">
                                        <span className="fs-1 mb-2">🐾</span>
                                        <h5 className="fw-bold text-dark mb-2">Áreas Separadas</h5>
                                        <p className="text-secondary small mb-0">
                                            Módulos insonorizados e independientes para caninos y felinos que minimizan el estrés durante la recuperación.
                                        </p>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center">
                                        <span className="fs-1 mb-2">👨‍⚕️</span>
                                        <h5 className="fw-bold text-dark mb-2">Monitoreo 24/7</h5>
                                        <p className="text-secondary small mb-0">
                                            Médicos veterinarios y auxiliares monitoreando signos vitales, administración de fármacos y evolución contínua.
                                        </p>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-light text-center">
                                        <span className="fs-1 mb-2">💊</span>
                                        <h5 className="fw-bold text-dark mb-2">Tecnología Médica</h5>
                                        <p className="text-secondary small mb-0">
                                            Bombas de infusión programadas, fluidoterapia, oxigenoterapia controlada y lámparas Térmicas de recuperación.
                                        </p>
                                    </Card>
                                </Col>
                            </Row>

                            {/* PROTOCOLOS Y REQUISITOS DE INGRESO */}
                            <Row className="g-4 mb-5">
                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <span className="fs-4">📋</span>
                                        <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                                            Protocolo de Ingreso
                                        </h4>
                                    </div>
                                    <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
                                        <li><strong>✔ Evaluación Médica Previa:</strong> Valoración por el veterinario de turno para determinar el plan de tratamiento.</li>
                                        <li><strong>✔ Consentimiento Informado:</strong> Firma de autorización de procedimientos por parte del tutor responsable.</li>
                                        <li><strong>✔ Exámenes Complementarios:</strong> Hemogramas y pruebas diagnósticas según el estado crítico del paciente.</li>
                                    </ul>
                                </Col>

                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <span className="fs-4">🕒</span>
                                        <h4 className="fw-bold mb-0" style={{ color: '#0077b6' }}>
                                            Horarios de Visitas e Informes
                                        </h4>
                                    </div>
                                    <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
                                        <li><strong>• Mañanas:</strong> 11:00 AM — 01:00 PM</li>
                                        <li><strong>• Tardes:</strong> 04:00 PM — 06:00 PM</li>
                                        <li><strong>• Reportes Médicos:</strong> 2 informes diarios vía WhatsApp con fotografías y evolución.</li>
                                    </ul>
                                </Col>
                            </Row>

                            {/* BOTÓN VOLVER */}
                            <div className="text-center pt-3">
                                <Button
                                    variant="primary"
                                    className="rounded-pill px-5 py-2 fw-bold shadow-sm"
                                    style={{ backgroundColor: '#0288d1', borderColor: '#0288d1' }}
                                    onClick={() => navigate('/')}
                                >
                                    ← Volver a Inicio
                                </Button>
                            </div>

                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};