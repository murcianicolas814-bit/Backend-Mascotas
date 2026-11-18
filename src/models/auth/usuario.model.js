import mongoose from 'mongoose';
import { ROLES_LIST } from '../../config/constant-roles.js';

const usuarioSchema = new mongoose.Schema({
  // Datos generales compartidos por todo usuario
  nombres: { 
    type: String, 
    required: [true, 'Los nombres son obligatorios'], 
    trim: true 
  },
  apellidos: { 
    type: String, 
    required: [true, 'Los apellidos son obligatorios'], 
    trim: true 
  },
  tipoDocumento: { 
    type: String, 
    enum: ['CC', 'CE', 'PA', 'RFC', 'INE'], 
    default: 'CC' 
  },
  documento: { 
    type: String, 
    required: [true, 'El documento es obligatorio'], 
    unique: true, 
    trim: true 
  },
  correo: { 
    type: String, 
    required: [true, 'El correo electrónico es obligatorio'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] 
  },
  telefono: { 
    type: String, 
    required: [true, 'El teléfono es obligatorio'], 
    trim: true 
  },

  // Credenciales y Seguridad
  passwordHash: { 
    type: String, 
    required: [true, 'La contraseña es obligatoria'], 
    select: false 
  },
  rol: { 
    type: String, 
    enum: ROLES_LIST, 
    required: [true, 'El rol es obligatorio'], 
    index: true 
  },
  
  // Referencias a perfiles específicos según el rol
  empleado: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Empleado', 
    default: null 
  },
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cliente', 
    default: null 
  },

  // Estado y Auditoría
  activo: { 
    type: Boolean, 
    default: true 
  },
  intentosFallidos: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  bloqueadoHasta: { 
    type: Date, 
    default: null 
  },
  ultimoLogin: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true, collection: 'usuarios' });

export default mongoose.model('Usuario', usuarioSchema);

