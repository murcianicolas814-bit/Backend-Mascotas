import {
    dbCrearSede,
    dbObtenerSedes,
    dbObtenerSedePorId,
    dbActualizarSede,
    dbEliminarSede
} from '../services/sedes.services.js';
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js';

const crearSede = async (req, res) => {
    try {
        const datos = {
            ...req.body,
            creadoPor: req.userFound._id
        };
        const data = await dbCrearSede(datos);

        res.status(201).json({
            msg: 'Sede registrada con éxito',
            data
        });
    } catch (error) {
        console.error('Error al crear sede:', error);
        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo registrar la sede' });
    }
};

const obtenerSedes = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, activa = 'true', ciudad, busqueda } = req.query;
        const data = await dbObtenerSedes(pagina, limite, { activa, ciudad, busqueda });

        res.json({
            msg: 'Lista de sedes obtenida con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener sedes:', error);
        res.status(500).json({ msg: 'No se pudo obtener la lista de sedes' });
    }
};

const obtenerSedePorId = async (req, res) => {
    try {
        const data = await dbObtenerSedePorId(req.params.id);

        if (!data) return res.status(404).json({ msg: 'Sede no encontrada' });

        res.json({
            msg: 'Sede obtenida con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener sede:', error);
        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo obtener la sede' });
    }
};

const actualizarSede = async (req, res) => {
    try {
        const data = await dbActualizarSede(req.params.id, req.body);

        if (!data) return res.status(404).json({ msg: 'Sede no encontrada para actualizar' });

        res.json({
            msg: 'Sede actualizada con éxito',
            data
        });
    } catch (error) {
        console.error('Error al actualizar sede:', error);
        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo actualizar la sede' });
    }
};

const eliminarSede = async (req, res) => {
    try {
        const data = await dbEliminarSede(req.params.id);

        if (!data) return res.status(404).json({ msg: 'Sede no encontrada para eliminar' });

        res.json({
            msg: 'Sede desactivada con éxito',
            data
        });
    } catch (error) {
        console.error('Error al eliminar sede:', error);
        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo desactivar la sede' });
    }
};

export {
    crearSede,
    obtenerSedes,
    obtenerSedePorId,
    actualizarSede,
    eliminarSede
};
