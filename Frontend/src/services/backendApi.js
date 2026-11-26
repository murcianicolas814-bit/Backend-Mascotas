const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function backendRequest(path, { method = 'GET', body, authenticated = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (authenticated) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Inicia sesión para continuar.');
    headers['X-Token'] = token;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error('El servidor devolvió una respuesta inválida.');
      }
      throw new Error(`El servidor respondió con contenido no válido (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    const details = data?.errors && Object.values(data.errors).join('; ');
    throw new Error(data?.message || data?.msg || details || `No se pudo completar la solicitud (HTTP ${response.status}).`);
  }

  return data;
}

export function guardarSesion(respuesta) {
  const usuarioBackend = respuesta?.data;
  if (!respuesta?.token || !usuarioBackend?._id) {
    throw new Error('El servidor no devolvió una sesión válida.');
  }

  const rolBackend = String(usuarioBackend.rol || '').toUpperCase();
  const rolesFrontend = {
    ADMIN: 'admin',
    ADMINISTRADOR: 'admin',
    CLIENTE: 'cliente',
    RECEPCIONISTA: 'recepcionista',
    VETERINARIO: 'veterinario',
  };
  const rol = rolesFrontend[rolBackend];
  if (!rol) throw new Error('El usuario tiene un rol no reconocido.');

  const usuario = {
    id: usuarioBackend._id,
    nombre: [usuarioBackend.nombres, usuarioBackend.apellidos].filter(Boolean).join(' '),
    correo: usuarioBackend.correo,
    rol,
  };

  localStorage.setItem('token', respuesta.token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  return usuario;
}

export function obtenerSesion() {
  const usuarioRaw = localStorage.getItem('usuario');
  if (!usuarioRaw) return null;

  try {
    return JSON.parse(usuarioRaw);
  } catch {
    localStorage.removeItem('usuario');
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}
