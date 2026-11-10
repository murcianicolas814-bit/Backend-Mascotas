import ProductModel from "../models/producto.model.js";

const dbCreateProduct = async ( newProduct ) => {
    return await ProductModel.create( newProduct );  // Registrar en la BD
}

const dbGetProducts = async () => {
    return await ProductModel.find().populate(['createdBy', 'category']);   // Consultar todos los productos registrados
}

const dbDeleteProduct = async ( id ) => {
    // return await ProductModel.findByIdAndDelete( id );
    return await ProductModel.findOneAndDelete({ _id: id });
}

const dbUpdateProduct = async ( id, productUpdated ) => {
    return await ProductModel.findOneAndUpdate(
        { _id: id },            // Objeto de consulta para buscar el documento que deseamos actualizar
        productUpdated,         // El objeto con los datos del Documento que deseamos actualizar
        { new: true }           // Configuracion para que retorne el documento actualizado
    );
}

const dbGetProduct = async ( id ) => {
    // return await ProductModel.findById( id );       // Obtiene un producto por su ID
    return await ProductModel.findOne({ _id: id });
}


export {
    dbCreateProduct,
    dbGetProducts,
    dbDeleteProduct,
    dbUpdateProduct,
    dbGetProduct
}