import handleMongooseError from "../helpers/handle-mongoose-error.helper";
import { dbCrearMascota, dbObtenerMascota, dbEliminarMascota, dbActualizarMascota} from "../services/mascotas.services.js";

const crearMascota = async (req, res) => {
    try {
        const inputData = req.body;

        if (!inputData.nombre && inputData.name) {
            inputData.nombres = inputData.name;
        }
        if (!inputData.raza) {
            inputData.raza = inputData.raza;
        }
        if (!inputData.especie) {
            inputData.especie = inputData.especie;
        }
        if (!inputData.sexo) {
            inputData.sexo = inputData.sexo;
        }
        if (!inputData.manejoEspecial) {
            inputData.manejoEspecial = inputData.manejoEspecial
        }

        const data = await dbCrearMascota(inputData);

        const userObj = data.toObject ? data.toObject() : {...data};
        
        
        res.status(201).json({ msg: 'Mascota registrada con exito'});
    
    } catch (error) {
        console.error(error);

        res,json({ msg: 'No se pudo registrar la mascota'})
        
    }
}

