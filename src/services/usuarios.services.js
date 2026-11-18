import Usuario from "../models/auth/usuario.model.js";
import { ROLES } from "../config/constant-roles.js";

const dbCreateUser = async (newUser) => {
    return await Usuario.create(newUser);  // Registrar en la BD
}

// Obtener la lista de usuarios con paginación y filtro de estado (activos, inactivos o todos)
const dbGetUsers = async (page = 1, limit = 10, status = 'true', rol = 'all') => {
    // Paso 1: Sanitizar los valores de paginación (números enteros >= 1)
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);

    // Paso 2: Calcular el desplazamiento o salto de registros (skip)
    const skip = (pageNumber - 1) * limitNumber;

    // Paso 3: Construir el filtro dinámico según el query param 'status' / 'activo'
    let filter = {};

    if (status === 'true' || status === true || status === 'activo') {
        filter.activo = true;
    } else if (status === 'false' || status === false || status === 'inactivo') {
        filter.activo = false;
    } else if (status === 'all' || status === 'todos') {
        filter = {}; // Objeto vacío: no filtra por status (trae todos)
    } else {
        filter.activo = true; // Valor por defecto
    }

    if (rol == ROLES.ADMIN) {
        filter.rol = ROLES.ADMIN;
    } else if (rol == ROLES.VETERINARIO) {
        filter.rol = ROLES.VETERINARIO;
    } else if (rol == ROLES.RECEPCIONISTA) {
        filter.rol = ROLES.RECEPCIONISTA;
    } else if (rol == ROLES.CLIENTE) {
        filter.rol = ROLES.CLIENTE;
    }

    console.log(' ::: ', filter);

    // Paso 4: Ejecutar en paralelo la consulta paginada y el conteo total con el mismo filtro
    const [users, total] = await Promise.all([
        Usuario.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .populate(['empleado', 'cliente']),

        Usuario.countDocuments(filter)
    ]);

    // Paso 5: Retornar los datos obtenidos junto con la metadata de paginación y filtro
    return {
        users,                                        // Lista de usuarios correspondientes a la página actual
        total,                                        // Total de usuarios que coinciden con el filtro
        page: pageNumber,                             // Número de página consultada
        limit: limitNumber,                           // Cantidad de registros devueltos por página
        totalPages: Math.ceil(total / limitNumber)  // Total de páginas disponibles
    };
}

const dbDeleteUser = async (id) => {
    return await Usuario.findByIdAndDelete(id);
}

const dbUpdateUser = async (id, userUpdated) => {
    return await Usuario.findByIdAndUpdate(
        id,
        userUpdated,
        {
            new: true,          // Retorna el documento ya actualizado
            runValidators: true // Ejecuta las validaciones definidas en el Schema de Mongoose al actualizar
        }
    ).populate(['empleado', 'cliente']);
}

const dbGetUser = async (id) => {
    return await Usuario.findById(id).populate(['empleado', 'cliente']);
}

// Obtiene un usuario por su correo electrónico.
// selectPassword: si es true, incluye el campo passwordHash (que tiene select: false por defecto)
const dbGetUserByEmail = async (correo, selectPassword = false) => {
    if (!correo) return null;
    let query = Usuario.findOne({
        correo: correo.toLowerCase(),
        activo: true
    });

    if (selectPassword) {
        query = query.select('+passwordHash');
    }

    return await query.populate(['empleado', 'cliente']).exec();
}

export {
    dbCreateUser,
    dbGetUsers,
    dbDeleteUser,
    dbUpdateUser,
    dbGetUser,
    dbGetUserByEmail
}
