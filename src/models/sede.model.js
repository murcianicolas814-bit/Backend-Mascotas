import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la sede es obligatorio'],
    unique: true,
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [80, 'El nombre no puede exceder los 80 caracteres']
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad o municipio de la sede es obligatorio'],
    trim: true
  },
  direccion: {
    type: String,
    required: [true, 'La dirección de la sede es obligatoria'],
    trim: true,
    minlength: [5, 'La dirección debe tener al menos 5 caracteres']
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]{7,20}$/, 'El teléfono no tiene un formato válido']
  },
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo de contacto inválido']
  },
  horarioAtencion: {
    type: String,
    trim: true,
    default: 'Lunes a Sábado: 8:00 AM - 6:00 PM'
  },
  activa: {
    type: Boolean,
    default: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, { timestamps: true, collection: 'sedes' });

sedeSchema.index({ ciudad: 1, activa: 1 });

export default mongoose.model('Sede', sedeSchema);

