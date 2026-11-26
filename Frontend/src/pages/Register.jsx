import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 Importamos SweetAlert2
import { backendRequest, guardarSesion } from '../services/backendApi';

export const Register = () => {
    const navigate = useNavigate();

    const [formRegistro, setFormRegistro] = useState({
        nombres: '',
        apellidos: '',
        documento: '',
        correo: '',
        telefono: '',
        contrasena: '',
        confirmarContrasena: '',
        nombreMascota: '',
        tipoMascota: 'PERRO'
    });

    const manejarRegistro = async (e) => {
        e.preventDefault();
        
        // 1. Limpiamos espacios en blanco
        const passLimpio = formRegistro.contrasena.trim();
        const confirmPassLimpio = formRegistro.confirmarContrasena.trim();

        // 👈 Reemplazamos el alert() nativo por SweetAlert2
        if (passLimpio !== confirmPassLimpio) {
            Swal.fire({
                icon: 'warning',
                title: 'Las contraseñas no coinciden',
                text: 'Por favor, verifica que ambas contraseñas sean exactamente iguales.',
                confirmButtonColor: '#0288d1'
            });
            return;
        }

        let cuentaCreada = false;
        try {
            const datosUsuario = {
                nombres: formRegistro.nombres.trim(),
                apellidos: formRegistro.apellidos.trim(),
                tipoDocumento: 'CC',
                documento: formRegistro.documento.trim(),
                correo: formRegistro.correo.trim().toLowerCase(),
                telefono: formRegistro.telefono.trim(),
                password: passLimpio
            };

            await backendRequest('/auth/register', {
                method: 'POST',
                authenticated: false,
                body: datosUsuario
            });
            cuentaCreada = true;

            const respuestaLogin = await backendRequest('/auth/login', {
                method: 'POST',
                authenticated: false,
                body: { correo: datosUsuario.correo, password: passLimpio }
            });
            guardarSesion(respuestaLogin);

            if (formRegistro.nombreMascota.trim()) {
                try {
                    await backendRequest('/mascotas', {
                    method: 'POST',
                    body: {
                        nombre: formRegistro.nombreMascota.trim(),
                        especie: formRegistro.tipoMascota
                    }
                    });
                } catch (error) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Cuenta creada; mascota pendiente',
                        text: `Tu cuenta se creó, pero no se pudo registrar la mascota: ${error.message}`,
                        confirmButtonColor: '#0288d1'
                    });
                    navigate('/cliente');
                    return;
                }
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Tu cuenta y tu mascota quedaron registradas.',
                confirmButtonColor: '#0288d1',
                timer: 2500,
                timerProgressBar: true
            });

            navigate('/cliente');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en el registro',
                text: cuentaCreada
                    ? `La cuenta se creó, pero no se pudo iniciar sesión. Inicia sesión manualmente: ${error.message}`
                    : error.message,
                confirmButtonColor: '#dc3545'
            });
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
            {/* 1. BARRA DE NAVEGACIÓN SUPERIOR */}
            <Navbar bg="white" expand="lg" className="shadow-sm py-2 px-4 sticky-top">
                <Container fluid>
                    <Navbar.Brand onClick={() => navigate('/')} className="d-flex align-items-center gap-3 cursor-pointer" style={{ cursor: 'pointer' }}>
                        <img src="/Logo.jpeg" alt="Logo Zoolomascotas MX" style={{ maxHeight: '70px', width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.src = '/Logo.jpg'; }} />
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
                        <span>📍</span><span>🛒</span><span className="fst-italic">¡Siempre a tu lado! 🐾</span>
                    </div>
                </Container>
            </Navbar>

            {/* 2. FORMULARIO DE REGISTRO CENTRADO */}
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={10} lg={7} xl={6}>
                        <Card className="border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white bg-opacity-95">

                            <div className="text-center mb-4">
                                <h3 className="fw-bold mb-1" style={{ color: '#0f2b5c' }}>
                                    Crear Cuenta de Usuario
                                </h3>
                                <small className="text-muted d-block">
                                    Registra tus datos y los de tu mascota para solicitar citas y seguimiento médico
                                </small>
                            </div>

                            <Form onSubmit={manejarRegistro}>

                                {/* DATOS PERSONALES */}
                                <h6 className="fw-bold text-primary mb-3">👤 Datos del Tutor / Propietario</h6>

                                <Row className="g-2 mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Nombres *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Ej. Carol Tatiana"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.nombres}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, nombres: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Apellidos *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Ej. Benavides Duarte"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.apellidos}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, apellidos: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="g-2 mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Correo Electrónico *</Form.Label>
                                            <Form.Control
                                                type="email"
                                                required
                                                placeholder="ejemplo@correo.com"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.correo}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, correo: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Teléfono de Contacto *</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                required
                                                placeholder="300 123 4567"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.telefono}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, telefono: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-dark">Documento de identidad *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        required
                                        placeholder="Número de documento"
                                        className="rounded-pill bg-light border-0 py-2 px-3 small"
                                        value={formRegistro.documento}
                                        onChange={(e) => setFormRegistro({ ...formRegistro, documento: e.target.value })}
                                    />
                                </Form.Group>

                                <Row className="g-2 mb-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Contraseña *</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.contrasena}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, contrasena: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Confirmar Contraseña *</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.confirmarContrasena}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, confirmarContrasena: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* DATOS DE LA MASCOTA */}
                                <h6 className="fw-bold text-primary mb-3">🐾 Datos de tu Primera Mascota</h6>

                                <Row className="g-2 mb-4">
                                    <Col md={7}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Nombre de la Mascota *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Ej. Kyra / Milo"
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.nombreMascota}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, nombreMascota: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark">Especie *</Form.Label>
                                            <Form.Select
                                                className="rounded-pill bg-light border-0 py-2 px-3 small"
                                                value={formRegistro.tipoMascota}
                                                onChange={(e) => setFormRegistro({ ...formRegistro, tipoMascota: e.target.value })}
                                            >
                                                <option value="PERRO">Perro 🐶</option>
                                                <option value="GATO">Gato 🐱</option>
                                                <option value="OTRO">Otro 🐾</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 rounded-pill py-2.5 fw-bold shadow-sm border-0 mb-3"
                                    style={{ backgroundColor: '#0288d1' }}
                                >
                                    Registrarse en Zoolomascotas MX
                                </Button>

                                <div className="text-center pt-2 border-top">
                                    <small className="text-muted me-2">¿Ya tienes una cuenta?</small>
                                    <Button
                                        variant="link"
                                        className="p-0 text-primary fw-bold text-decoration-none small"
                                        onClick={() => navigate('/login')}
                                    >
                                        Iniciar Sesión
                                    </Button>
                                </div>

                            </Form>

                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};