import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Hospitalizacion } from './pages/Hospitalizacion';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Contacto } from './pages/Contacto';
import { VetDashboard } from './pages/VetDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { RecepcionDashboard } from './pages/RecepcionDashboard';
import ClienteDashboard from './pages/ClienteDashboard';
import { cerrarSesion, obtenerSesion } from './services/backendApi';

function RutaProtegida({ roles, children }) {
  const usuario = obtenerSesion();
  const token = localStorage.getItem('token');

  if (!usuario || !token) {
    cerrarSesion();
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    const rutasPorRol = {
      admin: '/admin',
      cliente: '/cliente',
      recepcionista: '/recepcion',
      veterinario: '/veterinario'
    };
    return <Navigate to={rutasPorRol[usuario.rol] || '/'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hospitalizacion" element={<Hospitalizacion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/veterinario" element={<RutaProtegida roles={['veterinario']}><VetDashboard /></RutaProtegida>} />
        <Route path="/admin" element={<RutaProtegida roles={['admin']}><AdminDashboard /></RutaProtegida>} />
        <Route path="/recepcion" element={<RutaProtegida roles={['recepcionista']}><RecepcionDashboard /></RutaProtegida>} />
        <Route path="/cliente" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/mascotas" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/mascotas/:id" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/citas" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/citas/nueva" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/historial" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/tratamientos" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />
        <Route path="/cliente/pqrs" element={<RutaProtegida roles={['cliente']}><ClienteDashboard /></RutaProtegida>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}