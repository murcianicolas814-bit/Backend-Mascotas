import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre de la sede es obligatorio'], 
    unique: true, 
    trim: true, 
    maxlength: [80, 'El nombre no puede exceder los 80 caracteres'] 
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad o municipio de la sede es obligatorio'],
    trim: true,
    default: 'Principal'
  },
  direccion: { 
    type: String, 
    required: [true, 'La dirección de la sede es obligatoria'], 
    trim: true 
  },
  telefono: { 
    type: String, 
    trim: true 
  },
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Correo de contacto inválido']
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
    ref: 'Usuario'
  }
}, { timestamps: true, collection: 'sedes' });

export default mongoose.model('Sede', sedeSchema);

