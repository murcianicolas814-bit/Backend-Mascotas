import { Schema, model } from 'mongoose';

const servicioSchema = new Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    descripcion: { type: String, trim: true, maxlength: 255 },
    precio: { type: Number, required: true, min: 0, default: 0 },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    creadoPor: { type: Schema.Types.ObjectId, ref:"usuarios"}
  },
  { timestamps: true }
);

export default model('Servicio', servicioSchema);