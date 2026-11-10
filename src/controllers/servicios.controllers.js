import { dbCrearServicio, dbObtenerServicios, dbEliminarServicio, dbActualizarServicio, dbObtenerServicio } from '../services/servicios.services.js'

const crearServicio = async (req, res) => {
    try {
        const usuarioEncontrado = req.userFound;
        const id = usuarioEncontrado._id
        
        const datosDeEntrada = req.body;
        datosDeEntrada.creadoPor = id;

        const data = await dbCrearServicio(datosDeEntrada);

        res.json({ msg: 'Registra servicio', data: data});
    } catch (error) {
        console.error(error);

         if( error.name == 'ValidationError' ) {
            const errors = {};

            // Iterar los errores para extraer el nombre de la propiedad y el error especifico
            for( const field in error.errors ) {
                errors[field] = error.errors[field].message;
            }

            res.json({ errors });   // Retorna un error especifico de campo
        }

        res.json({ msg: 'No se pudo registrar el producto' });
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
            msg: 'Listar servicios',
            data: data
        });
        
    } catch (error) {
        console.error(error);

        res.json({
            msg:'No se pudo obtener los servicios'
        });
        
    }
} 

const eliminarServicio = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await dbEliminarServicio(id);

        res.json({
            msg: 'Eliminar servicio',
            data: data
        });

    } catch (error) {
        console.error(error);

        res.json({
            msg: 'No se pudo eliminar el servicio'
        });
        
    }
}

const actualizarServicio = async (req, res) => {
    try {
        const id = req.params.id;
        const datosDeEntrada = req.body;

        const data = await dbActualizarServicio( id, datosDeEntrada );

        res.json({
            msg: 'Servicio Actualizado',
            data: data
        });

    } catch (error) {
        console.error(error);

        res.json({
            msg: 'No se pudo actualizar el servicio'
        });
    }
}

const obtenerServicio = async (req, res) => {
    try {
        const id = req.params.id
        const data = await dbObtenerServicio( id );

        res.json({
            msg: 'Obtiene un servicio',
            data: data
        });

    } catch (error) {
        console.error(error);

         if( error.name === 'CastError' ) {
            return res.status(400).json({
                msg: 'Error en el formato del ID',
                [error.path]: `El identificador ${ error.value } no tiene el formato valido que requiere MongoDB`
            });
        }
        
        res.json({
            msg: 'No se pudo obtener el servicio por ID'
        });
    }
}

export {
    crearServicio, 
    obtenerServicios,
    eliminarServicio,
    actualizarServicio,
    obtenerServicio
}