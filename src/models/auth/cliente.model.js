import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  // Enlace obligatorio con la cuenta de usuario general
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El ID de usuario es obligatorio'], 
    unique: true 
  },
  
  // Datos específicos del Cliente (Propietario de mascotas)
  direccion: { 
    type: String, 
    required: [true, 'La dirección es obligatoria para el cliente'], 
    trim: true 
  },
  consentimientoDatos: { 
    type: Boolean, 
    default: false,
    required: [true, 'El consentimiento de tratamiento de datos (Habeas Data) es obligatorio'] 
  },
  contactoEmergencia: {
    nombre: { type: String, trim: true },
    telefono: { type: String, trim: true }
  },
  observaciones: { 
    type: String, 
    trim: true 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true, collection: 'clientes' });

export default mongoose.model('Cliente', clienteSchema);

