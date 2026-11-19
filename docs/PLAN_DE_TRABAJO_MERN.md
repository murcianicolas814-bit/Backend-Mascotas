# Plan de trabajo MERN – Zoolomascotas MX (ERS v4.0)
## Alcance reducido: Módulo de Insumos + Módulo de Agendamiento de Citas

**Equipo:** Nicolas · Felipe · Carol
**Prioridad:** Backend primero (Node + Express + MongoDB/Mongoose).

### Entidades en alcance (verificadas)

| Módulo | Entidades | Dueño |
|---|---|---|
| **Insumos** | Categorías · Proveedores · Productos (Alerta Stock, Movimientos: Entradas/Salidas/Ajustes) | **Carol** |
| **Agendamiento de Citas** | Sedes (selección por el cliente) · Citas (Control de asistencia) · Mascotas · Usuarios CLIENTE y VETERINARIO (Disponibilidad) | **Felipe + Nicolas** |

**Entidades de soporte (se conservan; las anteriores dependen de ellas):** Usuario/Auth/RBAC, Servicio, Empleado, HorarioLaboral, NoDisponibilidad, ParámetroInventario, Bitácora.

**Fuera de alcance:** reportes/exportación PDF-CSV, portal del cliente independiente, recordatorios automáticos, job `cron` de vencimientos y frontend React.

---

## 1. Mapa de dependencias entre entidades y Orquestación en Cascada (Opción A)

```
Sede ─────────┐
Servicio ─────┤
              ▼
   ┌───────────────────────┐
   │        Usuario        │ ◄── Identidad, Auth, Credenciales y RBAC (Nombres, Correo, Doc, Tel, Rol)
   └──────────┬────────────┘
              │  (Enlace bidireccional y orquestación atómica en cascada)
      ┌───────┴────────────────────────┐
      ▼                                ▼
┌───────────┐                  ┌──────────────┐
│  Cliente  │                  │   Empleado   │ (VETERINARIO / RECEPCIONISTA / ADMIN)
└─────┬─────┘                  └──────┬───────┘
      │                               │ ──► HorarioLaboral / NoDisponibilidad ──┐
      ▼                               │                                         │
   Mascota ───────────────────────────┼────────────────────────────────────► Cita
(clienteId o usuarioId)               │                                         │
                                      ▼                                         ▼
                                (Valida rol VET)                            Asistencia
```

### 1.1 Arquitectura de Orquestación en Cascada (Opción A)
Para evitar la duplicación de datos personales (`nombres`, `apellidos`, `correo`, `documento`, `telefono`) y al mismo tiempo mantener esquemas limpios y normalizados, se adoptó el **Patrón de Orquestación en Cascada**:
1. **Creación Atómica y Rollback Transaccional:** Al registrar un usuario (sea por `/api/auth/register` o `/api/usuarios`), el helper `orquestarCreacionUsuario` crea primero el documento `Usuario` y, según su rol (`CLIENTE` o `VETERINARIO`/`RECEPCIONISTA`/`ADMINISTRADOR`), crea en cascada su perfil correspondiente en `Cliente` o `Empleado`. Si la validación de perfil falla (ej. veterinario sin tarjeta profesional), se ejecuta un **rollback automático**, eliminando el usuario para evitar registros huérfanos.
2. **Sincronización en Actualización (`PATCH`):** `orquestarActualizacionUsuario` discrimina los campos de cuenta y los campos de perfil, actualizando ambos de manera coordinada.
3. **Baja Limpia en Cascada (`DELETE`):** `orquestarEliminacionUsuario` localiza los perfiles asociados y los elimina antes de borrar el usuario, asegurando cero documentos huérfanos.
4. **Resolución Transparente de Identidades:** Los módulos de `Mascotas` y `Citas` exponen resolvers universales (`resolverPerfilCliente` y `resolverPerfilVeterinario`) que aceptan indistintamente el ID de perfil (`Cliente`/`Empleado`) o el ID de la cuenta (`Usuario`), simplificando la integración para el cliente web o móvil.

