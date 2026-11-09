const { Schema, model } = require('mongoose');

const clienteSchema = new Schema(
  {
    tipoDocumento: { type: String, required: true, trim: true, maxlength: 20 },
    documento: { type: String, required: true, trim: true, maxlength: 20 },
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    telefono: { type: String, trim: true, maxlength: 20 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    direccion: { type: String, trim: true, maxlength: 150 },
    fechaRegistro: { type: Date, default: Date.now },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  },
  { timestamps: true }
);

// uq_cliente_documento
clienteSchema.index({ tipoDocumento: 1, documento: 1 }, { unique: true });

module.exports = model('Cliente', clienteSchema);