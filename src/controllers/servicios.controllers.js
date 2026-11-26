import { dbCrearServicio, dbObtenerServicios, dbEliminarServicio, dbActualizarServicio, dbObtenerServicio } from '../services/servicios.services.js'
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js'

const crearServicio = async (req, res) => {
    try {
        const usuarioEncontrado = req.userFound;
        const id = usuarioEncontrado._id
        
        const datosDeEntrada = req.body;
        datosDeEntrada.creadoPor = id;

        const data = await dbCrearServicio(datosDeEntrada);

        res.status(201).json({ msg: 'Servicio registrado con éxito', data });
    } catch (error) {
        console.error(error);
        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo registrar el servicio' });
    }
}

const obtenerServicios = async (req, res) => {
    try {

        // Paso 1: Extraer los query parameters de la URL
        // Ejemplos:
        //   - /api/users?status=true   (usuarios activos)
        //   - /api/users?status=false  (usuarios inactivos)
        //   - /api/users?status=all    (todos los usuarios)
        //   - /api/users?page=1&limit=10&status=all
        const { pagina = 1, limite = 10, estado = 'todos' } = req.query;
       
        // Paso 2: Invocar el servicio de consulta enviando paginación y filtro de estado

        const data = await dbObtenerServicios(pagina, limite, estado);

        res.json({
            msg: 'Lista de servicios obtenida con éxito',
            data: data
        });
        
    } catch (error) {
        console.error(error);

        res.status(500).json({
            msg:'No se pudo obtener los servicios'
        });
        
    }
} 

const eliminarServicio = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await dbEliminarServicio(id);

        if (!data) return res.status(404).json({ msg: 'Servicio no encontrado para eliminar' });

        res.json({
            msg: 'Servicio eliminado con éxito',
            data: data
        });

    } catch (error) {
        console.error(error);

        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo eliminar el servicio' });
        
    }
}

const actualizarServicio = async (req, res) => {
    try {
        const id = req.params.id;
        const datosDeEntrada = req.body;

        const data = await dbActualizarServicio( id, datosDeEntrada );

        if (!data) return res.status(404).json({ msg: 'Servicio no encontrado para actualizar' });

        res.json({
            msg: 'Servicio actualizado con éxito',
            data: data
        });

    } catch (error) {
        console.error(error);

        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo actualizar el servicio' });
    }
}

const obtenerServicio = async (req, res) => {
    try {
        const id = req.params.id
        const data = await dbObtenerServicio( id );

        if (!data) return res.status(404).json({ msg: 'Servicio no encontrado' });

        res.json({
            msg: 'Servicio obtenido con éxito',
            data: data
        });

    } catch (error) {
        console.error(error);

        const mongooseError = handleMongooseError(error);
        if (mongooseError) return res.status(400).json(mongooseError);
        res.status(500).json({ msg: 'No se pudo obtener el servicio por ID' });
    }
}

export {
    crearServicio, 
    obtenerServicios,
    eliminarServicio,
    actualizarServicio,
    obtenerServicio
}