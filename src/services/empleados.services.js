import Empleado from '../models/auth/empleado.model.js';
import Usuario from '../models/auth/usuario.model.js';
import '../models/sede.model.js';
import '../models/servicio.model.js';
import { generatePassword } from '../helpers/bcrypt.helpers.js';
import { ROLES } from '../config/constant-roles.js';

/**
 * Crea un empleado en la base de datos y lo vincula con su cuenta de Usuario.
 * Permite recibir datos de un usuario nuevo para crearlo al vuelo o asociar un usuario existente.
 */
const dbCrearEmpleado = async (datos) => {
    let usuarioId = datos.usuario || datos.usuarioId;

    // Si no se proporcionó un usuario existente pero se enviaron datos para crearlo
    if (!usuarioId && (datos.correo || datos.email)) {
        const correo = (datos.correo || datos.email).toLowerCase().trim();
        let usuarioExistente = await Usuario.findOne({ correo });

        if (usuarioExistente) {
            if (usuarioExistente.empleado) {
                throw new Error('El usuario con este correo ya tiene un perfil de empleado asignado');
            }
            usuarioId = usuarioExistente._id;
        } else {
            // Determinar rol principal para la cuenta de Usuario
            const rolPrincipal = (datos.roles && datos.roles.length > 0) ? datos.roles[0] : ROLES.ADMIN;
            const plainPassword = datos.password || 'Empleado123*';

            const nuevoUsuario = await Usuario.create({
                nombres: datos.nombres || 'Empleado',
                apellidos: datos.apellidos || 'ZoloMascotas',
                tipoDocumento: datos.tipoDocumento || 'CC',
                documento: datos.documento || `${Date.now()}`,
                correo: correo,
                telefono: datos.telefono || '3000000000',
                passwordHash: generatePassword(plainPassword),
                rol: rolPrincipal,
                activo: datos.activo !== undefined ? datos.activo : true
            });

            usuarioId = nuevoUsuario._id;
        }
    }

    if (!usuarioId) {
        throw new Error('Debe proporcionar el ID de un usuario o los datos para crearlo (correo, nombres, documento, etc.)');
    }

    // Crear el perfil del empleado
    const nuevoEmpleado = await Empleado.create({
        ...datos,
        usuario: usuarioId
    });

    // Enlace bidireccional en el modelo Usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
        empleado: nuevoEmpleado._id,
        rol: (datos.roles && datos.roles[0]) ? datos.roles[0] : ROLES.ADMIN
    });

    return await Empleado.findById(nuevoEmpleado._id).populate(['usuario', 'sedes', 'servicios']);
};

/**
 * Obtiene lista paginada y filtrada de empleados.
 */
const dbObtenerEmpleados = async (pagina = 1, limite = 10, filtros = {}) => {
    const pageNumber = Math.max(1, Number(pagina) || 1);
    const limitNumber = Math.max(1, Number(limite) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Filtro por rol (ej. VETERINARIO, RECEPCIONISTA, ADMINISTRADOR)
    if (filtros.rol && filtros.rol !== 'todos' && filtros.rol !== 'all') {
        query.roles = filtros.rol;
    }

    // Filtro por estado activo/inactivo
    if (filtros.activo === 'true' || filtros.activo === true) {
        query.activo = true;
    } else if (filtros.activo === 'false' || filtros.activo === false) {
        query.activo = false;
    }

    // Filtro por sede
    if (filtros.sede) {
        query.sedes = filtros.sede;
    }

    // Filtro por servicio
    if (filtros.servicio) {
        query.servicios = filtros.servicio;
    }

    const [empleados, total] = await Promise.all([
        Empleado.find(query)
            .skip(skip)
            .limit(limitNumber)
            .populate(['usuario', 'sedes', 'servicios']),
        Empleado.countDocuments(query)
    ]);

    return {
        empleados,
        total,
        pagina: pageNumber,
        limite: limitNumber,
        totalPaginas: Math.ceil(total / limitNumber)
    };
};

/**
 * Obtiene un empleado por su ID con sus relaciones pobladas.
 */
const dbObtenerEmpleadoPorId = async (id) => {
    return await Empleado.findById(id).populate(['usuario', 'sedes', 'servicios']);
};

/**
 * Actualiza los datos de un empleado (y opcionalmente los datos de su usuario).
 */
const dbActualizarEmpleado = async (id, datosActualizar) => {
    const empleado = await Empleado.findById(id);
    if (!empleado) return null;

    // Si se enviaron campos personales para el usuario enlazado
    const camposUsuario = {};
    if (datosActualizar.nombres) camposUsuario.nombres = datosActualizar.nombres;
    if (datosActualizar.apellidos) camposUsuario.apellidos = datosActualizar.apellidos;
    if (datosActualizar.telefono) camposUsuario.telefono = datosActualizar.telefono;
    if (datosActualizar.documento) camposUsuario.documento = datosActualizar.documento;
    if (datosActualizar.tipoDocumento) camposUsuario.tipoDocumento = datosActualizar.tipoDocumento;
    if (datosActualizar.correo) camposUsuario.correo = datosActualizar.correo.toLowerCase().trim();

    if (Object.keys(camposUsuario).length > 0 && empleado.usuario) {
        await Usuario.findByIdAndUpdate(empleado.usuario, camposUsuario, { runValidators: true });
    }

    // Si se actualizan roles en el empleado, sincronizar el rol principal del usuario
    if (datosActualizar.roles && datosActualizar.roles.length > 0 && empleado.usuario) {
        await Usuario.findByIdAndUpdate(empleado.usuario, { rol: datosActualizar.roles[0] });
    }

    const empleadoActualizado = await Empleado.findByIdAndUpdate(
        id,
        datosActualizar,
        { new: true, runValidators: true }
    ).populate(['usuario', 'sedes', 'servicios']);

    return empleadoActualizado;
};

/**
 * Elimina un empleado de la BD y desvincula la referencia en el Usuario.
 */
const dbEliminarEmpleado = async (id) => {
    const empleado = await Empleado.findById(id);
    if (!empleado) return null;

    if (empleado.usuario) {
        await Usuario.findByIdAndUpdate(empleado.usuario, { empleado: null });
    }

    return await Empleado.findByIdAndDelete(id);
};

/**
 * Obtiene la lista de veterinarios activos para consultas y citas.
 */
const dbObtenerVeterinariosActivos = async (filtros = {}) => {
    return await Empleado.find({
        activo: true,
        roles: ROLES.VETERINARIO,
        ...filtros
    }).populate(['usuario', 'sedes', 'servicios']);
};

export {
    dbCrearEmpleado,
    dbObtenerEmpleados,
    dbObtenerEmpleadoPorId,
    dbActualizarEmpleado,
    dbEliminarEmpleado,
    dbObtenerVeterinariosActivos
};