**Orden de construcción obligatorio:** Usuario/Auth/RBAC + Orquestador Cascada → catálogos (Sede, Servicio, Categoría, Proveedor) → Empleado/Veterinario y Cliente → Mascota y Horarios → Cita (con validación de rol VET) → Asistencia. Insumos corre en paralelo (Parámetro → Categoría/Proveedor → Producto → Movimiento → Alerta).

---

## 2. Reparto por desarrollador

| Dev | Core (Fase 1) | Dominio (Fases 2-3) |
|---|---|---|
| **Nicolas** | Auth + JWT + RBAC (RF-029, RF-030, RS-001…009) + Sedes y Servicios | Empleado/VETERINARIO, HorarioLaboral, NoDisponibilidad y `disponibilidadService` (RF-001…004, RF-011, RF-014) |
| **Felipe** | Bitácora/Auditoría + logger + manejo de errores (RF-028, RNF-007, RS-007) | Cliente, Mascota, Cita y Control de asistencia (RF-005…010, RF-012) |
| **Carol** | Esqueleto, config, validación, seeds, ParámetroInventario (RF-023) | Categorías, Proveedores, Productos, Movimientos y Alertas (RF-015…022, RF-024) |

**Resultado del reparto:** las 11 entidades solicitadas quedan cubiertas sin huecos. Categoría y Proveedor se asignan a **Carol** por pertenecer al módulo de Insumos.

---

## 3. Fases y cronograma sugerido (sprints de 1 semana)

### Fase 0 – Setup conjunto (Día 1-2, los tres)
- Carol crea el repo (`/backend`), rama `develop`, ESLint/Prettier, `.env.example`.
- Nicolas y Felipe clonan y verifican que levanta (`npm run dev`).
- Acordar **contratos** (sección 6) y la estructura de carpetas (sección 4).

### Fase 1 – CORE (Semana 1, en paralelo, objetivo: desbloquear a todos)
Entrega `authenticate`, `authorize(...roles)`, `ownOnly`, `audit()` y `validate()` para que cada dev solo escriba lógica de negocio.

| Rama | Dueño | Contenido |
|---|---|---|
| `feature/core-setup-config` | Carol | Express app, conexión Mongo, `config/env`, `validate(zod/joi)`, `asyncHandler`, estructura de respuestas, seeds (admin, sede, servicios, categorías base) |
| `feature/core-auth-rbac` | Nicolas | Modelo Usuario, registro/login/logout/refresh, hash bcrypt, bloqueo por intentos, middlewares `authenticate`, `authorize`, `ownOnly` |
| `feature/core-auditoria-errores` | Felipe | Modelo Bitácora, `auditService.log()`, middleware `audit(entidad, accion)`, `errorHandler`, logger (pino/winston) |
| `feature/rf-023-parametros-inventario` | Carol | Modelo ParametroInventario (singleton) + endpoints |

**Hito Fase 1:** merge a `develop`; todos pueden proteger rutas con `router.post('/', authenticate, authorize('ADMINISTRADOR'), audit('Producto','CREAR'), ctrl.crear)`.

### Fase 2 – Entidades base de cada dominio (Semana 2)

| Rama | Dueño | RF / RB |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | Nicolas | RF-014 |
| `feature/rf-011-servicios` | Nicolas | RF-011, RF-003 |
| `feature/rf-001-empleados` | Nicolas | RF-001, RB-001, RU-001 |
| `feature/categorias-catalogo` *(sin RF asignado en ERS v4.0, ver §9)* | Carol | Catálogo de categorías |
| `feature/proveedores-catalogo` *(sin RF asignado en ERS v4.0, ver §9)* | Carol | Catálogo de proveedores |
| `feature/rf-005-clientes` | Felipe | RF-005, RB-001, RB-021, RU-003 |
| `feature/rf-006-mascotas` | Felipe | RF-006, RB-002, RB-019 |
| `feature/rf-015-022-productos` | Carol | RF-015, RF-020, RF-022, RB-022, RB-025 |

### Fase 3 – Entidades dependientes (Semana 3-4)

