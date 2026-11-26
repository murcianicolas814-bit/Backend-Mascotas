import Sede from '../models/sede.model.js';

const dbCrearSede = async (datos) => {
    return await Sede.create(datos);
};

const dbObtenerSedes = async (pagina = 1, limite = 10, filtros = {}) => {
    const pageNumber = Math.max(1, Number(pagina) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limite) || 10));
    const skip = (pageNumber - 1) * limitNumber;
    const consulta = {};

    if (filtros.activa === 'true') consulta.activa = true;
    if (filtros.activa === 'false') consulta.activa = false;

    if (filtros.ciudad) {
        consulta.ciudad = { $regex: filtros.ciudad, $options: 'i' };
    }

    if (filtros.busqueda) {
        consulta.$or = [
            { nombre: { $regex: filtros.busqueda, $options: 'i' } },
            { direccion: { $regex: filtros.busqueda, $options: 'i' } },
            { ciudad: { $regex: filtros.busqueda, $options: 'i' } }
        ];
    }

    const [sedes, total] = await Promise.all([
        Sede.find(consulta)
            .sort({ nombre: 1 })
            .skip(skip)
            .limit(limitNumber),
        Sede.countDocuments(consulta)
    ]);

    return {
        sedes,
        paginacion: {
            pagina: pageNumber,
            limite: limitNumber,
            total,
            totalPaginas: Math.ceil(total / limitNumber)
        }
    };
};

const dbObtenerSedePorId = async (id) => {
    return await Sede.findById(id).populate('creadoPor', 'nombre correo rol');
};

const dbActualizarSede = async (id, datos) => {
    return await Sede.findByIdAndUpdate(id, datos, {
        new: true,
        runValidators: true
    }).populate('creadoPor', 'nombre correo rol');
};

const dbEliminarSede = async (id) => {
    return await Sede.findByIdAndDelete(
        id
    )
};

export {
    dbCrearSede,
    dbObtenerSedes,
    dbObtenerSedePorId,
    dbActualizarSede,
    dbEliminarSede
};
