import {
    dbCrearCliente,
    dbObtenerClientes,
    dbObtenerClientePorId,
    dbActualizarCliente,
    dbEliminarCliente
} from '../services/clientes.services.js';
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js';

const crearCliente = async (req, res) => {
    try {
        const datos = req.body;
        const data = await dbCrearCliente(datos);

        res.status(201).json({
            msg: 'Cliente registrado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(400).json({ msg: error.message || 'No se pudo registrar el cliente' });
    }
};

const obtenerClientes = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, activo } = req.query;
        const filtros = { activo };

        const data = await dbObtenerClientes(pagina, limite, filtros);

        res.json({
            msg: 'Lista de clientes obtenida con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ msg: 'No se pudo obtener la lista de clientes' });
    }
};

const obtenerClientePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dbObtenerClientePorId(id);

        if (!data) {
            return res.status(404).json({ msg: 'Cliente no encontrado' });
        }

        res.json({
            msg: 'Cliente obtenido con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener cliente por ID:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(500).json({ msg: 'Error al consultar el cliente' });
    }
};

const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const data = await dbActualizarCliente(id, datos);

        if (!data) {
            return res.status(404).json({ msg: 'Cliente no encontrado para actualizar' });
        }

        res.json({
            msg: 'Cliente actualizado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(400).json({ msg: error.message || 'No se pudo actualizar el cliente' });
    }
};

const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dbEliminarCliente(id);

        if (!data) {
            return res.status(404).json({ msg: 'Cliente no encontrado para eliminar' });
        }

        res.json({
            msg: 'Cliente eliminado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(500).json({ msg: 'Error al eliminar el cliente' });
    }
};

export {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente
};
