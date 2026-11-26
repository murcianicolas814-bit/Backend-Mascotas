
const API_URL = "http://localhost:3001";

// Identificación del cliente y veterinario
// IMPORTANTE: cambia estos nombres según los datos de tu db.json.
export const CLIENTE_ACTUAL = "Juan Pérez";
export const VETERINARIO = "Dr. Alejandro";

// Función para consultar registros
const get = async (tabla, filtros = "") => {
  const respuesta = await fetch(`${API_URL}/${tabla}${filtros}`);

  if (!respuesta.ok) {
    throw new Error(`Error consultando ${tabla}`);
  }

  return respuesta.json();
};

// Función para crear registros
const post = async (tabla, datos) => {
  const respuesta = await fetch(`${API_URL}/${tabla}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  if (!respuesta.ok) {
    throw new Error(`Error guardando en ${tabla}`);
  }

  return respuesta.json();
};

// Función para actualizar registros
const patch = async (tabla, id, datos) => {
  const respuesta = await fetch(`${API_URL}/${tabla}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  if (!respuesta.ok) {
    throw new Error(`Error actualizando ${tabla}`);
  }

  return respuesta.json();
};

// Función para eliminar registros
const remove = async (tabla, id) => {
  const respuesta = await fetch(`${API_URL}/${tabla}/${id}`, {
    method: "DELETE"
  });

  if (!respuesta.ok) {
    throw new Error(`Error eliminando de ${tabla}`);
  }

  return true;
};

// Objeto API utilizado por los diferentes paneles
export const api = {
  get,
  post,
  patch,
  delete: remove
};

// Registrar notificaciones
export const notificar = async (destinatario, mensaje, tipo = "info") => {
  return post("notificaciones", {
    id: Date.now(),
    destinatario,
    mensaje,
    tipo,
    fecha: new Date().toISOString(),
    leida: false
  });
};

// También dejamos disponibles las funciones individuales
export const obtenerDatos = get;
export const crearRegistro = post;
export const actualizarRegistro = patch;
export const eliminarRegistro = remove;
