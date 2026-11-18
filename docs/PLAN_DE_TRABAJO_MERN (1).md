# Plan de trabajo MERN – Zoolomascotas MX (ERS v4.0)

**Equipo:** Nicolas · Felipe · Carol
**Prioridad:** Backend primero (Node + Express + MongoDB/Mongoose). El frontend React inicia después de cerrar la Fase 4.

---

## 1. Mapa de dependencias entre entidades

```
Sede ─────────────┐
Servicio ─────────┤
Usuario ──► Empleado ──► HorarioLaboral / NoDisponibilidad ──┐
   │                                                         ▼
   └──────► Cliente ──► Mascota ───────────────────────────► Cita ──► Asistencia
                                                  (Empleado + Servicio + Sede)

ParametroInventario ──► Producto ──► MovimientoInsumo ──► AlertaStock

Bitacora (transversal: la alimentan TODOS los módulos)
```

**Orden de construcción obligatorio:** Usuario/Auth/RBAC → catálogos (Sede, Servicio) → Empleado y Cliente → Mascota y Horarios → Cita → Asistencia. Insumos corre en paralelo (Parámetros → Producto → Movimiento → Alerta). Reportes al final porque consumen todo.

---

## 2. Reparto homogéneo

| Dev | Core (Fase 1) | Dominio principal (Fases 2-3) | Reportes (Fase 4) |
|---|---|---|---|
| **Nicolas** | Auth + JWT + RBAC (RF-029, RF-030, RS-001…009) | Sedes, Servicios, Empleados, Horarios, No disponibilidades (RF-001…004, RF-011, RF-014) | Reporte desempeño de empleados + exportador PDF/CSV (RF-025 parcial, RF-027) |
| **Felipe** | Bitácora/Auditoría + logger + manejo de errores (RF-028, RNF-007, RS-007) | Clientes, Mascotas, Citas, Asistencia (RF-005…010, RF-012, RF-013) | Reportes de citas y ocupación (RF-025 parcial) + recordatorios (RF-013) |
| **Carol** | Esqueleto del proyecto, config, validación, seeds, Parámetros de inventario (RF-023) | Productos, Movimientos, Alertas (RF-015…022, RF-024) | Reportes de insumos (RF-026) + cron de alertas |

Carga aproximada: ~9 RF cada uno + su parte de core.

---

## 3. Fases y cronograma sugerido (sprints de 1 semana)

### Fase 0 – Setup conjunto (Día 1-2, los tres)
- Carol crea el repo (`/backend`, `/frontend`), ramas `main` y `develop`, ESLint/Prettier, `.env.example`.
- Nicolas y Felipe clonan y verifican que levanta (`npm run dev`).
- Acordar **contratos** (sección 6) y la estructura de carpetas (sección 4).

### Fase 1 – CORE (Semana 1, en paralelo, objetivo: desbloquear a todos)
Se entrega primero porque deja listos `authenticate`, `authorize(...roles)`, `ownOnly`, `audit()` y `validate()`; así en las fases siguientes cada dev solo escribe lógica de negocio y **protege sus rutas con una línea**.

| Rama | Dueño | Contenido |
|---|---|---|
| `feature/core-setup-config` | Carol | Express app, conexión Mongo, `config/env`, `validate(zod/joi)`, `asyncHandler`, estructura de respuestas, seeds (admin, sede, servicios), colección Postman |
| `feature/core-auth-rbac` | Nicolas | Modelo Usuario, registro/login/logout/refresh, hash bcrypt, bloqueo por intentos, expiración, middlewares `authenticate`, `authorize`, `ownOnly` |
| `feature/core-auditoria-errores` | Felipe | Modelo Bitácora, `auditService.log()`, middleware `audit(entidad, accion)`, `errorHandler`, logger (pino/winston) |
| `feature/rf-023-parametros-inventario` | Carol | Modelo ParametroInventario (singleton) + endpoints |

