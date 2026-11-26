import servicioModel from "../models/servicio.model.js"

const dbCrearServicio = async ( nuevoServicio ) => {
    return await servicioModel.create( nuevoServicio );  // Registrar en la BD
}

// Obtener la lista de usuarios con paginación y filtro de estado (activos, inactivos o todos)
const dbObtenerServicios = async ( page = 1, limit = 10, status = 'true' ) => {
    // Paso 1: Sanitizar los valores de paginación (números enteros >= 1)
    const pageNumber = Math.max( 1, Number( page ) || 1 );
    const limitNumber = Math.min( 100, Math.max( 1, Number( limit ) || 10 ) );

    // Paso 2: Calcular el desplazamiento o salto de registros (skip)
    // Fórmula: (página - 1) * límite
    const skip = ( pageNumber - 1 ) * limitNumber;

    // Paso 3: Construir el filtro dinámico según el query param 'status'
    //   - status === 'activo'  -> solo usuarios activos ({ status: 'Activo' })
    //   - status === 'inactivo' -> solo usuarios inactivos ({ status: 'Inactivo' })
    //   - status === 'todos'   -> todos sin distingo de status ({})
    //   - por defecto        -> solo usuarios activos ({ })
    let filter = {};

    if ( status == 'activo' ) {
        filter.estado = 'Activo';
    } else if ( status == 'inactivo' ) {
        filter.estado = 'Inactivo';
    } else if ( status == 'all' ) {
        filter = {}; // Objeto vacío: no filtra por status (trae todos)
    } else {
        filter = {}; // Valor por defecto
    }

    // Paso 4: Ejecutar en paralelo la consulta paginada y el conteo total con el mismo filtro
    const [ servicios, total ] = await Promise.all([
        // 4.1: Consulta los documentos aplicando el filtro, skip (saltar) y limit (cantidad máxima)
        servicioModel.find( filter )
            .sort({ nombre: 1 })
            .skip( skip )
            .limit( limitNumber ),

        // 4.2: Cuenta el total de documentos que coinciden exactamente con el filtro aplicado
        servicioModel.countDocuments( filter )
    ]);
    // Paso 5: Retornar los datos obtenidos junto con la metadata de paginación y filtro
    return {
        servicios,
        paginacion: {
            pagina: pageNumber,
            limite: limitNumber,
            total,
            totalPaginas: Math.ceil( total / limitNumber )
        },
        // Mantiene compatibilidad con integraciones que usan nombres actuales.
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil( total / limitNumber )
    };
}

const dbEliminarServicio = async ( id ) => {
    return await servicioModel.findOneAndDelete({ _id: id });
}

const dbActualizarServicio = async ( id, userUpdated ) => {
    return await servicioModel.findOneAndUpdate(
        { _id: id },            // Objeto de consulta para buscar el documento que deseamos actualizar
        userUpdated,            // El objeto con los datos del Documento que deseamos actualizar
        {
            new: true,          // Retorna el documento ya actualizado
            runValidators: true // Ejecuta las validaciones definidas en el Schema de Mongoose al actualizar
        }
    );
}

const dbObtenerServicio = async ( id ) => {
    // return await UserModel.findById( id );       // Obtiene un usuario por su ID
    return await servicioModel.findOne({ _id: id });
}

export {
    dbCrearServicio,
    dbActualizarServicio,
    dbEliminarServicio,
    dbObtenerServicios,
    dbObtenerServicio
}