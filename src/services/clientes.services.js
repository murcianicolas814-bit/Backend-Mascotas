import Cliente from '../models/auth/cliente.model.js';
import Usuario from '../models/auth/usuario.model.js';
import { generatePassword } from '../helpers/bcrypt.helpers.js';
import { ROLES } from '../config/constant-roles.js';

/**
 * Crea un cliente en la base de datos y lo vincula con su cuenta de Usuario.
 * Permite recibir datos de un usuario nuevo para crearlo al vuelo o asociar un usuario existente.
 */
const dbCrearCliente = async (datos) => {
    let usuarioId = datos.usuario || datos.usuarioId;

    // Si no se proporcionó usuarioId pero sí datos personales de usuario
    if (!usuarioId && (datos.correo || datos.email)) {
        const correo = (datos.correo || datos.email).toLowerCase().trim();
        let usuarioExistente = await Usuario.findOne({ correo });

        if (usuarioExistente) {
            if (usuarioExistente.cliente) {
                throw new Error('El usuario con este correo ya tiene un perfil de cliente asignado');
            }
            usuarioId = usuarioExistente._id;
        } else {
            const plainPassword = datos.password || 'Cliente123*';

            const nuevoUsuario = await Usuario.create({
                nombres: datos.nombres || 'Cliente',
                apellidos: datos.apellidos || 'ZoloMascotas',
                tipoDocumento: datos.tipoDocumento || 'CC',
                documento: datos.documento || `${Date.now()}`,
                correo: correo,
                telefono: datos.telefono || '3000000000',
                passwordHash: generatePassword(plainPassword),
                rol: ROLES.CLIENTE,
                activo: datos.activo !== undefined ? datos.activo : true
            });

            usuarioId = nuevoUsuario._id;
        }
    }

    if (!usuarioId) {
        throw new Error('Debe proporcionar el ID de un usuario o los datos para registrarlo (correo, nombres, documento, etc.)');
    }

    // Crear el perfil del cliente
    const nuevoCliente = await Cliente.create({
        ...datos,
        usuario: usuarioId,
        consentimientoDatos: datos.consentimientoDatos !== undefined ? datos.consentimientoDatos : true
    });

    // Enlace bidireccional en el modelo Usuario
    await Usuario.findByIdAndUpdate(usuarioId, {
        cliente: nuevoCliente._id,
        rol: ROLES.CLIENTE
    });

    return await Cliente.findById(nuevoCliente._id).populate('usuario');
};

/**
 * Obtiene lista paginada de clientes con filtros opcionales.
 */
const dbObtenerClientes = async (pagina = 1, limite = 10, filtros = {}) => {
    const pageNumber = Math.max(1, Number(pagina) || 1);
    const limitNumber = Math.max(1, Number(limite) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (filtros.activo === 'true' || filtros.activo === true) {
        query.activo = true;
    } else if (filtros.activo === 'false' || filtros.activo === false) {
        query.activo = false;
    }

    const [clientes, total] = await Promise.all([
        Cliente.find(query)
            .skip(skip)
            .limit(limitNumber)
            .populate('usuario'),
        Cliente.countDocuments(query)
    ]);

    return {
        clientes,
        total,
        pagina: pageNumber,
        limite: limitNumber,
        totalPaginas: Math.ceil(total / limitNumber)
    };
};

/**
 * Obtiene un cliente por su ID.
 */
const dbObtenerClientePorId = async (id) => {
    return await Cliente.findById(id).populate('usuario');
};

/**
 * Actualiza los datos de un cliente (y de su usuario asociado si se envían).
 */
const dbActualizarCliente = async (id, datosActualizar) => {
    const cliente = await Cliente.findById(id);
    if (!cliente) return null;

    // Si se enviaron campos personales para el usuario enlazado
    const camposUsuario = {};
    if (datosActualizar.nombres) camposUsuario.nombres = datosActualizar.nombres;
    if (datosActualizar.apellidos) camposUsuario.apellidos = datosActualizar.apellidos;
    if (datosActualizar.telefono) camposUsuario.telefono = datosActualizar.telefono;
    if (datosActualizar.documento) camposUsuario.documento = datosActualizar.documento;
    if (datosActualizar.tipoDocumento) camposUsuario.tipoDocumento = datosActualizar.tipoDocumento;
    if (datosActualizar.correo) camposUsuario.correo = datosActualizar.correo.toLowerCase().trim();

    if (Object.keys(camposUsuario).length > 0 && cliente.usuario) {
        await Usuario.findByIdAndUpdate(cliente.usuario, camposUsuario, { runValidators: true });
    }

    const clienteActualizado = await Cliente.findByIdAndUpdate(
        id,
        datosActualizar,
        { new: true, runValidators: true }
    ).populate('usuario');

    return clienteActualizado;
};

/**
 * Elimina un cliente y desvincula la referencia en el usuario.
 */
const dbEliminarCliente = async (id) => {
    const cliente = await Cliente.findById(id);
    if (!cliente) return null;

    if (cliente.usuario) {
        await Usuario.findByIdAndUpdate(cliente.usuario, { cliente: null });
    }

    return await Cliente.findByIdAndDelete(id);
};

export {
    dbCrearCliente,
    dbObtenerClientes,
    dbObtenerClientePorId,
    dbActualizarCliente,
    dbEliminarCliente
};