**Hito Fase 1:** merge a `develop`; todos pueden proteger rutas con `router.post('/', authenticate, authorize('ADMINISTRADOR'), audit('Empleado','CREAR'), ctrl.crear)`.

### Fase 2 – Entidades base de cada dominio (Semana 2)
| Rama | Dueño | RF / RB |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | Nicolas | RF-014 |
| `feature/rf-011-servicios` | Nicolas | RF-011, RF-003 |
| `feature/rf-001-empleados` | Nicolas | RF-001, RB-001, RU-001 |
| `feature/rf-005-clientes` | Felipe | RF-005, RB-001, RB-021, RU-003 |
| `feature/rf-006-mascotas` | Felipe | RF-006, RB-002, RB-019 |
| `feature/rf-015-022-productos` | Carol | RF-015, RF-020, RF-022, RB-022, RB-025 |

### Fase 3 – Entidades dependientes (Semana 3-4)
| Rama | Dueño | Depende de | RF / RB |
|---|---|---|---|
| `feature/rf-002-004-horarios-disponibilidad` | Nicolas | Empleado | RF-002, RF-004, RB-005 |
| `feature/rf-007-009-012-citas` | Felipe | Cliente, Mascota, Empleado, Horarios, Servicio | RF-007, RF-008, RF-009, RF-012, RB-003, RB-004, RB-005, RB-012, RB-018 |
| `feature/rf-010-asistencia-resultado` | Felipe | Cita | RF-010, RU-007 |
| `feature/rf-016-017-024-movimientos` | Carol | Producto | RF-016, RF-017, RF-024, RB-007, RB-023, RS-010 |
| `feature/rf-018-019-021-alertas-historial` | Carol | Producto, Movimiento | RF-018, RF-019, RF-021, RB-024 |

> Felipe empieza Citas apoyado en el contrato `disponibilidadService` (sección 6) con un stub mientras Nicolas termina Horarios.

### Fase 4 – Reportes, portal del cliente y automatización (Semana 5)
| Rama | Dueño | RF |
|---|---|---|
| `feature/rf-025-reporte-desempeno` + `feature/rf-027-exportacion-pdf-csv` | Nicolas | RF-025, RF-027 |
| `feature/rf-025-reportes-citas-ocupacion` + `feature/rf-013-recordatorios` | Felipe | RF-025, RF-013 |
| `feature/rf-026-reportes-insumos` + `feature/job-alertas-cron` | Carol | RF-026 |
| `feature/rf-030-portal-cliente` | Nicolas + Felipe | RF-030, RS-009, RU-008 |

### Fase 5 – Integración y endurecimiento (Semana 6)
Pruebas de integración cruzadas (revisión de código intercambiada: Nicolas revisa a Felipe, Felipe a Carol, Carol a Nicolas), pruebas de rendimiento (RNF-002/003), seguridad (helmet, rate-limit), backup (RNF-009), Swagger.

### Fase 6 – Frontend React (Semana 7+)
Orden: login/layout con rutas protegidas → Empleados/Agenda → Clientes/Mascotas/Mis Citas → Insumos/Alertas → Reportes/Auditoría.

---

## 4. Estructura de carpetas backend (acordada por todos)

```
backend/src/
  config/            env.js, db.js
  constants/         roles.js, estados.js
  models/            (un archivo por schema, listados abajo)
  middlewares/       authenticate.js, authorize.js, ownOnly.js, audit.js, validate.js, errorHandler.js
  modules/<modulo>/  routes.js, controller.js, service.js, validators.js
  services/          auditService.js, disponibilidadService.js, inventarioService.js
  jobs/              alertasInventario.js, recordatorios.js
  utils/             asyncHandler.js, appError.js, exportador.js
  app.js  server.js
backend/tests/       (Jest + Supertest + mongodb-memory-server)
```

