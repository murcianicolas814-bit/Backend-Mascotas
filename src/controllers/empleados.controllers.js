import {
    dbCrearEmpleado,
    dbObtenerEmpleados,
    dbObtenerEmpleadoPorId,
    dbActualizarEmpleado,
    dbEliminarEmpleado,
    dbObtenerVeterinariosActivos
} from '../services/empleados.services.js';
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js';

const crearEmpleado = async (req, res) => {
    try {
        const datos = req.body;
        const data = await dbCrearEmpleado(datos);

        res.status(201).json({
            msg: 'Empleado registrado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al crear empleado:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(400).json({ msg: error.message || 'No se pudo registrar el empleado' });
    }
};

const obtenerEmpleados = async (req, res) => {
    try {
        const { pagina = 1, limite = 10, rol, activo, sede, servicio } = req.query;
        const filtros = { rol, activo, sede, servicio };

        const data = await dbObtenerEmpleados(pagina, limite, filtros);

        res.json({
            msg: 'Lista de empleados obtenida con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({ msg: 'No se pudo obtener la lista de empleados' });
    }
};

const obtenerVeterinariosActivos = async (req, res) => {
    try {
        const empleados = await dbObtenerVeterinariosActivos();
        const veterinarios = empleados
            .filter((empleado) => empleado.usuario?.activo)
            .map((empleado) => ({
                _id: empleado._id,
                nombre: `${empleado.usuario.nombres} ${empleado.usuario.apellidos}`.trim(),
                cargo: empleado.cargo
            }));

        res.json({ ok: true, data: { veterinarios } });
    } catch (error) {
        console.error('Error al obtener veterinarios activos:', error);
        res.status(500).json({ ok: false, msg: 'No se pudo obtener la lista de veterinarios' });
    }
};

const obtenerEmpleadoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dbObtenerEmpleadoPorId(id);

        if (!data) {
            return res.status(404).json({ msg: 'Empleado no encontrado' });
        }

        res.json({
            msg: 'Empleado obtenido con éxito',
            data
        });
    } catch (error) {
        console.error('Error al obtener empleado por ID:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(500).json({ msg: 'Error al consultar el empleado' });
    }
};

const actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const data = await dbActualizarEmpleado(id, datos);

        if (!data) {
            return res.status(404).json({ msg: 'Empleado no encontrado para actualizar' });
        }

        res.json({
            msg: 'Empleado actualizado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(400).json({ msg: error.message || 'No se pudo actualizar el empleado' });
    }
};

const eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await dbEliminarEmpleado(id);

        if (!data) {
            return res.status(404).json({ msg: 'Empleado no encontrado para eliminar' });
        }

        res.json({
            msg: 'Empleado eliminado con éxito',
            data
        });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        const validationErrors = handleMongooseError(error);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }
        res.status(500).json({ msg: 'Error al eliminar el empleado' });
    }
};

export {
    crearEmpleado,
    obtenerEmpleados,
    obtenerVeterinariosActivos,
    obtenerEmpleadoPorId,
    actualizarEmpleado,
    eliminarEmpleado
};
