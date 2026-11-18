
import { dbCreateSede, dbDeleteSede, dbGetSedes, dbGetSede, dbUpdateSede} from "../services/sedes.services.js";

const crearSede = async ( req, res ) => {
    try {
        // Extrae el ID del usuario
        const userFound = req.userFound;
        const id = userFound._id;

        // Extrae los datos del cuerpo de la petición
        const inputData = req.body;
        inputData.creadoPor = id;

        // Usar el servicio para registrar
        const data = await dbCreateSede( inputData );

        res.json({ 
            msg: 'Sede Creada', 
            data: data 
        });

    }
    catch ( error ) {
        console.error( error );

        if( error.name === 'ValidationError' ) {
            const errors = {};

            for( const field in error.errors ) {
                errors[field] = error.errors[field].message;
            }

            return res.status(400).json({ errors });
        }

        res.status(500).json({ 
            msg: 'No se pudo registrar la sede' 
        });
    }
}

const getSedes = async ( req, res ) => {
    try {
        const data = await dbGetSedes();

        res.json({ 
            msg: 'Sedes obtenidas', 
            data: data 
        });
    } 
    catch ( error ) {
        console.error( error );

        res.status(500).json({ 
            msg: 'Error al obtener las sedes' 
        });
    }
}

const deleteSede = async ( req, res ) => {
    try {
        const id = req.params.id;

        const data = await dbDeleteSede( id );

        res.json({ 
            msg: 'Sede eliminada', 
            data: data 
        });
    }
    catch ( error ) {
        console.error( error );

        res.status(500).json({ 
            msg: 'Error al eliminar la sede' 
        });
    }
}

const updateSede = async ( req, res ) => {
    try {
        const id = req.params.id;
        const inputData = req.body;

        const data = await dbUpdateSede( id, inputData );

        res.json({ 
            msg: 'Sede actualizada', 
            data: data 
        });
    }
    catch ( error ) {
        console.error( error );

        res.status(500).json({ 
            msg: 'Error al actualizar la sede' 
        });
    }
}

const getSede = async ( req, res ) => {
    try {
        const id = req.params.id;

        const data = await dbGetSede( id );

        res.json({ 
            msg: 'Sede obtenida', 
            data: data 
        });
    }
    catch ( error ) {
        console.error( error );

        if( error.name === 'CastError' ) {
            return res.status(400).json({
                msg: 'Error en el formato del ID',
                [error.path]: `El identificador ${error.value} no tiene el formato válido que requiere MongoDB`
            });
        }

        res.status(500).json({ 
            msg: 'Error al obtener la sede' 
        });
    }
}

export {
    crearSede,
    getSedes,
    deleteSede,
    updateSede,
    getSede
}
