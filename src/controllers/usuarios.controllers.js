import { dbCreateUser, dbDeleteUser, dbGetUsers, dbGetUser, dbUpdateUser } from "../services/usuarios.services.js";
import handleMongooseError from "../helpers/handle-mongoose-error.helper.js";
import { generatePassword } from "../helpers/bcrypt.helpers.js";
import { ROLES } from "../config/constant-roles.js";

const createUser = async (req, res) => {
    try {
        const inputData = req.body;

        // Normalización de campos para compatibilidad con el nuevo modelo Usuario:
        // 1. Nombres y apellidos
        if (!inputData.nombres && inputData.name) {
            inputData.nombres = inputData.name;
        }
        if (!inputData.apellidos) {
            inputData.apellidos = inputData.apellido || ' ';
        }

        // 2. Correo electrónico
        if (!inputData.correo && inputData.email) {
            inputData.correo = inputData.email;
        }

        // 3. Contraseña: se encripta y se guarda en passwordHash
        const plainPassword = inputData.password || inputData.passwordHash;
        if (plainPassword) {
            inputData.passwordHash = generatePassword(plainPassword);
            delete inputData.password;
        }

        // 4. Rol
        if (!inputData.rol && inputData.role) {
            const roleMap = {
                'ADMIN': ROLES.ADMIN,
                'ADMINISTRADOR': ROLES.ADMIN,
                'VETERINARIO': ROLES.VETERINARIO,
                'RECEPCIONISTA': ROLES.RECEPCIONISTA,
                'CUSTOMER': ROLES.CLIENTE,
                'CLIENTE': ROLES.CLIENTE
            };
            inputData.rol = roleMap[inputData.role] || inputData.role;
        }

        // Si no viene rol especificado, por defecto CLIENTE
        if (!inputData.rol) {
            inputData.rol = ROLES.CLIENTE;
        }

        // 5. Estado / Activo
        if (inputData.status !== undefined && inputData.activo === undefined) {
            inputData.activo = inputData.status;
            delete inputData.status;
        }

        // Usar el servicio para registrar (orquesta en cascada el Usuario y su perfil)
        const data = await dbCreateUser(inputData);

        const userObj = data.toObject ? data.toObject() : { ...data };
        delete userObj.passwordHash;

        res.status(201).json({ msg: 'Usuario registrado con éxito', data: userObj });
    }
    catch (error) {
        console.error('Error al registrar usuario:', error);

        // Verifica si la excepción proviene de una validación de Mongoose
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(400).json({ msg: error.message || 'No se pudo registrar el usuario' });
    }
}

// Controlador para listar usuarios con paginación y filtro de status/activo
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'true', rol = 'all' } = req.query;

        const data = await dbGetUsers(page, limit, status, rol);

        res.json({
            msg: 'Lista de Usuarios',
            data: data
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'No ha podido obtener los usuarios'
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await dbDeleteUser(id);

        if (!data) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({
            msg: 'Usuario y perfil asociado eliminados con éxito en cascada',
            data: data
        });
    }
    catch (error) {
        console.error(error);

        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(500).json({
            msg: 'No se ha podido eliminar el usuario'
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const inputData = req.body;

        // Si se actualiza la contraseña, encriptar
        if (inputData.password) {
            inputData.passwordHash = generatePassword(inputData.password);
            delete inputData.password;
        }
        if (inputData.email && !inputData.correo) {
            inputData.correo = inputData.email;
            delete inputData.email;
        }
        if (inputData.name && !inputData.nombres) {
            inputData.nombres = inputData.name;
            delete inputData.name;
        }
        if (inputData.apellido && !inputData.apellidos) {
            inputData.apellidos = inputData.apellido;
            delete inputData.apellido;
        }
        if (inputData.role && !inputData.rol) {
            inputData.rol = inputData.role;
            delete inputData.role;
        }
        if (inputData.status !== undefined && inputData.activo === undefined) {
            inputData.activo = inputData.status;
            delete inputData.status;
        }

        // Usar el servicio para actualizar (orquesta Usuario y perfil Cliente/Empleado)
        const data = await dbUpdateUser(id, inputData);

        if (!data) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const userObj = data.toObject ? data.toObject() : { ...data };
        delete userObj.passwordHash;

        res.json({
            msg: 'Usuario y perfil sincronizados y actualizados con éxito',
            data: userObj
        });
    }
    catch (error) {
        console.error(error);

        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(500).json({
            msg: 'No se ha podido actualizar el usuario'
        });
    }
}

const getUser = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await dbGetUser(id);

        if (!data) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const userObj = data.toObject ? data.toObject() : { ...data };
        delete userObj.passwordHash;

        res.json({
            msg: 'Obtiene un usuario',
            data: userObj
        });
    }
    catch (error) {
        console.error(error);

        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(500).json({
            msg: 'No se pudo obtener usuario por ID'
        });
    }
}

export {
    createUser,
    getUsers,
    deleteUser,
    updateUser,
    getUser
}