**Flujo Git:** `main` (producción) ← `develop` (integración) ← `feature/*`. PR obligatorio con 1 revisor, sin push directo a `develop`.
**Nombre de rama:** `feature/rf-XXX-<descripcion>` (RF del ERS en el nombre). Commits: `feat(rf-007): crear cita con validación de solapamiento`.

---

## 5. SCHEMAS de Mongoose (ya diseñados; el dev solo implementa lógica)

Todos con `timestamps: true`. Código ESM (`"type": "module"` en package.json).

### 5.0 Constantes compartidas – `constants/roles.js` (Carol, Fase 0)
```js
export const ROLES = Object.freeze({
  ADMIN: 'ADMINISTRADOR',
  VETERINARIO: 'VETERINARIO',
  RECEPCIONISTA: 'RECEPCIONISTA',
  CLIENTE: 'CLIENTE',
});
export const ROLES_LIST = Object.values(ROLES);
export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO'];
export const CATEGORIAS_PRODUCTO = ['MEDICAMENTO', 'ALIMENTO', 'ACCESORIO', 'INSUMO'];
```

### 5.1 Usuario → colección `usuarios` (Nicolas, Fase 1)
```js
import mongoose from 'mongoose';
import { ROLES_LIST } from '../constants/roles.js';

const usuarioSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] },
  passwordHash: { type: String, required: true, select: false },          // RS-004
  rol: { type: String, enum: ROLES_LIST, required: true, index: true },
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  activo: { type: Boolean, default: true },
  intentosFallidos: { type: Number, default: 0, min: 0 },                 // RS-005
  bloqueadoHasta: { type: Date, default: null },
  ultimoLogin: { type: Date, default: null },
}, { timestamps: true, collection: 'usuarios' });

export default mongoose.model('Usuario', usuarioSchema);
```

### 5.2 Sede → `sedes` (Nicolas)
```js
const sedeSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
  direccion: { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
  activa: { type: Boolean, default: true },
}, { timestamps: true, collection: 'sedes' });
export default mongoose.model('Sede', sedeSchema);
```

### 5.3 Servicio → `servicios` (Nicolas)
```js
const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  descripcion: { type: String, trim: true },
  duracionMin: { type: Number, required: true, min: 5, max: 720 },        // RF-011
  requiereVeterinario: { type: Boolean, default: true },                   // RB-003
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'servicios' });
export default mongoose.model('Servicio', servicioSchema);
```

### 5.4 Empleado → `empleados` (Nicolas)
```js
import { ROLES } from '../constants/roles.js';

const empleadoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', unique: true, sparse: true },
  nombres: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  tipoDocumento: { type: String, enum: ['CC', 'CE', 'PA', 'RFC', 'INE'], default: 'CC' },
  documento: { type: String, required: true, unique: true, trim: true },   // RB-001
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  roles: { type: [{ type: String, enum: [ROLES.VETERINARIO, ROLES.RECEPCIONISTA, ROLES.ADMIN] }],
           validate: [(v) => v.length > 0, 'Al menos un rol'] },
  especialidades: [{ type: String, trim: true }],
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servicio' }],  // RF-003
  sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
  activo: { type: Boolean, default: true, index: true },                   // inactivar, nunca borrar
}, { timestamps: true, collection: 'empleados' });
export default mongoose.model('Empleado', empleadoSchema);
```

### 5.5 HorarioLaboral → `horarios_laborales` (Nicolas, Fase 3)
```js
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const horarioSchema = new mongoose.Schema({
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true, index: true },
  sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  diaSemana: { type: Number, required: true, min: 0, max: 6 },             // 0=domingo
  horaInicio: { type: String, required: true, match: HHMM },
  horaFin: { type: String, required: true, match: HHMM },
  descansoInicio: { type: String, match: HHMM },
  descansoFin: { type: String, match: HHMM },
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'horarios_laborales' });
// Validar en pre('validate'): horaFin > horaInicio y jornada total <= 12 h (restricción 2.4)
horarioSchema.index({ empleado: 1, sede: 1, diaSemana: 1 }, { unique: true });
export default mongoose.model('HorarioLaboral', horarioSchema);
```

