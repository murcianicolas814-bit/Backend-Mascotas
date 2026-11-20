import { dbCrearMascota, dbObtenerMascotas, dbObtenerMascotaPorId, dbActualizarMascota, dbEliminarMascota } from '../services/mascotas.services.js';
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js';
import { ROLES } from '../config/constant-roles.js';


const crearMascota = async (req, res) => {
    try {
        const datos = { ...req.body };

        // Si es cliente, la mascota debe pertenecerle a él
        if (req.userFound.rol === ROLES.CLIENTE) {
            if (!req.userFound.cliente) {
                return res.status(403).json({
                    msg: 'El usuario no tiene un perfil de cliente asociado'
                });
            }

            datos.cliente = req.userFound.cliente._id;
        }

        const data = await dbCrearMascota(datos);

        res.status(201).json({
            msg: 'Mascota registrada con éxito',
            data
        });

    } catch (error) {
        console.error('Error al crear mascota:', error);

        const validationErrors = handleMongooseError(error);

        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(400).json({
            msg: error.message || 'No se pudo registrar la mascota'
        });
    }
};



const obtenerMascotas = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, activa, especie, cliente } = req.query;

        const filtros = { activa, especie, cliente };

        // El cliente solamente puede consultar sus propias mascotas
        if (req.userFound.rol === ROLES.CLIENTE) {
            if (!req.userFound.cliente) {
                return res.status(403).json({
                    msg: 'El usuario no tiene un perfil de cliente asociado'
                });
            }

            filtros.cliente = req.userFound.cliente._id;
        }

        const data = await dbObtenerMascotas(pagina, limite, filtros);

        res.json({
            msg: 'Lista de mascotas obtenida con éxito',
            data
        });

    } catch (error) {
        console.error('Error al obtener mascotas:', error);

        res.status(500).json({
            msg: 'No se pudo obtener la lista de mascotas'
        });
    }
};



const obtenerMascotaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await dbObtenerMascotaPorId(id);

        if (!data) {
            return res.status(404).json({
                msg: 'Mascota no encontrada'
            });
        }

        // Comprobar que el cliente sea propietario de la mascota
        if (req.userFound.rol === ROLES.CLIENTE) {
            const clienteId = req.userFound.cliente?._id;

            if (!clienteId || String(data.cliente?._id) !== String(clienteId)) {
                return res.status(404).json({
                    msg: 'Mascota no encontrada'
                });
            }
        }

        res.json({
            msg: 'Mascota obtenida con éxito',
            data
        });

    } catch (error) {
        console.error('Error al obtener mascota por ID:', error);

        const validationErrors = handleMongooseError(error);

        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(500).json({
            msg: 'Error al consultar la mascota'
        });
    }
};



const actualizarMascota = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = { ...req.body };

        // Primero verificamos que la mascota exista
        const mascota = await dbObtenerMascotaPorId(id);

        if (!mascota) {
            return res.status(404).json({
                msg: 'Mascota no encontrada para actualizar'
            });
        }

        // Un cliente solamente puede modificar sus propias mascotas
        if (req.userFound.rol === ROLES.CLIENTE) {
            const clienteId = req.userFound.cliente?._id;

            if (!clienteId || String(mascota.cliente?._id) !== String(clienteId)) {
                return res.status(404).json({
                    msg: 'Mascota no encontrada para actualizar'
                });
            }
        }

        // No permitimos cambiar el propietario desde esta operación
        delete datos.cliente;

        const data = await dbActualizarMascota(id, datos);

        res.json({
            msg: 'Mascota actualizada con éxito',
            data
        });

    } catch (error) {
        console.error('Error al actualizar mascota:', error);

        const validationErrors = handleMongooseError(error);

        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        res.status(400).json({
            msg: error.message || 'No se pudo actualizar la mascota'
        });
    }
};


const eliminarMascota = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await dbEliminarMascota(id);

        res.json({
            msg: 'Eliminar mascota',
            data: data
        });

    } catch (error) {
        console.error(error);

        res.json({
            msg: 'No se pudo eliminar la mascota'
        });
        
    }
}


export {
    crearMascota,
    obtenerMascotas,
    obtenerMascotaPorId,
    actualizarMascota,
    eliminarMascota
};
