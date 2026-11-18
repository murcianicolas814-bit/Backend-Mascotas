import mongoose from 'mongoose';
import { ESTADOS_CITA } from '../config/constant-roles.js';

const cambioSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    campo: String,
    valorAnterior: mongoose.Schema.Types.Mixed,
    valorNuevo: mongoose.Schema.Types.Mixed,
    motivo: String,
}, { _id: false });

const citaSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    mascota: { type: mongoose.Schema.Types.ObjectId, ref: 'Mascota', required: true, index: true },
    servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
    empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true }, // Veterinario asignado
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    estado: { type: String, enum: ESTADOS_CITA, default: 'PROGRAMADA', index: true },
    observaciones: { type: String, trim: true },
    motivoCancelacion: { type: String, trim: true },
    canceladaEn: Date,
    creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    historialCambios: [cambioSchema],
}, { timestamps: true, collection: 'citas' });

citaSchema.index({ empleado: 1, fechaInicio: 1, fechaFin: 1 });
export default mongoose.model('Cita', citaSchema);