### 5.6 NoDisponibilidad → `no_disponibilidades` (Nicolas, Fase 3)
```js
const noDispSchema = new mongoose.Schema({
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true, index: true },
  tipo: { type: String, enum: ['VACACIONES', 'PERMISO', 'INCAPACIDAD', 'OTRO'], required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },                                // validar >= fechaInicio
  motivo: { type: String, trim: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'no_disponibilidades' });
noDispSchema.index({ empleado: 1, fechaInicio: 1, fechaFin: 1 });
export default mongoose.model('NoDisponibilidad', noDispSchema);
```

### 5.7 Cliente → `clientes` (Felipe)
```js
const clienteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', unique: true, sparse: true },
  nombres: { type: String, required: true, trim: true },
  apellidos: { type: String, required: true, trim: true },
  tipoDocumento: { type: String, enum: ['CC', 'CE', 'PA', 'RFC', 'INE'], default: 'CC' },
  documento: { type: String, required: true, unique: true, trim: true },   // RB-001
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  direccion: { type: String, required: true, trim: true },                 // RF-005
  consentimientoDatos: { type: Boolean, default: false },                  // Habeas Data
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'clientes' });
export default mongoose.model('Cliente', clienteSchema);
```

### 5.8 Mascota → `mascotas` (Felipe)
```js
const mascotaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true }, // RB-002
  nombre: { type: String, required: true, trim: true },
  especie: { type: String, enum: ['PERRO', 'GATO', 'AVE', 'ROEDOR', 'REPTIL', 'OTRO'], required: true },
  raza: { type: String, trim: true },
  sexo: { type: String, enum: ['MACHO', 'HEMBRA', 'DESCONOCIDO'], default: 'DESCONOCIDO' },
  fechaNacimiento: { type: Date },
  pesoKg: { type: Number, min: 0 },
  manejoEspecial: {                                                        // RB-019
    nivel: { type: String, enum: ['NORMAL', 'AGRESIVA', 'TEMEROSA', 'ESPECIAL'], default: 'NORMAL' },
    observaciones: { type: String, trim: true },
  },
  activa: { type: Boolean, default: true },
}, { timestamps: true, collection: 'mascotas' });
export default mongoose.model('Mascota', mascotaSchema);
```

### 5.9 Cita → `citas` (Felipe, Fase 3)
```js
import { ESTADOS_CITA } from '../constants/roles.js';

const cambioSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  campo: String, valorAnterior: mongoose.Schema.Types.Mixed, valorNuevo: mongoose.Schema.Types.Mixed,
  motivo: String,
}, { _id: false });

const citaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
  mascota: { type: mongoose.Schema.Types.ObjectId, ref: 'Mascota', required: true, index: true },
  servicio: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', required: true },
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true },
  sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },        // = fechaInicio + servicio.duracionMin (calculado en servicio)
  estado: { type: String, enum: ESTADOS_CITA, default: 'PROGRAMADA', index: true },
  observaciones: { type: String, trim: true },
  motivoCancelacion: { type: String, trim: true }, // obligatorio si estado = CANCELADA (RF-009)
  canceladaEn: Date,
  creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  historialCambios: [cambioSchema],                // RF-008
}, { timestamps: true, collection: 'citas' });
citaSchema.index({ empleado: 1, fechaInicio: 1, fechaFin: 1 });            // RB-004
export default mongoose.model('Cita', citaSchema);
```

