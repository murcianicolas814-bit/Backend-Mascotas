import Usuario from "../models/auth/usuario.model.js";
import Cliente from "../models/auth/cliente.model.js";
import Empleado from "../models/auth/empleado.model.js";
import "../models/sede.model.js";
import "../models/servicio.model.js";
import { ROLES } from "../config/constant-roles.js";
import {
    orquestarCreacionUsuario,
    orquestarActualizacionUsuario,
    orquestarEliminacionUsuario,
    resolverPerfilCliente
} from "../helpers/user-orchestrator.helper.js";

/**
 * Crea un usuario en la base de datos junto a su perfil específico
 * (Cliente o Empleado) de forma atómica y en cascada.
 */
const dbCreateUser = async (newUser) => {
    return await orquestarCreacionUsuario(newUser);
};

// Obtener la lista de usuarios con paginación y filtro de estado y rol
const dbGetUsers = async (page = 1, limit = 10, status = 'true', rol = 'all') => {
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    let filter = {};

    if (status === 'true' || status === true || status === 'activo') {
        filter.activo = true;
    } else if (status === 'false' || status === false || status === 'inactivo') {
        filter.activo = false;
    } else if (status === 'all' || status === 'todos') {
        filter = {};
    } else {
        filter.activo = true;
    }

    if (rol && rol !== 'all' && rol !== 'todos') {
        if ([ROLES.ADMIN, ROLES.VETERINARIO, ROLES.RECEPCIONISTA, ROLES.CLIENTE].includes(rol)) {
            filter.rol = rol;
        }
    }

    const [users, total] = await Promise.all([
        Usuario.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .populate('cliente')
            .populate({
                path: 'empleado',
                populate: ['sedes', 'servicios']
            }),

        Usuario.countDocuments(filter)
    ]);

    return {
        users,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
    };
};

const dbDeleteUser = async (id) => {
    return await orquestarEliminacionUsuario(id);
};

const dbUpdateUser = async (id, userUpdated) => {
    return await orquestarActualizacionUsuario(id, userUpdated);
};

const dbGetUser = async (id) => {
    return await Usuario.findById(id)
        .populate('cliente')
        .populate({
            path: 'empleado',
            populate: ['sedes', 'servicios']
        });
};

// Obtiene un usuario por su correo electrónico.
const dbGetUserByEmail = async (correo, selectPassword = false) => {
    if (!correo) return null;
    let query = Usuario.findOne({
        correo: correo.toLowerCase(),
        activo: true
    });

    if (selectPassword) {
        query = query.select('+passwordHash');
    }

    return await query
        .populate('cliente')
        .populate({
            path: 'empleado',
            populate: ['sedes', 'servicios']
        })
        .exec();
};

// Obtiene el perfil de Cliente a partir del ID de Usuario o Cliente
const dbObtenerPerfilClientePorUsuario = async (identificador) => {
    return await resolverPerfilCliente(identificador);
};

// Obtiene la lista de veterinarios activos con sus sedes y servicios
const dbObtenerVeterinariosActivos = async (filtros = {}) => {
    return await Empleado.find({
        activo: true,
        roles: ROLES.VETERINARIO,
        ...filtros
    }).populate(['usuario', 'sedes', 'servicios']);
};

export {
    dbCreateUser,
    dbGetUsers,
    dbDeleteUser,
    dbUpdateUser,
    dbGetUser,
    dbGetUserByEmail,
    dbObtenerPerfilClientePorUsuario,
    dbObtenerVeterinariosActivos
};
