import CategoryModel from "../models/categoria.model.js"

const dbCreateCategory = async ( newCategory ) => {
    return await CategoryModel.create( newCategory );  // Registrar en la BD
}

const dbGetCategories = async () => {
    return await CategoryModel.find({ status: true }).populate('createdBy');   // Consultar todos las categorias registradas
}

const dbDeleteCategory = async ( id ) => {
    // return await CategoryModel.findByIdAndDelete( id );
    return await CategoryModel.findOneAndDelete({ _id: id });
}

const dbUpdateCategory = async ( id, categoryUpdated ) => {
    // return await CategoryModel.findByIdAndUpdate( 
    //     id,                 // El ID del Documento que deseamos actualizar 
    //     categoryUpdated,    // El objeto con los datos del Documento que deseamos actualizar
    //     { new: true }       // Configuracion para que retorne el documento actualizado
    // );
    return await CategoryModel.findOneAndUpdate(
        { _id: id },            // Objeto de consulta para buscar el documento que deseamos actualizar
        categoryUpdated,        // El objeto con los datos del Documento que deseamos actualizar
        { new: true }           // Configuracion para que retorne el documento actualizado
    );

}

const dbGetCategory = async ( id ) => {
    // return await CategoryModel.findById( id );       // Obtiene una categoria por su ID
    return await CategoryModel.findOne({ _id: id });
}


export {
    dbCreateCategory,
    dbGetCategories,
    dbDeleteCategory,
    dbUpdateCategory,
    dbGetCategory
}