### 5.10 Asistencia → `asistencias_cita` (Felipe, Fase 3)
```js
const asistenciaSchema = new mongoose.Schema({
  cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true, unique: true }, // 0..1 por cita
  asistio: { type: Boolean, required: true },
  resultado: { type: String, enum: ['ATENDIDA', 'NO_ASISTIO'], required: true },
  observaciones: { type: String, trim: true },
  diagnostico: { type: String, trim: true },        // alimenta el historial clínico (solo lectura después)
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'asistencias_cita' });
export default mongoose.model('Asistencia', asistenciaSchema);
```
> El **historial clínico** (L para todos los roles) se obtiene consultando `asistencias_cita` + `citas` por `mascota`; no requiere colección aparte en esta versión.

### 5.11 ParametroInventario → `parametros_inventario` (Carol, Fase 1)
```js
const parametroSchema = new mongoose.Schema({
  clave: { type: String, default: 'GLOBAL', unique: true, immutable: true }, // singleton
  umbralVencimientoDias: { type: Number, default: 30, min: 1 },             // RF-019
  stockMinimoDefault: { type: Number, default: 5, min: 0 },
  unidadesMedida: { type: [String], default: ['UNIDAD', 'CAJA', 'KG', 'G', 'ML', 'L', 'TABLETA'] },
  actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true, collection: 'parametros_inventario' });
export default mongoose.model('ParametroInventario', parametroSchema);
```

### 5.12 Producto → `productos` (Carol, Fase 2)
```js
import { CATEGORIAS_PRODUCTO } from '../constants/roles.js';

const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, uppercase: true, trim: true }, // RB-022
  nombre: { type: String, required: true, trim: true, index: true },
  categoria: { type: String, enum: CATEGORIAS_PRODUCTO, required: true, index: true },
  unidadMedida: { type: String, required: true },
  stockActual: { type: Number, required: true, default: 0, min: [0, 'Stock no puede ser negativo'] }, // RB-007
  stockMinimo: { type: Number, required: true, min: 0 },
  umbralVencimientoDias: { type: Number, min: 1 },   // si null usa el parámetro global
  lote: { type: String, trim: true },
  fechaVencimiento: { type: Date },
  ubicacion: { type: String, trim: true },
  activo: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: 'productos' });

// RB-025 / RF-022: medicamentos exigen lote y fecha de vencimiento
productoSchema.pre('validate', function (next) {
  if (this.categoria === 'MEDICAMENTO' && (!this.lote || !this.fechaVencimiento)) {
    return next(new Error('Los medicamentos requieren lote y fecha de vencimiento'));
  }
  next();
});
export default mongoose.model('Producto', productoSchema);
```
> **Regla:** `stockActual` NUNCA se modifica desde el CRUD de productos; solo vía movimientos.

### 5.13 MovimientoInsumo → `movimientos_insumo` (Carol, Fase 3)
```js
const movimientoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true, index: true },
  tipo: { type: String, enum: ['ENTRADA', 'SALIDA', 'AJUSTE'], required: true },
  sentidoAjuste: { type: String, enum: ['INCREMENTO', 'DECREMENTO'] },   // solo si tipo = AJUSTE
  cantidad: { type: Number, required: true, min: [0.0001, 'Cantidad debe ser > 0'] },
  stockAnterior: { type: Number, required: true, min: 0 },
  stockResultante: { type: Number, required: true, min: 0 },             // RB-007
  motivo: { type: String, required: true, trim: true },                  // RB-023
  lote: { type: String, trim: true },
  fechaVencimiento: { type: Date },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // RS-010
}, { timestamps: true, collection: 'movimientos_insumo' });
movimientoSchema.index({ producto: 1, createdAt: -1 });
// Inmutable: no exponer PUT/DELETE; las correcciones se hacen con un AJUSTE.
export default mongoose.model('MovimientoInsumo', movimientoSchema);
```