| Rama | Dueño | Depende de | RF / RB |
|---|---|---|---|
| `feature/rf-002-004-horarios-disponibilidad` | Nicolas | Empleado | RF-002, RF-004, RB-005 |
| `feature/rf-007-009-012-citas` | Felipe | Cliente, Mascota, Empleado, Horarios, Servicio, **Sede** | RF-007, RF-008, RF-009, RF-012, RB-003, RB-004, RB-005, RB-012, RB-018 |
| `feature/rf-010-asistencia-resultado` | Felipe | Cita | RF-010, RU-007 |
| `feature/rf-016-017-024-movimientos` | Carol | Producto | RF-016, RF-017, RF-024, RB-007, RB-023, RS-010 |
| `feature/rf-018-019-021-alertas-historial` | Carol | Producto, Movimiento | RF-018, RF-019, RF-021, RB-024 |

> Felipe empieza Citas apoyado en el contrato `disponibilidadService` (sección 6) con un stub mientras Nicolas termina Horarios.

### Fase 4 – Integración y endurecimiento (Semana 5)
Pruebas de integración cruzadas (revisión intercambiada: Nicolas revisa a Felipe, Felipe a Carol, Carol a Nicolas), pruebas de rendimiento (RNF-002/003), seguridad (helmet, rate-limit), backup (RNF-009), Swagger.

---

## 4. Estructura de carpetas backend y Arquitectura por Capas

```
backend/
├── bruno/                     Colección de endpoints para Bruno API
│   ├── authentication/        Login, Registro Público, Verificación Token
│   ├── usuarios/              CRUD Usuarios con orquestación en cascada
│   ├── clientes/              CRUD Clientes
│   ├── empleados/             CRUD Empleados (Veterinarios, Recepcionistas)
│   ├── mascotas/              CRUD Mascotas (resolución de cliente)
│   ├── citas/                 CRUD Citas (validación clínica de veterinario)
│   ├── categories/            CRUD Categorías
│   ├── products/              CRUD Productos e inventario
│   ├── services/              CRUD Servicios
│   └── environments/          Variables de entorno (local.yml)
├── src/
│   ├── config/                mongo.config.js, constant-roles.js
│   ├── controllers/           usuarios, empleados, clientes, mascotas, citas, etc.
│   ├── helpers/               bcrypt, jwt, user-orchestrator.helper.js, handle-mongoose-error
│   ├── middlewares/           authenticate, authorization, without-role
│   ├── models/                sede, servicio, categoria, producto, mascota, cita
│   │   └── auth/              usuario.model.js, cliente.model.js, empleado.model.js
│   ├── routes/                usuarios, empleados, clientes, mascotas, citas, auth, etc.
│   ├── services/              usuarios, empleados, clientes, mascotas, citas, etc.
│   └── index.js               Punto de entrada de Express y montaje de rutas
```

