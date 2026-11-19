import Usuario from '../models/auth/usuario.model.js';
import Cliente from '../models/auth/cliente.model.js';
import Empleado from '../models/auth/empleado.model.js';
import '../models/sede.model.js';
import '../models/servicio.model.js';
import { ROLES } from '../config/constant-roles.js';
import { generatePassword } from './bcrypt.helpers.js';

/**
 * Orquestador para la creación de usuarios con perfiles en cascada.
 * Garantiza que todo usuario creado tenga su correspondiente documento
 * en 'clientes' o 'empleados' y maneja rollback en caso de fallo.
 *
 * @param {Object} inputData - Datos unificados del usuario y su perfil
 * @returns {Promise<Object>} Documento de Usuario poblado con su perfil
 */
export const orquestarCreacionUsuario = async (inputData) => {
    // 1. Determinar rol efectivo
    const rol = inputData.rol || ROLES.CLIENTE;

    // 2. Extraer datos correspondientes al modelo Usuario
    const datosUsuario = {
        nombres: inputData.nombres,
        apellidos: inputData.apellidos,
        tipoDocumento: inputData.tipoDocumento || 'CC',
        documento: inputData.documento,
        correo: inputData.correo,
        telefono: inputData.telefono,
        passwordHash: inputData.passwordHash,
        rol: rol,
        activo: inputData.activo !== undefined ? inputData.activo : true
    };

    // 3. Crear el documento base de Usuario
    const nuevoUsuario = await Usuario.create(datosUsuario);

    try {
        // 4. Cascada según el rol
        if (rol === ROLES.CLIENTE) {
            // Datos específicos del perfil Cliente
            const datosCliente = {
                usuario: nuevoUsuario._id,
                direccion: inputData.direccion || 'Dirección no especificada',
                consentimientoDatos: inputData.consentimientoDatos !== undefined ? inputData.consentimientoDatos : true,
                contactoEmergencia: inputData.contactoEmergencia || {},
                observaciones: inputData.observaciones || '',
                activo: nuevoUsuario.activo
            };

            const nuevoCliente = await Cliente.create(datosCliente);

            // Enlazar bidireccionalmente
            await Usuario.findByIdAndUpdate(nuevoUsuario._id, { cliente: nuevoCliente._id });

        } else if ([ROLES.ADMIN, ROLES.VETERINARIO, ROLES.RECEPCIONISTA].includes(rol)) {
            // Asegurar que el array de roles contenga el rol asignado
            const rolesEmpleado = Array.isArray(inputData.roles) && inputData.roles.length > 0 
                ? inputData.roles 
                : [rol];

            // Datos específicos del perfil Empleado
            const datosEmpleado = {
                usuario: nuevoUsuario._id,
                roles: rolesEmpleado,
                fechaContratacion: inputData.fechaContratacion || Date.now(),
                cargo: inputData.cargo || (rol === ROLES.VETERINARIO ? 'Médico Veterinario' : rol === ROLES.RECEPCIONISTA ? 'Recepcionista' : 'Administrador'),
                sedes: inputData.sedes || [],
                servicios: inputData.servicios || [],
                tarjetaProfesional: inputData.tarjetaProfesional,
                especialidades: inputData.especialidades || [],
                turno: inputData.turno || 'ROTATIVO',
                cajaAsignada: inputData.cajaAsignada,
                nivelAcceso: inputData.nivelAcceso || 'TOTAL',
                activo: nuevoUsuario.activo
            };

            const nuevoEmpleado = await Empleado.create(datosEmpleado);

            // Enlazar bidireccionalmente
            await Usuario.findByIdAndUpdate(nuevoUsuario._id, { empleado: nuevoEmpleado._id });
        }

        // 5. Retornar el usuario con su perfil poblado
        return await Usuario.findById(nuevoUsuario._id)
            .populate('cliente')
            .populate({
                path: 'empleado',
                populate: ['sedes', 'servicios']
            });

    } catch (error) {
        // ROLLBACK: Si la creación del perfil falló, eliminamos el usuario huérfano
        await Usuario.findByIdAndDelete(nuevoUsuario._id);
        throw error;
    }
};

/**
 * Orquestador para la actualización de usuarios y sus perfiles en cascada.
 * Actualiza los datos personales en 'usuarios' y propaga automáticamente
 * las modificaciones hacia 'clientes' o 'empleados'.
 *
 * @param {string} id - ID del Usuario a actualizar
 * @param {Object} datosActualizar - Datos a actualizar
 * @returns {Promise<Object|null>} Documento de Usuario actualizado y poblado
 */