### 5.14 AlertaStock → `alertas_stock` (Carol, Fase 3)
```js
const alertaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true, index: true },
  tipo: { type: String, enum: ['STOCK_BAJO', 'PROXIMO_VENCER', 'VENCIDO'], required: true },
  estado: { type: String, enum: ['ACTIVA', 'ATENDIDA'], default: 'ACTIVA', index: true },
  mensaje: { type: String, required: true },
  atendidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  atendidaEn: Date,
}, { timestamps: true, collection: 'alertas_stock' });
// Evita duplicar alertas activas del mismo tipo para el mismo producto
alertaSchema.index({ producto: 1, tipo: 1 },
  { unique: true, partialFilterExpression: { estado: 'ACTIVA' } });
export default mongoose.model('AlertaStock', alertaSchema);
```

### 5.15 Bitacora → `bitacora_auditoria` (Felipe, Fase 1)
```js
const bitacoraSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now, index: true, immutable: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', immutable: true },
  usuarioCorreo: { type: String, immutable: true },
  rol: { type: String, immutable: true },
  tipoEvento: { type: String, required: true, immutable: true, index: true,
    enum: ['AUTENTICACION', 'CAMBIO_PERMISOS', 'ALTA', 'MODIFICACION', 'BAJA', 'MOVIMIENTO_INVENTARIO', 'ERROR_ACCESO'] },
  entidad: { type: String, immutable: true },
  entidadId: { type: String, immutable: true },
  accion: { type: String, required: true, immutable: true },
  detalle: { type: mongoose.Schema.Types.Mixed, immutable: true },
  resultado: { type: String, enum: ['EXITO', 'FALLO'], default: 'EXITO', immutable: true },
  ip: { type: String, immutable: true },
  userAgent: { type: String, immutable: true },
}, { collection: 'bitacora_auditoria' });   // sin timestamps: fecha ya es inmutable
bitacoraSchema.index({ tipoEvento: 1, fecha: -1 });
// Solo escritura y lectura. Prohibido update/delete (bloquear con hooks pre('updateOne'|'deleteOne'...)).
export default mongoose.model('Bitacora', bitacoraSchema);
```

---

## 6. Contratos entre desarrolladores (acordar en Fase 0)

```js
// Nicolas expone (services/disponibilidadService.js) – Felipe lo consume en Citas
estaDisponible(empleadoId, sedeId, fechaInicio, fechaFin) -> { disponible: Boolean, motivo?: String }
// Valida: horario laboral (RB-005), no disponibilidades, solapamiento con citas CONFIRMADAS (RB-004)

// Felipe expone (services/auditService.js) – todos lo consumen
log({ req, tipoEvento, entidad, entidadId, accion, detalle, resultado })

// Carol expone (services/inventarioService.js) – futuro: hospitalización/ventas
registrarMovimiento({ productoId, tipo, sentidoAjuste, cantidad, motivo, lote, usuarioId })

// Nicolas expone en req (middleware authenticate)
req.user = { id, rol, empleadoId, clienteId }
```

---

## 7. Guía de trabajo y endpoints por desarrollador

> Notación de permisos tomada de la matriz del ERS: **A**=Admin, **V**=Veterinario, **R**=Recepcionista, **C**=Cliente.

### 7.1 NICOLAS

**Core – `feature/core-auth-rbac`** (Fase 1, RF-029, RF-030, RS-001…009)
| Endpoint | Acceso |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `POST /api/auth/refresh` | Público / autenticado |
| `GET /api/auth/me` | Autenticado |
| `PATCH /api/usuarios/:id/rol` (CAMBIO_PERMISOS en bitácora) | A |
Entregables: `authenticate`, `authorize(...roles)`, `ownOnly(modelo, campo)`, bloqueo tras N intentos, expiración configurable, tests de los 4 roles.

**Fase 2/3 – Empleados y agenda**
| Rama | Endpoints | Acceso (matriz) |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | CRUD `/api/sedes` | A (CLEM); V/R/C lectura |
| `feature/rf-011-servicios` | CRUD `/api/servicios` | A (CLEM); V/R lectura |
| `feature/rf-001-empleados` | CRUD `/api/empleados`, `PATCH /:id/inactivar`, asignación de roles/especialidades/servicios (RF-003) | A: CLEM · R: L |
| `feature/rf-002-004-horarios-disponibilidad` | `/api/empleados/:id/horarios`, `/api/empleados/:id/no-disponibilidades`, `GET /api/empleados/:id/agenda?desde&hasta` (RF-004), `GET /api/disponibilidad` | A, R: CLEM · V: L (solo la propia) |

