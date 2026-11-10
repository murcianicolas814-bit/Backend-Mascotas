import { Schema, model } from 'mongoose';

const entero = { validator: Number.isInteger, message: '{PATH} debe ser un entero' };

const productoSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 30 },
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    unidad: { type: String, required: true, trim: true, maxlength: 30 },
    stockActual: { type: Number, default: 0, min: 0, validate: entero },
    stockMinimo: { type: Number, default: 0, min: 0, validate: entero },
    precioVenta: { type: Number, default: 0, min: 0 },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Útil para alertas de inventario
productoSchema.virtual('bajoStock').get(function () {
  return this.stockActual <= this.stockMinimo;
});

export default model('Producto', productoSchema);
