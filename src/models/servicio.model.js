import { Schema, model } from 'mongoose';

const servicioSchema = new Schema(
  {
    nombre: { 
      type: String, 
      required: [true, 'El nombre del servicio es obligatorio'], 
      unique: true, 
      trim: true, 
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'] 
    },
    descripcion: { 
      type: String, 
      trim: true, 
      maxlength: [255, 'La descripción no puede exceder los 255 caracteres'] 
    },
    categoria: {
      type: String,
      enum: {
        values: ['CONSULTA', 'CIRUGIA', 'VACUNACION', 'DESPARASITACION', 'ESTETICA_BANO', 'LABORATORIO', 'URGENCIA', 'OTRO'],
        message: 'La categoría {VALUE} no es válida'
      },
      default: 'CONSULTA'
    },
    precio: { 
      type: Number, 
      required: [true, 'El precio del servicio es obligatorio'], 
      min: [0, 'El precio no puede ser negativo'], 
      default: 0 
    },
    duracionMinutos: {
      type: Number,
      default: 30,
      min: [5, 'La duración mínima es de 5 minutos']
    },
    requiereAyuno: {
      type: Boolean,
      default: false
    },
    indicacionesPrevias: {
      type: String,
      trim: true
    },
    estado: { 
      type: String, 
      enum: ['Activo', 'Inactivo'], 
      default: 'Activo' 
    },
    creadoPor: { 
      type: Schema.Types.ObjectId, 
      ref: 'Usuario' 
    }
  },
  { 
    timestamps: true,
    collection: 'servicios'
  }
);

export default model('Servicio', servicioSchema);