**Fase 4:** `GET /api/reportes/desempeno` (A: todos, V: propio, R: L) y `utils/exportador.js` (PDF/CSV) que usarán los tres.

### 7.2 FELIPE

**Core – `feature/core-auditoria-errores`** (Fase 1, RF-028, RS-007, RNF-007)
`GET /api/auditoria?tipoEvento&desde&hasta&usuario` (solo A, lectura).

**Fase 2/3 – Clientes, mascotas, citas**
| Rama | Endpoints | Acceso |
|---|---|---|
| `feature/rf-005-clientes` | CRUD `/api/clientes` | A, R: CLEM · V: L · C: L propio |
| `feature/rf-006-mascotas` | CRUD `/api/clientes/:id/mascotas`, `GET /api/mascotas/:id` | A, R: CLEM · V: L · C: L propias |
| `feature/rf-007-009-012-citas` | `POST/GET/PUT /api/citas`, `PATCH /api/citas/:id/cancelar` | A, R: CLEM · V: L propias · C: L propias |
| `feature/rf-010-asistencia-resultado` | `POST /api/citas/:id/asistencia`, `GET /api/mascotas/:id/historial` | A, V, R: CLEM · C: historial propio |

Reglas clave a implementar en `service`: RB-003, RB-004 (vía `disponibilidadService`), RB-005, RB-012 (≥ 2 días), RB-018 (cancelar/reprogramar ≥ 24 h), historial de cambios en cada modificación (RF-008), motivo obligatorio al cancelar (RF-009), recordatorios (RF-013).

**Fase 4:** `GET /api/reportes/citas` y `/ocupacion` (A, R: CLEM · V: L propios).

### 7.3 CAROL

**Core – `feature/core-setup-config` y `feature/rf-023-parametros-inventario`**
`GET/PUT /api/inventario/parametros` (A). Seeds: admin, sede principal, servicios base, parámetro GLOBAL.

**Fase 2/3 – Insumos**
| Rama | Endpoints | Acceso |
|---|---|---|
| `feature/rf-015-022-productos` | CRUD `/api/productos` con filtros categoría/estado/stock/vencimiento (RF-020) | A: CLEM · V, R: L |
| `feature/rf-016-017-024-movimientos` | `POST /api/movimientos`, `GET /api/productos/:id/movimientos` (RF-021) | A, R: CLEM · V: sin acceso |
| `feature/rf-018-019-021-alertas-historial` | `GET /api/alertas`, `PATCH /api/alertas/:id/atender` | A: CLEM · V, R: L |

**Punto crítico de concurrencia (RB-007 / RF-024):** actualizar stock con operación atómica:
```js
Producto.findOneAndUpdate(
  { _id, stockActual: { $gte: cantidad } },     // si no cumple, devuelve null → error 409
  { $inc: { stockActual: -cantidad } }, { new: true });
```
Después crear el `MovimientoInsumo` y la entrada de bitácora (usar transacción si hay replica set).

**Fase 4:** `GET /api/reportes/insumos` (A: CLEM, R: L), job `node-cron` diario para alertas de vencimiento.

---

## 8. Definition of Done (para cada PR)
- [ ] Schema usado tal cual (cambios al schema se discuten en el canal del equipo).
- [ ] Rutas con `authenticate` + `authorize` (+ `ownOnly` cuando aplique al Cliente).
- [ ] Validación de entrada (`validate`) y errores con formato único `{ ok:false, code, message }`.
- [ ] Eventos críticos registrados con `audit()`.
- [ ] Pruebas Jest/Supertest: caso feliz + 403 por rol + regla de negocio (RB) relacionada.
- [ ] Colección Postman/Thunder actualizada. PR revisado por otro integrante.