export const orquestarActualizacionUsuario = async (id, datosActualizar) => {
    const usuarioActual = await Usuario.findById(id);
    if (!usuarioActual) return null;

    // 1. Extraer campos correspondientes al modelo Usuario
    const camposUsuario = {};
    const camposValidosUsuario = [
        'nombres', 'apellidos', 'tipoDocumento', 'documento',
        'correo', 'telefono', 'rol', 'activo'
    ];

    for (const campo of camposValidosUsuario) {
        if (datosActualizar[campo] !== undefined) {
            camposUsuario[campo] = datosActualizar[campo];
        }
    }

    // Si viene password en texto plano, encriptarlo
    if (datosActualizar.password) {
        camposUsuario.passwordHash = generatePassword(datosActualizar.password);
    } else if (datosActualizar.passwordHash) {
        camposUsuario.passwordHash = datosActualizar.passwordHash;
    }

    // 2. Actualizar Usuario si hay campos que le correspondan
    if (Object.keys(camposUsuario).length > 0) {
        await Usuario.findByIdAndUpdate(id, camposUsuario, { runValidators: true });
    }

    // 3. Sincronizar en cascada hacia el perfil Cliente si existe
    if (usuarioActual.cliente) {
        const camposCliente = {};
        const camposValidosCliente = ['direccion', 'consentimientoDatos', 'contactoEmergencia', 'observaciones', 'activo'];
        for (const campo of camposValidosCliente) {
            if (datosActualizar[campo] !== undefined) {
                camposCliente[campo] = datosActualizar[campo];
            }
        }
        if (Object.keys(camposCliente).length > 0) {
            await Cliente.findByIdAndUpdate(usuarioActual.cliente, camposCliente, { runValidators: true });
        }
    }

    // 4. Sincronizar en cascada hacia el perfil Empleado si existe
    if (usuarioActual.empleado) {
        const camposEmpleado = {};
        const camposValidosEmpleado = [
            'roles', 'cargo', 'fechaContratacion', 'sedes',
            'tarjetaProfesional', 'especialidades', 'servicios',
            'turno', 'cajaAsignada', 'nivelAcceso', 'activo'
        ];
        for (const campo of camposValidosEmpleado) {
            if (datosActualizar[campo] !== undefined) {
                camposEmpleado[campo] = datosActualizar[campo];
            }
        }
        if (Object.keys(camposEmpleado).length > 0) {
            await Empleado.findByIdAndUpdate(usuarioActual.empleado, camposEmpleado, { runValidators: true });
        }
    }

    // 5. Retornar el usuario actualizado con todos sus perfiles poblados
    return await Usuario.findById(id)
        .populate('cliente')
        .populate({
            path: 'empleado',
            populate: ['sedes', 'servicios']
        });
};

/**
 * Orquestador para la eliminación en cascada limpia de un usuario y sus perfiles asociados.
 *
 * @param {string} id - ID del Usuario a eliminar
 * @returns {Promise<Object|null>} Documento de Usuario eliminado
 */
export const orquestarEliminacionUsuario = async (id) => {
    const usuario = await Usuario.findById(id);
    if (!usuario) return null;

    // Eliminar perfil de cliente en cascada si existe
    if (usuario.cliente) {
        await Cliente.findByIdAndDelete(usuario.cliente);
    }

    // Eliminar perfil de empleado en cascada si existe
    if (usuario.empleado) {
        await Empleado.findByIdAndDelete(usuario.empleado);
    }

    // Eliminar documento principal de Usuario
    return await Usuario.findByIdAndDelete(id);
};

/**
 * Resuelve un perfil de Cliente a partir de su ID o del ID del Usuario asociado.
 * Permite que los endpoints de Mascota y Cita acepten indistintamente clienteId o usuarioId.
 *
 * @param {string|mongoose.Types.ObjectId} identificador - ID de Cliente o de Usuario
 * @returns {Promise<Object>} Documento de Cliente
 */
export const resolverPerfilCliente = async (identificador) => {
    if (!identificador) {
        throw new Error('Debe proporcionar un identificador de cliente o usuario');
    }

    // 1. Intentar buscar directamente como ID de Cliente
    let cliente = await Cliente.findById(identificador).populate('usuario');
    if (cliente) return cliente;

    // 2. Si no es ID de Cliente, intentar buscar como ID de Usuario
    const usuario = await Usuario.findById(identificador);
    if (usuario && usuario.cliente) {
        cliente = await Cliente.findById(usuario.cliente).populate('usuario');
        if (cliente) return cliente;
    }

    throw new Error(`No se encontró un perfil de cliente válido para el ID: ${identificador}`);
};

/**
 * Resuelve un perfil de Empleado con rol de VETERINARIO a partir de su ID o del ID del Usuario asociado.
 * Valida que el empleado tenga asignado el rol VETERINARIO para asignaciones clínicas.
 *
 * @param {string|mongoose.Types.ObjectId} identificador - ID de Empleado o de Usuario
 * @returns {Promise<Object>} Documento de Empleado
 */
export const resolverPerfilVeterinario = async (identificador) => {
    if (!identificador) {
        throw new Error('Debe proporcionar un identificador de veterinario o usuario');
    }

    // 1. Intentar buscar directamente como ID de Empleado
    let empleado = await Empleado.findById(identificador).populate(['usuario', 'sedes', 'servicios']);
    if (empleado) {
        const esVeterinario = empleado.roles && empleado.roles.includes(ROLES.VETERINARIO);
        if (!esVeterinario) {
            throw new Error(`El empleado con ID ${identificador} no cuenta con el rol de VETERINARIO`);
        }
        return empleado;
    }

    // 2. Intentar buscar como ID de Usuario
    const usuario = await Usuario.findById(identificador);
    if (usuario && usuario.empleado) {
        empleado = await Empleado.findById(usuario.empleado).populate(['usuario', 'sedes', 'servicios']);
        if (empleado) {
            const esVeterinario = empleado.roles && empleado.roles.includes(ROLES.VETERINARIO);
            if (!esVeterinario) {
                throw new Error(`El usuario ${usuario.correo} no cuenta con un perfil de empleado con rol de VETERINARIO`);
            }
            return empleado;
        }
    }

    throw new Error(`No se encontró un perfil de veterinario para el ID: ${identificador}`);
};
