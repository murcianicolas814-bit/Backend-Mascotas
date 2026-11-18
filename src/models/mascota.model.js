import mongoose from 'mongoose';

const mascotaSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    nombre: { type: String, required: [true, 'El nombre de la mascota es obligatorio'], trim: true },
    especie: {
        type: String,
        enum: ['PERRO', 'GATO', 'AVE', 'ROEDOR', 'REPTIL', 'OTRO'],
        required: [true, 'La especie es obligatoria']
    },
    raza: { type: String, trim: true },
    sexo: { type: String, enum: ['MACHO', 'HEMBRA', 'DESCONOCIDO'], default: 'DESCONOCIDO' },
    fechaNacimiento: { type: Date },
    pesoKg: { type: Number, min: 0 },
    manejoEspecial: {
        nivel: { type: String, enum: ['NORMAL', 'AGRESIVA', 'TEMEROSA', 'ESPECIAL'], default: 'NORMAL' },
        observaciones: { type: String, trim: true },
    },
    activa: { type: Boolean, default: true },
}, { timestamps: true, collection: 'mascotas' });

export default mongoose.model('Mascota', mascotaSchema);