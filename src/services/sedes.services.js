import sedesModel from '../models/sede.model.js';

const dbCreateSede = async ( newSede ) => {
    return await sedesModel.create( newSede );  // Registrar en la BD
}

const dbGetSedes = async () => {
    return await sedesModel.find({ activa: true }).populate('creadoPor');   // Consultar todos las sedes registradas
}

const dbDeleteSede = async ( id ) => {
    // return await sedesModel.findByIdAndDelete( id );
    return await sedesModel.findOneAndDelete({ _id: id });
}

const dbUpdateSede = async ( id, sedeUpdated ) => {
    // return await sedesModel.findByIdAndUpdate( 
    //     id,                 // El ID del Documento que deseamos actualizar
    //     sedeUpdated,        // El objeto con los datos del Documento que deseamos actualizar
    //     { new: true }       // Configuracion para que retorne el documento actualizado
    // );
    return await sedesModel.findOneAndUpdate(
        { _id: id },            // Objeto de consulta para buscar el documento que deseamos actualizar
        sedeUpdated,            // El objeto con los datos del Documento que deseamos actualizar
        { new: true }           // Configuracion para que retorne el documento actualizado
    );  

}

const dbGetSede = async ( id ) => {
    // return await sedesModel.findById( id );       // Obtiene una sede por su ID
    return await sedesModel.findOne({ _id: id });
}

export {
    dbCreateSede,
    dbGetSedes,
    dbDeleteSede,
    dbUpdateSede,
    dbGetSede
}