import mongoose from 'mongoose';
import { ROLES } from '../../config/constant-roles.js';

const empleadoSchema = new mongoose.Schema({
  // Enlace obligatorio con la cuenta de usuario general
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El ID de usuario es obligatorio'],
    unique: true
  },

  // Roles específicos que puede desempeñar el empleado en el sistema
  roles: {
    type: [{
      type: String,
      enum: [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.RECEPCIONISTA, ROLES.CONTADOR]
    }],
    validate: [(v) => v && v.length > 0, 'Debe especificar al menos un rol de empleado']
  },

  // --- Datos laborales generales del empleado ---
  fechaContratacion: {
    type: Date,
    default: Date.now
  },
  cargo: {
    type: String,
    trim: true
  },
  sedes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sede'
  }],

  // --- Datos específicos para VETERINARIO ---
  tarjetaProfesional: {
    type: String,
    trim: true,
    required: [
      function () { return this.roles && this.roles.includes(ROLES.VETERINARIO); },
      'La tarjeta profesional es obligatoria para el rol de Veterinario'
    ]
  },
  especialidades: [{
    type: String,
    trim: true
  }],
  servicios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio'
  }],

  // --- Datos específicos para RECEPCIONISTA ---
  turno: {
    type: String,
    enum: ['MAÑANA', 'TARDE', 'NOCHE', 'ROTATIVO'],
    default: 'ROTATIVO'
  },
  cajaAsignada: {
    type: String,
    trim: true
  },

  // --- Datos específicos para ADMINISTRADOR ---
  nivelAcceso: {
    type: String,
    enum: ['TOTAL', 'SUPERVISOR'],
    default: 'TOTAL'
  },

  // Estado del empleado (inactivar, no borrar)
  activo: {
    type: Boolean,
    default: true,
    index: true
  },
}, { timestamps: true, collection: 'empleados' });

export default mongoose.model('Empleado', empleadoSchema);

