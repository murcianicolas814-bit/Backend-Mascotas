import Mascota from '../models/mascota.model.js';

// Crear una nueva mascota
const dbCrearMascota = async (datos) => {
    const nuevaMascota = await Mascota.create(datos);

    return await Mascota.findById(nuevaMascota._id)
        .populate({
            path: 'cliente',
            populate: { path: 'usuario' }
        });
};

// Obtener mascotas con paginación y filtros
const dbObtenerMascotas = async (pagina = 1, limite = 10, filtros = {}) => {
    const pageNumber = Math.max(1, Number(pagina) || 1);
    const limitNumber = Math.max(1, Number(limite) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Filtrar por estado de la mascota
    if (filtros.activa === 'true' || filtros.activa === true) {
        query.activa = true;
    } else if (filtros.activa === 'false' || filtros.activa === false) {
        query.activa = false;
    }

    // Filtrar por cliente, cuando se proporcione su ID
    if (filtros.cliente) {
        query.cliente = filtros.cliente;
    }

    // Filtrar por especie
    if (filtros.especie) {
        query.especie = filtros.especie.toUpperCase();
    }

    const [mascotas, total] = await Promise.all([
        Mascota.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber)
            .populate({
                path: 'cliente',
                populate: { path: 'usuario' }
            }),

        Mascota.countDocuments(query)
    ]);

    return {
        mascotas,
        total,
        pagina: pageNumber,
        limite: limitNumber,
        totalPaginas: Math.ceil(total / limitNumber)
    };
};

// Obtener una mascota por su ID
const dbObtenerMascotaPorId = async (id) => {
    return await Mascota.findById(id)
        .populate({
            path: 'cliente',
            populate: { path: 'usuario' }
        });
};

// Actualizar una mascota
const dbActualizarMascota = async (id, datosActualizar) => {
    return await Mascota.findByIdAndUpdate(
        id,
        datosActualizar,
        { new: true, runValidators: true }
    ).populate({
        path: 'cliente',
        populate: { path: 'usuario' }
    });
};

const dbEliminarMascota = async (id) => {
    return await Mascota.findByIdAndDelete({_id: id});
}


export {
    dbCrearMascota,
    dbObtenerMascotas,
    dbObtenerMascotaPorId,
    dbActualizarMascota,
    dbEliminarMascota
};








