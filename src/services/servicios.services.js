import servicioModel from "../models/servicio.model.js"

const dbCrearServicio = async ( nuevoServicio ) => {
    return await servicioModel.create( nuevoServicio );  // Registrar en la BD
}

// Obtener la lista de usuarios con paginación y filtro de estado (activos, inactivos o todos)
const dbObtenerServicios = async ( page = 1, limit = 10, status = 'true' ) => {
    console.log(page, limit, status)
    // Paso 1: Sanitizar los valores de paginación (números enteros >= 1)
    const pageNumber = Math.max( 1, Number( page ) || 1 );
    const limitNumber = Math.max( 1, Number( limit ) || 10 );

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
            .skip( skip )
            .limit( limitNumber )
            .populate('creadoPor'),

        // 4.2: Cuenta el total de documentos que coinciden exactamente con el filtro aplicado
        servicioModel.countDocuments( filter )
    ]);
    console.log(servicios)
    // Paso 5: Retornar los datos obtenidos junto con la metadata de paginación y filtro
    return {
        servicios,                                        // Lista de usuarios correspondientes a la página actual
        total,                                        // Total de usuarios que coinciden con el filtro
        page: pageNumber,                             // Número de página consultada
        limit: limitNumber,                           // Cantidad de registros devueltos por página
        totalPages: Math.ceil( total / limitNumber ) // Total de páginas disponibles
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