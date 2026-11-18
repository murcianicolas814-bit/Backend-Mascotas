import mascotaModel from "../models/mascota.model.js";
import mascotaModel from "../models/mascota.model.js"

const dbCrearMascota = async (nuevaMascota) => {
    return await mascotaModel.create(nuevaMascota);
}

const dbObtenerMascota = async (page = 1, limit = 10, activa = 'true', especie = 'all', raza = 'all', sexo = 'all', manejoEspecial = 'all', ) => {
    // Paso 1: Sanitizar los valores de paginación (números enteros >= 1)
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);

    // Paso 2: Calcular el desplazamiento o salto de registros (skip)
    const skip = (pageNumber - 1) * limitNumber;

    // Paso 3: Construir el filtro dinámico según el query param 'status' / 'activo'
    let filter = {};

    if ( activa === 'true' || activa === 'activo' ) {
        filter.activo = true
    } else if (activa === 'false' || activa === 'inactio') {
        filter.activo = false;
    }else if (activa === 'all' || activa === 'todos') {
        filter = {};
    }else {
        filter.activo = true;
    }

    
}

const dbEliminarMascota = async (id) => {
    return await mascotaModel.findByIdAndDelete({_id: id});
}

const dbActualizarMascota = async (id, mascotaActualizada) => {
    return await mascotaModel.findByIdAndUpdate(
        id,
        mascotaActualizada,
        {
            new: true,
            runValidators: true
        }
    ).populate(['PERRO', 'GATO', 'AVE', 'ROEDOR', 'REPTIL', 'OTRO']);
}