### 4.1 Arquitectura Modular de 4 Capas
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Rutas (Express Router)                                   │
│    - Define endpoints, métodos HTTP y middlewares           │
│    - Aplica authenticate.middleware y authorizationMiddleware│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Controladores (Controllers)                              │
│    - Valida parámetros y extrae req.body / req.query / params│
│    - Maneja respuestas HTTP estandarizadas y errores        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Servicios de Dominio (Domain Services)                   │
│    - Implementa reglas de negocio, paginación y filtros     │
│    - Consume orquestadores y helpers de dominio             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Orquestadores y Modelos Mongoose (Helpers & Models)      │
│    - user-orchestrator.helper.js (cascada atómica, rollback)│
│    - Colecciones MongoDB: usuarios, clientes, empleados, etc.│
└─────────────────────────────────────────────────────────────┘
```

**Flujo Git:** `main` (producción) ← `develop` (integración) ← `feature/*`. PR obligatorio con 1 revisor, sin push directo a `develop`.
**Nombre de rama:** `feature/rf-XXX-<descripcion>` (RF del ERS en el nombre; excepción: Categoría y Proveedor, aún sin RF). Commits: `feat(rf-007): crear cita con validación de solapamiento`.

---

## 5. SCHEMAS de Mongoose (definidos; el dev solo implementa lógica)

Todos con `timestamps: true` salvo Bitácora. Código ESM (`"type": "module"` en package.json).

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
// Valores semilla de Categoría (la categoría es una ENTIDAD, no un enum del producto)
export const CATEGORIAS_PRODUCTO = ['MEDICAMENTO', 'ALIMENTO', 'ACCESORIO', 'INSUMO'];
```

### 5.1 Usuario → colección `usuarios` (`models/auth/usuario.model.js`) — Cuenta e Identidad
```js
import mongoose from 'mongoose';
import { ROLES_LIST } from '../../config/constant-roles.js';

const usuarioSchema = new mongoose.Schema({
  nombres: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  apellidos: { type: String, required: [true, 'Los apellidos son obligatorios'], trim: true },
  tipoDocumento: { type: String, enum: ['CC', 'CE', 'PA', 'TI', 'NIT'], default: 'CC' },
  documento: { type: String, required: [true, 'El documento es obligatorio'], unique: true, trim: true },
  correo: { type: String, required: [true, 'El correo es obligatorio'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] },
  telefono: { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },
  passwordHash: { type: String, required: [true, 'La contraseña es obligatoria'], select: false },
  rol: { type: String, enum: ROLES_LIST, required: true, index: true },
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  activo: { type: Boolean, default: true },
  intentosFallidos: { type: Number, default: 0, min: 0 },
  bloqueadoHasta: { type: Date, default: null },
  ultimoLogin: { type: Date, default: null },
}, { timestamps: true, collection: 'usuarios' });

export default mongoose.model('Usuario', usuarioSchema);
```
> **Justificación de diseño (Opción A):** La entidad `Usuario` concentra la identidad personal y las credenciales de acceso al sistema, evitando redundancias en tablas hijas. Los campos `cliente` y `empleado` actúan como punteros bidireccionales hacia sus perfiles específicos.

### 5.2 Sede → `sedes` (Nicolas, Fase 2) — **seleccionable por el cliente**
```js
const sedeSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
  direccion: { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
  activa: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: 'sedes' });
export default mongoose.model('Sede', sedeSchema);
```
> **Decisión de alcance:** el cliente **consulta** el catálogo de sedes (`GET /api/sedes`) y **selecciona** la sede al crear su cita (`Cita.sede`). Para evitar la ambigüedad del ERS (§9), se habilita `POST /api/citas` para el rol `CLIENTE` con `ownOnly` sobre su propio `cliente`/`mascota`.

### 5.3 Servicio → `servicios` (Nicolas, Fase 2) — soporte de Cita
```js
const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  descripcion: { type: String, trim: true },
  duracionMin: { type: Number, required: true, min: 5, max: 720 },        // RF-011
  requiereVeterinario: { type: Boolean, default: true },                   // RB-003
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'servicio' });
export default mongoose.model('Servicio', servicioSchema);
```

### 5.4 Empleado → `empleados` (`models/auth/empleado.model.js`) — Perfil Laboral/Médico
```js
import mongoose from 'mongoose';
import { ROLES } from '../../config/constant-roles.js';

const empleadoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  roles: [{ type: String, enum: [ROLES.VETERINARIO, ROLES.RECEPCIONISTA, ROLES.ADMIN], required: true }],
  fechaContratacion: { type: Date, default: Date.now },
  cargo: { type: String, trim: true },
  sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
  tarjetaProfesional: {
    type: String,
    trim: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (this.roles && this.roles.includes(ROLES.VETERINARIO)) {
          return v && v.length > 0;
        }
        return true;
      },
      message: 'La tarjeta profesional es obligatoria para el rol de VETERINARIO'
    }
  },
  especialidades: [{ type: String, trim: true }],
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servicio' }],
  turno: { type: String, enum: ['MAÑANA', 'TARDE', 'NOCHE', 'ROTATIVO'], default: 'ROTATIVO' },
  cajaAsignada: { type: String, trim: true },
  nivelAcceso: { type: String, enum: ['TOTAL', 'OPERATIVO', 'CONSULTA'], default: 'OPERATIVO' },
  activo: { type: Boolean, default: true, index: true },
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
// Validar en pre('validate'): horaFin > horaInicio y jornada total <= 12 h
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

### 5.7 Cliente → `clientes` (`models/auth/cliente.model.js`) — Perfil de Tutor/Propietario
```js
import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  direccion: { type: String, required: [true, 'La dirección es obligatoria'], trim: true },
  consentimientoDatos: { type: Boolean, default: false },
  contactoEmergencia: {
    nombre: { type: String, trim: true },
    telefono: { type: String, trim: true },
  },
  observaciones: { type: String, trim: true },
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'clientes' });

export default mongoose.model('Cliente', clienteSchema);
```
> **Justificación de diseño (Opción A):** `Cliente` no duplica nombres, documento ni teléfono (estos residen en `Usuario`), enfocándose únicamente en dirección física, contacto de emergencia, historial de observaciones y consentimiento de Habeas Data.

### 5.8 Mascota → `mascotas` (Felipe, Fase 2)
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
  sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true }, // RF-014: elegida por el cliente
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

### 5.10 Asistencia (Control de asistencia) → `asistencias_cita` (Felipe, Fase 3)
```js
const asistenciaSchema = new mongoose.Schema({
  cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true, unique: true }, // 0..1 por cita
  asistio: { type: Boolean, required: true },
  resultado: { type: String, enum: ['ATENDIDA', 'NO_ASISTIO'], required: true },
  observaciones: { type: String, trim: true },
  diagnostico: { type: String, trim: true },        // historial clínico (solo lectura después)
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'asistencias_cita' });
export default mongoose.model('Asistencia', asistenciaSchema);
```
> El **historial clínico** se obtiene consultando `asistencias_cita` + `citas` por `mascota`; no requiere colección aparte en esta versión.

### 5.11 ParametroInventario → `parametros_inventario` (Carol, Fase 1) — soporte
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

### 5.12 Categoría → `categorias` (Carol, Fase 2) — **NUEVA**
```js
const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true, maxlength: 60,
            index: true },
  descripcion: { type: String, trim: true },
  activa: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: 'categorias' });
// Borrado lógico: inactivar (activa=false), nunca delete si tiene productos asociados.
export default mongoose.model('Categoria', categoriaSchema);
```
> Los valores de `CATEGORIAS_PRODUCTO` (§5.0) se cargan como **semilla** en esta colección. Producto referencia la categoría por `ObjectId`, no por enum. El id de la categoría `MEDICAMENTO` se fija en el seed para poder usarlo en validaciones:

```js
// constants/seed-categorias.js (Carol, Fase 1)
export const CATEGORIA_MEDICAMENTO_ID = '65f4a1c2e3b4d5a6f7c8d9e0'; // ObjectId fijo del seed
export const CATEGORIAS_SEED = [
  { _id: CATEGORIA_MEDICAMENTO_ID, nombre: 'MEDICAMENTO', descripcion: 'Fármacos y medicamentos' },
  { nombre: 'ALIMENTO',     descripcion: 'Alimentos y suplementos' },
  { nombre: 'ACCESORIO',    descripcion: 'Accesorios y juguetes' },
  { nombre: 'INSUMO',       descripcion: 'Insumos clínicos y de limpieza' },
];
```

### 5.13 Producto → `productos` (Carol, Fase 2)
```js
import mongoose from 'mongoose';
import { CATEGORIA_MEDICAMENTO_ID } from '../constants/seed-categorias.js';

const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, uppercase: true, trim: true }, // RB-022
  nombre: { type: String, required: true, trim: true, index: true },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', default: null, index: true },
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
  const esMedicamento = this.categoria &&
    this.categoria.toString() === CATEGORIA_MEDICAMENTO_ID;
  if (esMedicamento && (!this.lote || !this.fechaVencimiento)) {
    return next(new Error('Los medicamentos requieren lote y fecha de vencimiento'));
  }
  next();
});
export default mongoose.model('Producto', productoSchema);
```
> **Regla:** `stockActual` NUNCA se modifica desde el CRUD de productos; solo vía movimientos.

### 5.14 Proveedor → `proveedores` (Carol, Fase 2) — **NUEVA**
```js
const proveedorSchema = new mongoose.Schema({
  razonSocial: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
  identificacionFiscal: { type: String, required: true, unique: true, uppercase: true, trim: true }, // RFC/NIT
  nombreContacto: { type: String, trim: true },
  correo: { type: String, trim: true, lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] },
  telefono: { type: String, trim: true },
  direccion: { type: String, trim: true },
  activo: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: 'proveedores' });
// Borrado lógico: inactivar (activo=false), nunca delete si tiene productos asociados.
export default mongoose.model('Proveedor', proveedorSchema);
```
> Relación: `Producto.proveedor` → `Proveedor`. Un proveedor puede surtir muchos productos; un producto tiene **un** proveedor principal (default `null`).

### 5.15 MovimientoInsumo → `movimientos_insumo` (Carol, Fase 3)
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
> Validación de negocio en `pre('validate')`: si `tipo === 'AJUSTE'` then `sentidoAjuste` obligatorio; si `tipo !== 'AJUSTE'`, `sentidoAjuste` debe ser `null`.

### 5.16 AlertaStock → `alertas_stock` (Carol, Fase 3)
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
> **Generación:** `alertasService.evaluar(producto)` se invoca desde `registrarMovimiento` (y desde el CRUD de producto para el umbral de vencimiento al crear/editar). No hay job `cron` en este alcance.

### 5.17 Bitacora → `bitacora_auditoria` (Felipe, Fase 1) — transversal
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
// --- CONTRATOS DE ORQUESTACIÓN EN CASCADA (helpers/user-orchestrator.helper.js) ---

// 1. Creación en Cascada (utilizado en Auth y Usuarios)
orquestarCreacionUsuario(inputData) -> Promise<UsuarioPoblado>
// Crea Usuario y en cascada Cliente o Empleado según el rol.
// Si falla la validación de perfil (ej. Vet sin tarjeta profesional), ejecuta ROLLBACK automático.

// 2. Actualización en Cascada
orquestarActualizacionUsuario(id, datosActualizar) -> Promise<UsuarioPoblado>
// Segrega y sincroniza datos de cuenta (usuarios) y perfil (clientes o empleados).

// 3. Baja Limpia en Cascada
orquestarEliminacionUsuario(id) -> Promise<UsuarioEliminado>
// Elimina perfiles asociados antes de borrar el Usuario principal (0 huérfanos).

// 4. Resolvers Universales de Perfil
resolverPerfilCliente(identificador) -> Promise<ClienteDoc>
// Acepta indistintamente clienteId o usuarioId. Retorna el documento Cliente con usuario poblado.

resolverPerfilVeterinario(identificador) -> Promise<EmpleadoDoc>
// Acepta empleadoId o usuarioId. Valida que posea rol VETERINARIO para asignación médica.

// --- CONSULTAS ESPECIALIZADAS (services/usuarios.services.js, empleados, clientes) ---
dbObtenerVeterinariosActivos(filtros) -> Promise<EmpleadoDoc[]>
dbObtenerPerfilClientePorUsuario(identificador) -> Promise<ClienteDoc>

// --- CONTRATO DE MASCOTAS (services/mascotas.services.js) ---
dbCrearMascota({ cliente, nombre, especie, raza, sexo, pesoKg, ... }) -> Promise<MascotaDoc>
// 'cliente' puede ser clienteId o usuarioId (se resuelve transparentemente con resolverPerfilCliente).

// --- CONTRATO DE CITAS (services/citas.services.js) ---
dbCrearCita({ cliente, mascota, empleado, sede, servicio, fechaInicio, fechaFin, observaciones }, creadaPorId) -> Promise<CitaDoc>
// Valida: pertenencia de mascota al cliente, rol VETERINARIO en empleado, y coherencia de fechas.

// Nicolas expone (services/disponibilidadService.js) – Felipe lo consume en Citas
estaDisponible(empleadoId, sedeId, fechaInicio, fechaFin) -> { disponible: Boolean, motivo?: String }
// Valida: horario laboral (RB-005), no disponibilidades, solapamiento con citas CONFIRMADAS (RB-004)

// Felipe expone (services/auditService.js) – todos lo consumen
log({ req, tipoEvento, entidad, entidadId, accion, detalle, resultado })

// Carol expone (services/inventarioService.js) – API interna del módulo de Insumos
registrarMovimiento({ productoId, tipo, sentidoAjuste, cantidad, motivo, lote, usuarioId })

// Carol expone (services/alertasService.js) – llamado desde inventarioService y CRUD de Producto
evaluar(producto) -> void   // crea/actualiza alertas STOCK_BAJO, PROXIMO_VENCER, VENCIDO

// Nicolas expone en req (middleware authenticate)
req.userFound = { _id, rol, cliente, empleado, correo, nombres, ... }
```

---

## 7. Guía de trabajo y endpoints por desarrollador

> Notación de permisos tomada de la matriz del ERS: **A**=Admin, **V**=Veterinario, **R**=Recepcionista, **C**=Cliente.

### 7.1 NICOLAS — Sedes, Veterinario y disponibilidad

**Core – `feature/core-auth-rbac`** (Fase 1, RF-029, RF-030, RS-001…009)
| Endpoint | Acceso |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `POST /api/auth/refresh` | Público / autenticado |
| `GET /api/auth/me` | Autenticado |
| `PATCH /api/usuarios/:id/rol` (CAMBIO_PERMISOS en bitácora) | A |

Entregables: `authenticate`, `authorize(...roles)`, `ownOnly(modelo, campo)`, bloqueo tras N intentos, expiración configurable, tests de los 4 roles.

**Fase 2/3 – Agenda**
| Rama | Endpoints | Acceso (matriz) |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | CRUD `/api/sedes` | A: CLEM · V/R: L · **C: L (catálogo para seleccionar al agendar)** |
| `feature/rf-011-servicios` | CRUD `/api/servicios` | A: CLEM · V/R: L |
| `feature/rf-001-empleados` | CRUD `/api/empleados`, `PATCH /:id/inactivar`, asignación de roles/especialidades/servicios (RF-003) | A: CLEM · R: L |
| `feature/rf-002-004-horarios-disponibilidad` | `/api/empleados/:id/horarios`, `/api/empleados/:id/no-disponibilidades`, `GET /api/empleados/:id/agenda?desde&hasta` (RF-004), `GET /api/disponibilidad` | A, R: CLEM · V: L (solo la propia) |

### 7.2 FELIPE — Cliente, Mascota, Cita y Asistencia

**Core – `feature/core-auditoria-errores`** (Fase 1, RF-028, RS-007, RNF-007)
`GET /api/auditoria?tipoEvento&desde&hasta&usuario` (solo A, lectura).

| Rama | Endpoints | Acceso |
|---|---|---|
| `feature/rf-005-clientes` | CRUD `/api/clientes` | A, R: CLEM · V: L · C: L propio |
| `feature/rf-006-mascotas` | CRUD `/api/clientes/:id/mascotas`, `GET /api/mascotas/:id` | A, R: CLEM · V: L · C: L propias |
| `feature/rf-007-009-012-citas` | `POST/GET/PUT /api/citas`, `PATCH /api/citas/:id/cancelar` | A, R: CLEM · V: L propias · **C: CLEM propio (elige sede, con `ownOnly`)** |
| `feature/rf-010-asistencia-resultado` | `POST /api/citas/:id/asistencia`, `GET /api/mascotas/:id/historial` | A, V, R: CLEM · C: historial propio |

Reglas clave en `service`: RB-003, RB-004 (vía `disponibilidadService`), RB-005, RB-012 (≥ 2 días), RB-018 (cancelar/reprogramar ≥ 24 h), historial de cambios en cada modificación (RF-008), motivo obligatorio al cancelar (RF-009). `fechaFin = fechaInicio + servicio.duracionMin`.

### 7.3 CAROL — Insumos (Categorías, Proveedores, Productos, Movimientos, Alertas)

**Core – `feature/core-setup-config` y `feature/rf-023-parametros-inventario`**
`GET/PUT /api/inventario/parametros` (A). Seeds: admin, sede principal, servicios base, parámetro GLOBAL y categorías base.

| Rama | Endpoints | Acceso |
|---|---|---|
| `feature/categorias-catalogo` | `GET/POST/PUT /api/categorias`, `PATCH /:id/inactivar` | A: CLEM · V, R, C: L |
| `feature/proveedores-catalogo` | `GET/POST/PUT /api/proveedores`, `PATCH /:id/inactivar` | A, R: CLEM · V: L |
| `feature/rf-015-022-productos` | CRUD `/api/productos` con filtros categoría/proveedor/estado/stock/vencimiento (RF-020) | A: CLEM · V, R: L |
| `feature/rf-016-017-024-movimientos` | `POST /api/movimientos`, `GET /api/productos/:id/movimientos` (RF-021) | A, R: CLEM · V: sin acceso |
| `feature/rf-018-019-021-alertas-historial` | `GET /api/alertas`, `PATCH /api/alertas/:id/atender` | A: CLEM · V, R: L |

**Punto crítico de concurrencia (RB-007 / RF-024):** actualizar stock con operación atómica:
```js
Producto.findOneAndUpdate(
  { _id, stockActual: { $gte: cantidad } },     // si no cumple, devuelve null → error 409
  { $inc: { stockActual: -cantidad } }, { new: true });
```
Después crear el `MovimientoInsumo`, evaluar alertas y registrar la bitácora (usar transacción si hay replica set). Regla: `AJUSTE` usa `sentidoAjuste` (`INCREMENTO`/`DECREMENTO`); `ENTRADA`/`SALIDA` no lo usan.

---

## 8. Definition of Done (para cada PR)
- [ ] Schema usado tal cual (cambios al schema se discuten en el canal del equipo).
- [ ] Entidad registrada en la sección 5, con su dueño asignado en la sección 2 y sus endpoints en la sección 7.
- [ ] Rutas con `authenticate` + `authorize` (+ `ownOnly` cuando aplique al Cliente).
- [ ] Validación de entrada (`validate`) y errores con formato único `{ ok:false, code, message }`.
- [ ] Eventos críticos registrados con `audit()`.
- [ ] Pruebas Jest/Supertest: caso feliz + 403 por rol + regla de negocio (RB) relacionada.
- [ ] Colección Postman/Bruno actualizada. PR revisado por otro integrante.

---

## 9. Puntos abiertos y recomendaciones (alcance actual)

1. **Categoría y Proveedor sin RF:** no aparecen en el ERS v4.0. Se agregaron como entidades con rama `feature/categorias-catalogo` y `feature/proveedores-catalogo`. **Pendiente:** asignarles RF (p. ej. RF-031/RF-032) y actualizar el ERS.
2. **Producto.categoria cambiado a ObjectId:** el plan anterior la trataba como enum (`CATEGORIAS_PRODUCTO`). Ahora es una entidad (coincide con `src/models/categoria.model.js`). El `pre('validate')` de MEDICAMENTO usa el `_id` fijo del seed (§5.12).
3. **RB-012 (reservar con ≥ 2 días):** ¿aplica a Recepcionista/Admin o solo al Cliente? Definirlo antes de Fase 3.
4. **Zona horaria:** guardar fechas en UTC y mostrar en `America/Bogota` (o la de la sede). RB-012/018 y los horarios dependen de esto. Considerar festivos.
5. **Borrado lógico** (`activo`/`activa`) en Categoría, Proveedor, Sede, Producto y Empleado, nunca borrado físico si hay relaciones.
6. **Transacciones de MongoDB** requieren replica set (Atlas o `--replSet` en local/Docker) para Movimiento + Alerta + Bitácora atómicos.
7. **Seguridad HTTP:** `helmet`, `cors` restringido, `express-rate-limit`, `express-mongo-sanitize`, HTTPS en despliegue.
8. **Habeas Data:** consentimiento registrado en Cliente; política de retención y exportación/eliminación de datos.
9. **Lotes múltiples:** un producto con varios lotes/vencimientos no cabe en el modelo actual (un lote por producto). Evaluar `lotes_producto` en una versión futura.
10. **Ajuste de inventario:** el ERS no define quién puede ajustar; aquí se asumió Admin y Recepcionista (matriz).

---

## 10. Checklist de arranque (primer día)
1. Carol: crea repo, `develop`, estructura de carpetas, `constants/roles.js`, `.env.example`.
2. Los tres: copian sus schemas de la sección 5 a `models/` en su rama core. Carol incluye **Categoría** y **Proveedor**.
3. Reunión de 30 min para validar los contratos de la sección 6 (incluye `evaluar()` de alertas).
4. Nicolas prioriza `authenticate/authorize` (desbloquea a los demás); Felipe `auditService`; Carol `validate` + seeds (categorías base).
5. Daily corto de 10 min y demo de cierre de cada fase.