---

## 9. Cosas que se escaparon del prompt / del ERS (recomendaciones)

**Inconsistencias o vacíos del documento**
1. **Sede:** RF-014 pide elegir sede, pero no existe entidad Sede en el modelo conceptual (10.2). Se incluyó en este plan; actualicen el ERS.
2. **Historial clínico:** la matriz lo lista pero ningún RF define cómo se crea. Se propone derivarlo de la asistencia/diagnóstico; confirmen con el cliente (el negocio).
3. **Rol "auxiliar"** aparece en RU-012 pero solo hay 4 roles; **RB-006, 008–011, 014–017, 020** están omitidos (numeración con huecos); el resumen dice 14 RB pero hay 16 listadas.
4. **RB-012 (reservar con ≥ 2 días)** puede chocar con citas urgentes: ¿aplica a Recepcionista/Admin o solo al Cliente? Definirlo.
5. **Control del documento:** v2.0 y v3.0 tienen fechas posteriores a hoy (12/11/2026) y v3 y v4 comparten fecha; revisar.
6. **Cliente agenda solo consulta:** RB-012 dice "el cliente debe reservar", pero la matriz solo le da L. Aclarar si el cliente podrá agendar en el futuro.
7. **Lotes múltiples:** un producto con varios lotes/vencimientos no cabe en el modelo actual (un lote por producto). Evaluar una colección `lotes_producto` en la siguiente versión.
8. **Ajuste de inventario:** el ERS no define quién puede ajustar; aquí se asumió Admin y Recepcionista (matriz).

**Funcionalidades técnicas no mencionadas**
- **Registro y recuperación de contraseña** (reset por correo), cambio de contraseña, y cómo se crea el usuario del Cliente (¿lo crea la recepcionista o hay auto-registro?).
- **Refresh tokens** (cookie httpOnly) y revocación al inactivar usuarios.
- **Zona horaria:** guardar fechas en UTC y mostrar en `America/Bogota` (o la de la sede); la lógica de RB-012/018 y horarios depende de esto. Considerar **festivos**.
- **Borrado lógico** (`activo`) en vez de eliminar, paginación y ordenamiento en todos los listados.
- **Transacciones de MongoDB** requieren replica set (usar Atlas o `--replSet` en local/Docker).
- **Seguridad HTTP:** `helmet`, `cors` restringido, `express-rate-limit`, sanitización (`express-mongo-sanitize`), HTTPS en despliegue.
- **Documentación:** OpenAPI/Swagger generado desde los validators.
- **DevOps:** Docker Compose (api + mongo), GitHub Actions (lint + tests en cada PR), variables de entorno por ambiente, backup programado (`mongodump`, RNF-009).
- **Proveedor de recordatorios:** RF-013 necesita servicio de correo/SMS (Nodemailer + SendGrid/Twilio); abstraerlo para poder simular en desarrollo.
- **Habeas Data:** consentimiento registrado (campo incluido), política de retención y exportación/eliminación de datos del cliente.
- **Estrategia de pruebas de carga** para RNF-002/003 (k6 o Artillery) y datos semilla realistas.
- **Preparación para hospitalización/ventas:** `inventarioService.registrarMovimiento` ya queda como API interna reutilizable.

---

## 10. Checklist de arranque (primer día)
1. Carol: crea repo, `develop`, estructura de carpetas, `constants/roles.js`, `.env.example`.
2. Los tres: copian sus schemas de la sección 5 a `models/` en su rama core.
3. Reunión de 30 min para validar los contratos de la sección 6.
4. Nicolas prioriza `authenticate/authorize` (desbloquea a los demás); Felipe `auditService`; Carol `validate` + seeds.
5. Daily corto de 10 min y demo de cierre de cada fase.
