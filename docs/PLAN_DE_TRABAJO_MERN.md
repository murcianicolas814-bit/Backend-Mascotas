# Plan de trabajo MERN – Zoolomascotas MX (ERS v4.0)

**Equipo:** Nicolas · Felipe · Carol
**Prioridad:** Backend primero (Node + Express + MongoDB/Mongoose). El frontend React inicia después de cerrar la Fase 4.

> **Modelo Arquitectónico Oficial (Identity & Profile Pattern):** Centralización de datos de identidad, seguridad y acceso en `Usuario` (`usuarios`), complementado con perfiles de dominio especializados en colecciones dedicadas: `Empleado` (`empleados`) y `Cliente` (`clientes`) mediante referencias bidireccionales 1:1. Esto asegura que los datos generales compartidos (nombres, apellidos, documento, correo, teléfono) residan en el núcleo de autenticación, mientras que los datos específicos de cada rol (laborales, profesionales, tarjeta profesional o turnos para empleados; dirección, Habeas Data y mascotas para clientes) se soliciten y gestionen de forma estrictamente separada. Ver sección 5.1.

---

## Cómo usar esta guía (léelo primero)

Este documento tiene dos partes:

| Parte | Secciones | Para qué sirve |
|---|---|---|
| **A – Especificación técnica** | 1 a 10 | **Qué** se construye: entidades, schemas, contratos, endpoints, permisos y reglas. Es la fuente de verdad técnica. No se cambia sin acuerdo del equipo. |
| **B – Guía operativa** | 11 a 20 | **Cómo** y **en qué orden** se construye: tu rol en el equipo, el flujo de trabajo diario, el paso a paso de cada tarea, el calendario, plantillas y errores comunes. |

**Lectura obligatoria del primer día (≈ 2 horas):**
1. Esta sección.
2. Sección 11 (roles y responsabilidades) y 13 (flujo de trabajo diario).
3. Sección 14 (anatomía de un módulo): es la plantilla que vas a copiar en cada endpoint.
4. **Tu** sección dentro de la 15 (15.1 Nicolas, 15.2 Felipe, 15.3 Carol), completa.
5. En la Parte A: los schemas que te tocan (sección 5), los contratos (6), tus endpoints (7) y la Definition of Done (8).
6. El ERS (PDF): los RF, RB y la matriz de permisos que aparecen en tus tareas.

**Reglas de oro:**
- **Si la respuesta está en esta guía, no preguntes: búscala.** Si no está, o dos partes se contradicen, pregunta en el canal del equipo y propone el cambio a la guía para que la próxima persona no tenga que preguntar.
- **Antes de empezar cualquier tarea, lee su ficha completa** (sección 15). Cada ficha dice: objetivo, rama, archivos, pasos, criterios de aceptación, pruebas, de quién dependes y a quién desbloqueas.
- **Una tarea está terminada cuando cumple la Definition of Done (sección 8)**, no cuando "ya funciona en mi máquina".
- **Nunca trabajes directamente en `develop` ni en `main`.**

**Índice**
- Parte A: 1. Dependencias · 2. Reparto · 3. Fases · 4. Carpetas · 5. Schemas · 6. Contratos · 7. Endpoints · 8. Definition of Done · 9. Recomendaciones · 10. Checklist de arranque
- Parte B: 11. Roles y responsabilidades · 12. Entorno y herramientas · 13. Flujo de trabajo diario · 14. Anatomía de un módulo · 15. Guía detallada por desarrollador · 16. Calendario día a día · 17. Dependencias y stubs · 18. Plantillas · 19. Errores comunes · 20. Glosario

---

# PARTE A – ESPECIFICACIÓN TÉCNICA

## 1. Mapa de dependencias entre entidades

```
Sede ─────────────┐
Servicio ─────────┤
                  │
Usuario (colección `usuarios` - Identidad, Seguridad y Datos Comunes)
   ├──► [Empleado]  (colección `empleados` - Perfil Laboral: ADMIN | VETERINARIO | RECEPCIONISTA)
   │        ├──► HorarioLaboral / NoDisponibilidad ─────────┐
   │        └──► Servicios habilitados / Sedes asignadas    │
   │                                                        ▼
   └──► [Cliente]   (colección `clientes` - Perfil Dueño) ──► Mascota ──────► Cita ──► Asistencia
                                                               (Empleado + Servicio + Sede)

ParametroInventario ──► Producto ──► MovimientoInsumo ──► AlertaStock

Bitacora (transversal: la alimentan TODOS los módulos)
```

**Orden de construcción obligatorio:** Usuario base + Perfiles especializados en `src/models/auth/` (`Empleado` y `Cliente`) / Auth / RBAC → Catálogos (`Sede`, `Servicio`) → Gestión de Empleados y Clientes (CRUD sobre sus colecciones y vinculación con Usuario) → Mascota y Horarios → Cita → Asistencia. Insumos corre en paralelo (Parámetros → Producto → Movimiento → Alerta). Reportes al final porque consumen todo.

---

## 2. Reparto homogéneo

| Dev | Core (Fase 1) | Dominio principal (Fases 2-3) | Reportes (Fase 4) |
|---|---|---|---|
| **Nicolas** | Schema base `Usuario` + discriminador `Empleado`, Auth + JWT + RBAC (RF-029, RF-030, RS-001…009) | Sedes, Servicios, gestión de Empleados, Horarios, No disponibilidades (RF-001…004, RF-011, RF-014) | Reporte desempeño de empleados + exportador PDF/CSV (RF-025 parcial, RF-027) |
| **Felipe** | Discriminador `Cliente`, Bitácora/Auditoría + logger + manejo de errores (RF-028, RNF-007, RS-007) | Gestión de Clientes, Mascotas, Citas, Asistencia (RF-005…010, RF-012, RF-013) | Reportes de citas y ocupación (RF-025 parcial) + recordatorios (RF-013) |
| **Carol** | Esqueleto del proyecto, config, validación, seeds, Parámetros de inventario (RF-023) | Productos, Movimientos, Alertas (RF-015…022, RF-024) | Reportes de insumos (RF-026) + cron de alertas |

Carga aproximada: ~9 RF cada uno + su parte de core.

---

## 3. Fases y cronograma sugerido (sprints de 1 semana)

### Fase 0 – Setup conjunto (Día 1-2, los tres)
- Carol crea el repo (`/backend`, `/frontend`), ramas `main` y `develop`, ESLint/Prettier, `.env.example`.
- Nicolas y Felipe clonan y verifican que levanta (`npm run dev`).
- Acordar **contratos** (sección 6), la estructura de carpetas (sección 4) y el **modelo unificado de Usuario** (sección 5.1).

### Fase 1 – CORE (Semana 1, en paralelo, objetivo: desbloquear a todos)
Se entrega primero porque deja listos `authenticate`, `authorize(...roles)`, `ownOnly`, `audit()` y `validate()`; así en las fases siguientes cada dev solo escribe lógica de negocio y **protege sus rutas con una línea**.

| Rama | Dueño | Contenido |
|---|---|---|
| `feature/core-setup-config` | Carol | Express app, conexión Mongo, `config/env`, `validate(zod/joi)`, `asyncHandler`, estructura de respuestas, seeds (admin como Empleado con rol ADMINISTRADOR, sede, servicios), colección Postman |
| `feature/core-auth-rbac` | Nicolas | Schema base Usuario + discriminador Empleado, login/logout/refresh, hash bcrypt, bloqueo por intentos, expiración, middlewares `authenticate`, `authorize`, `ownOnly` |
| `feature/core-usuario-cliente` | Felipe | Discriminador Cliente (sobre el schema base de Nicolas) |
| `feature/core-auditoria-errores` | Felipe | Modelo Bitácora, `auditService.log()`, middleware `audit(entidad, accion)`, `errorHandler`, logger (pino/winston) |
| `feature/rf-023-parametros-inventario` | Carol | Modelo ParametroInventario (singleton) + endpoints |

**Hito Fase 1:** merge a `develop`; todos pueden proteger rutas con `router.post('/', authenticate, authorize('ADMINISTRADOR'), audit('Empleado','CREAR'), ctrl.crear)`.

### Fase 2 – Entidades base de cada dominio (Semana 2)
| Rama | Dueño | RF / RB |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | Nicolas | RF-014 |
| `feature/rf-011-servicios` | Nicolas | RF-011, RF-003 |
| `feature/rf-001-empleados` | Nicolas | RF-001, RB-001, RU-001 (CRUD sobre el discriminador `Empleado`) |
| `feature/rf-005-clientes` | Felipe | RF-005, RB-001, RB-021, RU-003 (CRUD sobre el discriminador `Cliente`) |
| `feature/rf-006-mascotas` | Felipe | RF-006, RB-002, RB-019 |
| `feature/rf-015-022-productos` | Carol | RF-015, RF-020, RF-022, RB-022, RB-025 |

### Fase 3 – Entidades dependientes (Semana 3-4)
| Rama | Dueño | Depende de | RF / RB |
|---|---|---|---|
| `feature/rf-002-004-horarios-disponibilidad` | Nicolas | Usuario (Empleado) | RF-002, RF-004, RB-005 |
| `feature/rf-007-009-012-citas` | Felipe | Usuario (Cliente y Empleado), Mascota, Horarios, Servicio | RF-007, RF-008, RF-009, RF-012, RB-003, RB-004, RB-005, RB-012, RB-018 |
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
  models/
    usuario/         Usuario.js (base, Nicolas), Empleado.js (discriminador, Nicolas),
                     Cliente.js (discriminador, Felipe), index.js (re-exporta los tres)
    (resto: un archivo por schema, listados abajo)
  middlewares/       authenticate.js, authorize.js, ownOnly.js, audit.js, validate.js, errorHandler.js
  modules/<modulo>/  routes.js, controller.js, service.js, validators.js
                     (los módulos `empleados` y `clientes` siguen existiendo como API,
                      pero operan sobre los modelos Empleado y Cliente de la colección `usuarios`)
  services/          auditService.js, disponibilidadService.js, inventarioService.js
  jobs/              alertasInventario.js, recordatorios.js
  utils/             asyncHandler.js, appError.js, exportador.js
  app.js  server.js
backend/tests/       (Jest + Supertest + mongodb-memory-server)
```

**Flujo Git:** `main` (producción) ← `develop` (integración) ← `feature/*`. PR obligatorio con 1 revisor, sin push directo a `develop`.
**Nombre de rama:** `feature/rf-XXX-<descripcion>` (RF del ERS en el nombre). Commits: `feat(rf-007): crear cita con validación de solapamiento`.

---

## 5. SCHEMAS de Mongoose (Arquitectura de Identidad y Perfiles Separados)

Todos con `timestamps: true` (salvo bitácora). Código ESM (`"type": "module"` en `package.json`).

---

### 5.0 Constantes compartidas – `src/config/constant-roles.js`
```js
export const ROLES = Object.freeze({
  ADMIN: 'ADMINISTRADOR',
  VETERINARIO: 'VETERINARIO',
  RECEPCIONISTA: 'RECEPCIONISTA',
  CLIENTE: 'CLIENTE',
});
export const ROLES_LIST = Object.values(ROLES);
export const ROLES_EMPLEADO = [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.RECEPCIONISTA];
export const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO'];
export const CATEGORIAS_PRODUCTO = ['MEDICAMENTO', 'ALIMENTO', 'ACCESORIO', 'INSUMO'];
export const TIPOS_DOCUMENTO = ['CC', 'CE', 'PA', 'RFC', 'INE'];
```

---

### 5.1 Arquitectura de Usuarios: Patrón Identidad y Perfil (Identity & Profile Pattern)

#### Fundamento del Diseño: ¿Por qué se diseñan los modelos de esta manera?
En una clínica veterinaria integral como **ZoloMascotas**, los usuarios no pueden modelarse bajo un esquema monolítico plano ni bajo una única colección sobrecargada sin incurrir en graves problemas de seguridad, validación y acoplamiento. La solución implementada sigue el **Patrón de Identidad y Perfiles Separados** (`Identity & Profile Pattern`) con las siguientes razones arquitectónicas:

1. **Separación de Responsabilidades (Single Responsibility Principle - SRP):**
   - **`Usuario` (`src/models/auth/usuario.model.js`):** Gestiona de forma única la identidad del sistema, credenciales (`correo`, `passwordHash`), seguridad (`intentosFallidos`, `bloqueadoHasta`, `activo`), y datos personales compartidos por toda persona física (`nombres`, `apellidos`, `tipoDocumento`, `documento`, `telefono`). El subsistema de autenticación (JWT, Login, Recuperación de contraseña) interactúa única y exclusivamente con este modelo.
   - **`Empleado` (`src/models/auth/empleado.model.js`):** Gestiona la relación laboral, contractual y operativa. Contiene datos que **jamás deben pedirse a un cliente** (cargos, sedes asignadas, turnos, cajas, especialidades y tarjeta profesional médica).
   - **`Cliente` (`src/models/auth/cliente.model.js`):** Gestiona la relación comercial y de tutoría de mascotas. Contiene datos legales de privacidad (`consentimientoDatos` / Habeas Data), dirección domiciliaria y contactos de emergencia para notificación.

2. **Cumplimiento Estricto del Criterio "Solicitud de datos por separado":**
   - El sistema tiene interfaces y formularios completamente independientes:
     - El **Portal de Clientes** o la recepción al registrar un tutor solicita únicamente: nombres, contacto, dirección y autorización de datos.
     - La **Administración de Talento Humano** al dar de alta un médico veterinario solicita: tarjeta profesional, servicios que prestará y especialidades clínicas.
     - Al separar las colecciones físicas (`usuarios`, `empleados`, `clientes`), las validaciones de esquema de Mongoose (`required`, `validate`, `sparse`) se aplican limpiamente sin campos nulos innecesarios ni excepciones complejas.

3. **Seguridad y Principio de Menor Privilegio (Zero Trust & Least Privilege):**
   - En MongoDB, la colección `clientes` puede ser consultada por recepcionistas para agendar citas sin exponer la colección `empleados` (donde residen datos sensibles de nómina, contratos o accesos administrativos).
   - `passwordHash` se protege con `select: false` en `Usuario`, previniendo fugas accidentales en consultas pobladas.

4. **Soporte de Multi-Rol Dinámico para Empleados:**
   - Un empleado puede ejercer más de un rol simultáneamente (ejemplo: un profesional que es `ADMINISTRADOR` y al mismo tiempo atiende como `VETERINARIO`). El arreglo `roles: [String]` dentro de `Empleado` permite esta flexibilidad sin duplicar cuentas de usuario.

5. **Eficiencia en Consultas e Indexación:**
   - La colección de `clientes` crecerá exponencialmente (miles de registros), mientras que la de `empleados` permanecerá acotada. Separarlas optimiza el tamaño de la memoria RAM (Working Set) y la velocidad de los índices B-Tree en MongoDB.

---

#### 5.1.a Modelo de Identidad Central – `src/models/auth/usuario.model.js`
Colección: `usuarios`
```js
import mongoose from 'mongoose';
import { ROLES_LIST } from '../../config/constant-roles.js';

const usuarioSchema = new mongoose.Schema({
  // Datos generales compartidos por todo usuario
  nombres: { type: String, required: [true, 'Los nombres son obligatorios'], trim: true },
  apellidos: { type: String, required: [true, 'Los apellidos son obligatorios'], trim: true },
  tipoDocumento: { type: String, enum: ['CC', 'CE', 'PA', 'RFC', 'INE'], default: 'CC' },
  documento: { type: String, required: [true, 'El documento es obligatorio'], unique: true, trim: true },
  correo: { 
    type: String, 
    required: [true, 'El correo electrónico es obligatorio'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] 
  },
  telefono: { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },

  // Credenciales y Seguridad
  passwordHash: { type: String, required: [true, 'La contraseña es obligatoria'], select: false },
  rol: { type: String, enum: ROLES_LIST, required: [true, 'El rol es obligatorio'], index: true },

  // Referencias a perfiles específicos según el rol
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },

  // Estado y Auditoría
  activo: { type: Boolean, default: true },
  intentosFallidos: { type: Number, default: 0, min: 0 },
  bloqueadoHasta: { type: Date, default: null },
  ultimoLogin: { type: Date, default: null },
}, { timestamps: true, collection: 'usuarios' });

export default mongoose.model('Usuario', usuarioSchema);
```

---

#### 5.1.b Modelo de Perfil Empleado – `src/models/auth/empleado.model.js`
Colección: `empleados` (Roles: `ADMINISTRADOR`, `VETERINARIO`, `RECEPCIONISTA`)
```js
import mongoose from 'mongoose';
import { ROLES } from '../../config/constant-roles.js';

const empleadoSchema = new mongoose.Schema({
  // Enlace 1:1 obligatorio con la cuenta de usuario
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El ID de usuario es obligatorio'], 
    unique: true 
  },

  // Roles específicos que desempeña el empleado
  roles: { 
    type: [{ type: String, enum: [ROLES.ADMIN, ROLES.VETERINARIO, ROLES.RECEPCIONISTA] }],
    validate: [(v) => v && v.length > 0, 'Debe especificar al menos un rol de empleado'] 
  },

  // Datos laborales comunes a empleados
  fechaContratacion: { type: Date, default: Date.now },
  cargo: { type: String, trim: true },
  sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],

  // Datos específicos para VETERINARIO
  tarjetaProfesional: { 
    type: String, 
    trim: true,
    required: [
      function() { return this.roles && this.roles.includes(ROLES.VETERINARIO); },
      'La tarjeta profesional es obligatoria para el rol de Veterinario'
    ]
  },
  especialidades: [{ type: String, trim: true }],
  servicios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Servicio' }],

  // Datos específicos para RECEPCIONISTA
  turno: { 
    type: String, 
    enum: ['MAÑANA', 'TARDE', 'NOCHE', 'ROTATIVO'], 
    default: 'ROTATIVO' 
  },
  cajaAsignada: { type: String, trim: true },

  // Datos específicos para ADMINISTRADOR
  nivelAcceso: { 
    type: String, 
    enum: ['TOTAL', 'SUPERVISOR'], 
    default: 'TOTAL' 
  },

  // Estado del empleado
  activo: { type: Boolean, default: true, index: true },
}, { timestamps: true, collection: 'empleados' });

export default mongoose.model('Empleado', empleadoSchema);
```

---

#### 5.1.c Modelo de Perfil Cliente – `src/models/auth/cliente.model.js`
Colección: `clientes` (Tutor de mascotas)
```js
import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  // Enlace 1:1 obligatorio con la cuenta de usuario
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El ID de usuario es obligatorio'], 
    unique: true 
  },

  // Datos específicos solicitados exclusivamente al Cliente
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
  observaciones: { type: String, trim: true },
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'clientes' });

// Relación virtual con sus mascotas (1 cliente : N mascotas)
clienteSchema.virtual('mascotas', {
  ref: 'Mascota',
  localField: '_id',
  foreignField: 'cliente'
});

export default mongoose.model('Cliente', clienteSchema);
```

---

### 5.2 Sede – `src/models/sede.model.js`
Colección: `sedes`
```js
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
  telefono: { type: String, trim: true },
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
  activa: { type: Boolean, default: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true, collection: 'sedes' });

export default mongoose.model('Sede', sedeSchema);
```

---

### 5.3 Servicio – `src/models/servicio.model.js`
Colección: `servicios`
```js
import { Schema, model } from 'mongoose';

const servicioSchema = new Schema(
  {
    nombre: { 
      type: String, 
      required: [true, 'El nombre del servicio es obligatorio'], 
      unique: true, 
      trim: true, 
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'] 
    },
    descripcion: { type: String, trim: true, maxlength: [255, 'La descripción no puede exceder los 255 caracteres'] },
    categoria: {
      type: String,
      enum: {
        values: ['CONSULTA', 'CIRUGIA', 'VACUNACION', 'DESPARASITACION', 'ESTETICA_BANO', 'LABORATORIO', 'URGENCIA', 'OTRO'],
        message: 'La categoría {VALUE} no es válida'
      },
      default: 'CONSULTA'
    },
    precio: { 
      type: Number, 
      required: [true, 'El precio del servicio es obligatorio'], 
      min: [0, 'El precio no puede ser negativo'], 
      default: 0 
    },
    duracionMinutos: {
      type: Number,
      default: 30,
      min: [5, 'La duración mínima es de 5 minutos']
    },
    requiereAyuno: { type: Boolean, default: false },
    indicacionesPrevias: { type: String, trim: true },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    creadoPor: { type: Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { timestamps: true, collection: 'servicios' }
);

export default model('Servicio', servicioSchema);
```

---

### 5.4 HorarioLaboral – `src/models/horarioLaboral.model.js`
Colección: `horarios_laborales`
```js
import mongoose from 'mongoose';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const horarioSchema = new mongoose.Schema({
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true, index: true },
  sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
  diaSemana: { type: Number, required: true, min: 0, max: 6 }, // 0=Domingo, 6=Sábado
  horaInicio: { type: String, required: true, match: HHMM },
  horaFin: { type: String, required: true, match: HHMM },
  descansoInicio: { type: String, match: HHMM },
  descansoFin: { type: String, match: HHMM },
  activo: { type: Boolean, default: true },
}, { timestamps: true, collection: 'horarios_laborales' });

horarioSchema.index({ empleado: 1, sede: 1, diaSemana: 1 }, { unique: true });
export default mongoose.model('HorarioLaboral', horarioSchema);
```

---

### 5.5 NoDisponibilidad – `src/models/noDisponibilidad.model.js`
Colección: `no_disponibilidades`
```js
import mongoose from 'mongoose';

const noDispSchema = new mongoose.Schema({
  empleado: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true, index: true },
  tipo: { type: String, enum: ['VACACIONES', 'PERMISO', 'INCAPACIDAD', 'OTRO'], required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  motivo: { type: String, trim: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'no_disponibilidades' });

noDispSchema.index({ empleado: 1, fechaInicio: 1, fechaFin: 1 });
export default mongoose.model('NoDisponibilidad', noDispSchema);
```

---

### 5.6 Mascota – `src/models/mascota.model.js`
Colección: `mascotas`
```js
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
```

---

### 5.7 Cita – `src/models/cita.model.js`
Colección: `citas`
```js
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
```

---

### 5.8 Asistencia y Resultado – `src/models/asistencia.model.js`
Colección: `asistencias_cita`
```js
import mongoose from 'mongoose';

const asistenciaSchema = new mongoose.Schema({
  cita: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true, unique: true },
  asistio: { type: Boolean, required: true },
  resultado: { type: String, enum: ['ATENDIDA', 'NO_ASISTIO'], required: true },
  observaciones: { type: String, trim: true },
  diagnostico: { type: String, trim: true }, // Alimenta la historia clínica de la mascota
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'asistencias_cita' });

export default mongoose.model('Asistencia', asistenciaSchema);
```

---

### 5.9 ParametroInventario – `src/models/parametroInventario.model.js`
Colección: `parametros_inventario`
```js
import mongoose from 'mongoose';

const parametroSchema = new mongoose.Schema({
  clave: { type: String, default: 'GLOBAL', unique: true, immutable: true },
  umbralVencimientoDias: { type: Number, default: 30, min: 1 },
  stockMinimoDefault: { type: Number, default: 5, min: 0 },
  unidadesMedida: { type: [String], default: ['UNIDAD', 'CAJA', 'KG', 'G', 'ML', 'L', 'TABLETA'] },
  actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true, collection: 'parametros_inventario' });

export default mongoose.model('ParametroInventario', parametroSchema);
```

---

### 5.10 Producto – `src/models/producto.model.js`
Colección: `productos`
```js
import mongoose from 'mongoose';
import { CATEGORIAS_PRODUCTO } from '../config/constant-roles.js';

const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  nombre: { type: String, required: true, trim: true, index: true },
  categoria: { type: String, enum: CATEGORIAS_PRODUCTO, required: true, index: true },
  unidadMedida: { type: String, required: true },
  stockActual: { type: Number, required: true, default: 0, min: [0, 'El stock no puede ser negativo'] },
  stockMinimo: { type: Number, required: true, min: 0 },
  umbralVencimientoDias: { type: Number, min: 1 },
  lote: { type: String, trim: true },
  fechaVencimiento: { type: Date },
  ubicacion: { type: String, trim: true },
  activo: { type: Boolean, default: true, index: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true, collection: 'productos' });

productoSchema.pre('validate', function (next) {
  if (this.categoria === 'MEDICAMENTO' && (!this.lote || !this.fechaVencimiento)) {
    return next(new Error('Los medicamentos requieren lote y fecha de vencimiento'));
  }
  next();
});

export default mongoose.model('Producto', productoSchema);
```

---

### 5.11 MovimientoInsumo – `src/models/movimientoInsumo.model.js`
Colección: `movimientos_insumo`
```js
import mongoose from 'mongoose';

const movimientoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true, index: true },
  tipo: { type: String, enum: ['ENTRADA', 'SALIDA', 'AJUSTE'], required: true },
  sentidoAjuste: { type: String, enum: ['INCREMENTO', 'DECREMENTO'] },
  cantidad: { type: Number, required: true, min: [0.0001, 'Cantidad debe ser > 0'] },
  stockAnterior: { type: Number, required: true, min: 0 },
  stockResultante: { type: Number, required: true, min: 0 },
  motivo: { type: String, required: true, trim: true },
  lote: { type: String, trim: true },
  fechaVencimiento: { type: Date },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
}, { timestamps: true, collection: 'movimientos_insumo' });

movimientoSchema.index({ producto: 1, createdAt: -1 });
export default mongoose.model('MovimientoInsumo', movimientoSchema);
```

---

### 5.12 AlertaStock – `src/models/alertaStock.model.js`
Colección: `alertas_stock`
```js
import mongoose from 'mongoose';

const alertaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true, index: true },
  tipo: { type: String, enum: ['STOCK_BAJO', 'PROXIMO_VENCER', 'VENCIDO'], required: true },
  estado: { type: String, enum: ['ACTIVA', 'ATENDIDA'], default: 'ACTIVA', index: true },
  mensaje: { type: String, required: true },
  atendidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  atendidaEn: Date,
}, { timestamps: true, collection: 'alertas_stock' });

alertaSchema.index({ producto: 1, tipo: 1 }, { unique: true, partialFilterExpression: { estado: 'ACTIVA' } });
export default mongoose.model('AlertaStock', alertaSchema);
```

---

### 5.13 Bitacora de Auditoría – `src/models/bitacora.model.js`
Colección: `bitacora_auditoria`
```js
import mongoose from 'mongoose';

const bitacoraSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now, index: true, immutable: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', immutable: true },
  usuarioCorreo: { type: String, immutable: true },
  rol: { type: String, immutable: true },
  tipoEvento: { 
    type: String, 
    required: true, 
    immutable: true, 
    index: true,
    enum: ['AUTENTICACION', 'CAMBIO_PERMISOS', 'ALTA', 'MODIFICACION', 'BAJA', 'MOVIMIENTO_INVENTARIO', 'ERROR_ACCESO'] 
  },
  entidad: { type: String, immutable: true },
  entidadId: { type: String, immutable: true },
  accion: { type: String, required: true, immutable: true },
  detalle: { type: mongoose.Schema.Types.Mixed, immutable: true },
  resultado: { type: String, enum: ['EXITO', 'FALLO'], default: 'EXITO', immutable: true },
  ip: { type: String, immutable: true },
  userAgent: { type: String, immutable: true },
}, { collection: 'bitacora_auditoria' });

bitacoraSchema.index({ tipoEvento: 1, fecha: -1 });
export default mongoose.model('Bitacora', bitacoraSchema);
```

---

## 6. Contratos entre desarrolladores (acordar en Fase 0)

```js
// Nicolas expone (services/disponibilidadService.js) – Felipe lo consume en Citas
estaDisponible(empleadoId, sedeId, fechaInicio, fechaFin) -> { disponible: Boolean, motivo?: String }
// Valida: empleado activo (tipoUsuario = EMPLEADO), horario laboral (RB-005), no disponibilidades,
// solapamiento con citas CONFIRMADAS (RB-004)

// Felipe expone (services/auditService.js) – todos lo consumen
log({ req, tipoEvento, entidad, entidadId, accion, detalle, resultado })
// Toma usuario, correo, tipoUsuario y roles desde req.user

// Carol expone (services/inventarioService.js) – futuro: hospitalización/ventas
registrarMovimiento({ productoId, tipo, sentidoAjuste, cantidad, motivo, lote, usuarioId })

// Nicolas expone en req (middleware authenticate)
req.user = { id, correo, tipoUsuario, roles }
// tipoUsuario: 'EMPLEADO' | 'CLIENTE'
// roles: roles efectivos (ej. ['VETERINARIO','ADMINISTRADOR'] o ['CLIENTE'])
// El id del usuario ES el id del empleado o del cliente (ya no existen empleadoId / clienteId)

// Middlewares
authorize(...roles)            // pasa si req.user.roles tiene AL MENOS uno de los roles indicados
ownOnly(Modelo, campo)         // para CLIENTE: exige que doc[campo] === req.user.id (ej. Cita.cliente, Mascota.cliente)
```

---

## 7. Guía de trabajo y endpoints por desarrollador

> Notación de permisos tomada de la matriz del ERS: **A**=Admin, **V**=Veterinario, **R**=Recepcionista, **C**=Cliente.
> Las rutas `/api/empleados` y `/api/clientes` se mantienen como API pública; internamente usan los modelos `Empleado` y `Cliente` de la colección `usuarios`.

### 7.1 NICOLAS

**Core – `feature/core-auth-rbac`** (Fase 1, RF-029, RF-030, RS-001…009)
| Endpoint | Acceso |
|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `POST /api/auth/refresh` | Público / autenticado |
| `GET /api/auth/me` (devuelve el usuario con los campos de su tipo) | Autenticado |
| `GET /api/usuarios?tipoUsuario&rol&activo` (listado unificado) | A |
| `PATCH /api/empleados/:id/roles` (CAMBIO_PERMISOS en bitácora, incrementa `tokenVersion`) | A |
Entregables: schema base `Usuario` + discriminador `Empleado`, `authenticate`, `authorize(...roles)`, `ownOnly(modelo, campo)`, bloqueo tras N intentos, expiración configurable, tests de los 4 roles (incluido un empleado con varios roles).

**Fase 2/3 – Empleados y agenda**
| Rama | Endpoints | Acceso (matriz) |
|---|---|---|
| `feature/rf-014-sedes-catalogo` | CRUD `/api/sedes` | A (CLEM); V/R/C lectura |
| `feature/rf-011-servicios` | CRUD `/api/servicios` | A (CLEM); V/R lectura |
| `feature/rf-001-empleados` | CRUD `/api/empleados` (filtro `?rol=VETERINARIO`), `PATCH /:id/inactivar`, asignación de roles/especialidades/servicios (RF-003) | A: CLEM · R: L |
| `feature/rf-002-004-horarios-disponibilidad` | `/api/empleados/:id/horarios`, `/api/empleados/:id/no-disponibilidades`, `GET /api/empleados/:id/agenda?desde&hasta` (RF-004), `GET /api/disponibilidad` | A, R: CLEM · V: L (solo la propia) |

**Fase 4:** `GET /api/reportes/desempeno` (A: todos, V: propio, R: L) y `utils/exportador.js` (PDF/CSV) que usarán los tres.

### 7.2 FELIPE

**Core – `feature/core-usuario-cliente` y `feature/core-auditoria-errores`** (Fase 1, RF-028, RS-007, RNF-007)
Discriminador `Cliente` sobre el schema base. `GET /api/auditoria?tipoEvento&desde&hasta&usuario&tipoUsuario` (solo A, lectura).

**Fase 2/3 – Clientes, mascotas, citas**
| Rama | Endpoints | Acceso |
|---|---|---|
| `feature/rf-005-clientes` | CRUD `/api/clientes`, `POST /api/clientes/:id/invitacion` (habilita acceso del cliente) | A, R: CLEM · V: L · C: L propio |
| `feature/rf-006-mascotas` | CRUD `/api/clientes/:id/mascotas`, `GET /api/mascotas/:id` | A, R: CLEM · V: L · C: L propias |
| `feature/rf-007-009-012-citas` | `POST/GET/PUT /api/citas`, `PATCH /api/citas/:id/cancelar` | A, R: CLEM · V: L propias · C: L propias |
| `feature/rf-010-asistencia-resultado` | `POST /api/citas/:id/asistencia`, `GET /api/mascotas/:id/historial` | A, V, R: CLEM · C: historial propio |

Reglas clave a implementar en `service`: RB-003, RB-004 (vía `disponibilidadService`), RB-005, RB-012 (≥ 2 días), RB-018 (cancelar/reprogramar ≥ 24 h), historial de cambios en cada modificación (RF-008), motivo obligatorio al cancelar (RF-009), recordatorios (RF-013, respetando `preferenciasRecordatorio` del cliente), validación de que `cliente` y `empleado` referencian usuarios del tipo correcto.

**Fase 4:** `GET /api/reportes/citas` y `/ocupacion` (A, R: CLEM · V: L propios).

### 7.3 CAROL

**Core – `feature/core-setup-config` y `feature/rf-023-parametros-inventario`**
`GET/PUT /api/inventario/parametros` (A). Seeds: admin (Empleado con `roles: ['ADMINISTRADOR']`), un veterinario y una recepcionista de prueba, un cliente de prueba, sede principal, servicios base, parámetro GLOBAL.

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
- [ ] Usuarios creados siempre con `Empleado` o `Cliente`, nunca con el modelo base `Usuario`.
- [ ] Referencias a personas (`ref: 'Usuario'`) validadas en el `service` por `tipoUsuario` y rol.
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
9. **Modelo de datos de Usuario:** el modelo conceptual (10.2) separa Cliente y Empleado; este plan los unifica en `Usuario` con discriminadores. Actualizar el ERS para reflejar la entidad única y los campos por tipo.
10. **"Empleado" no es un rol del ERS:** en este plan `EMPLEADO` es un **tipo de usuario**; los roles de autorización siguen siendo los 4 del ERS (Administrador, Veterinario, Recepcionista, Cliente). Si el negocio necesita un rol genérico de empleado (ej. el "auxiliar" de RU-012), basta con agregarlo a `ROLES_EMPLEADO` y a la matriz.
11. **Persona con doble condición:** un empleado que también es dueño de mascotas necesita dos cuentas (correos distintos). Si el negocio prefiere una sola cuenta, habría que permitir que un Empleado tenga mascotas; decidirlo antes de Fase 2.

**Funcionalidades técnicas no mencionadas**
- **Registro y recuperación de contraseña** (reset por correo), cambio de contraseña, y cómo se crea el usuario del Cliente. Con el modelo unificado se propone: la recepcionista registra al cliente sin contraseña (`passwordHash` vacío) y el sistema le envía una invitación para activar su cuenta; queda por confirmar si habrá auto-registro.
- **Refresh tokens** (cookie httpOnly) y revocación al inactivar usuarios o cambiar roles (campo `tokenVersion`).
- **Zona horaria:** guardar fechas en UTC y mostrar en `America/Bogota` (o la de la sede); la lógica de RB-012/018 y horarios depende de esto. Considerar **festivos**.
- **Borrado lógico** (`activo`) en vez de eliminar, paginación y ordenamiento en todos los listados.
- **Transacciones de MongoDB** requieren replica set (usar Atlas o `--replSet` en local/Docker).
- **Seguridad HTTP:** `helmet`, `cors` restringido, `express-rate-limit`, sanitización (`express-mongo-sanitize`), HTTPS en despliegue.
- **Documentación:** OpenAPI/Swagger generado desde los validators (documentar el esquema `Usuario` con `oneOf` Empleado/Cliente).
- **DevOps:** Docker Compose (api + mongo), GitHub Actions (lint + tests en cada PR), variables de entorno por ambiente, backup programado (`mongodump`, RNF-009).
- **Proveedor de recordatorios:** RF-013 necesita servicio de correo/SMS (Nodemailer + SendGrid/Twilio); abstraerlo para poder simular en desarrollo.
- **Habeas Data:** consentimiento registrado (campo incluido en el discriminador Cliente con fecha y versión de la política), política de retención y exportación/eliminación de datos del cliente.
- **Estrategia de pruebas de carga** para RNF-002/003 (k6 o Artillery) y datos semilla realistas.
- **Preparación para hospitalización/ventas:** `inventarioService.registrarMovimiento` ya queda como API interna reutilizable.

---

## 10. Checklist de arranque (primer día)
1. Carol: crea repo, `develop`, estructura de carpetas (incluida `models/usuario/`), `constants/roles.js` con `TIPOS_USUARIO` y `ROLES_EMPLEADO`, `.env.example`.
2. Los tres: copian sus schemas de la sección 5 a `models/` en su rama core (Nicolas: `Usuario.js` y `Empleado.js`; Felipe: `Cliente.js` y `Bitacora`; Carol: `ParametroInventario`).
3. Reunión de 30 min para validar los contratos de la sección 6 y el modelo unificado de Usuario (sección 5.1).
4. Nicolas prioriza el schema base `Usuario` y `authenticate/authorize` (desbloquea a los demás); Felipe el discriminador `Cliente` y `auditService`; Carol `validate` + seeds.
5. Daily corto de 10 min y demo de cierre de cada fase.

---

# PARTE B – GUÍA OPERATIVA

## 11. Roles y responsabilidades dentro del equipo

### 11.1 Qué significa ser "dueño" de un módulo
Cuando la guía dice que un módulo es tuyo (ej. Citas es de Felipe), significa que tú:
- **Decides la implementación interna** (cómo escribes el `service`, qué funciones auxiliares creas), siempre respetando el schema (sección 5), los contratos (sección 6) y los permisos (sección 7).
- **Respondes por sus errores**: si alguien encuentra un bug en tu módulo, abre un issue y te lo asigna; tú lo corriges.
- **Mantienes su documentación**: las peticiones en la colección Postman y la descripción en el PR.
- **Avisas antes de cambiar algo que otros usan** (un contrato, un campo de respuesta, una ruta).

### 11.2 Proveedores y consumidores de contratos
Algunos módulos **proveen** funciones que otros **consumen**. El proveedor tiene una responsabilidad extra: los demás no pueden avanzar sin su trabajo.

| Proveedor | Provee | Consumidores | Fecha límite de la versión "esqueleto" |
|---|---|---|---|
| Carol | Repo, `app.js`, `validate`, `asyncHandler`, `AppError`, helpers de pruebas, seeds | Todos | Fase 0, día 2 |
| Nicolas | `authenticate`, `authorize`, `ownOnly`, modelos `Usuario`/`Empleado`, `tokenDe()` para pruebas | Todos | Semana 1, día 2 (esqueleto) · día 5 (real) |
| Felipe | `audit()`, `auditService.log()`, `errorHandler`, modelo `Cliente` | Todos | Semana 1, día 2 (esqueleto) · día 5 (real) |
| Nicolas | `disponibilidadService.estaDisponible()` | Felipe (Citas) | Semana 3, día 1 (stub) · semana 3, día 5 (real) |
| Nicolas | `utils/exportador.js` | Felipe y Carol (reportes) | Semana 5, día 2 |
| Carol | `inventarioService.registrarMovimiento()` | Futuro (hospitalización/ventas) | Semana 3 |

**Regla "contrato primero, implementación después":** el proveedor publica primero un PR pequeño con la **firma** de la función o middleware (aunque por dentro solo haga `next()` o devuelva un valor fijo). Así los consumidores pueden importar y escribir su código desde el día 2. Luego el proveedor reemplaza el interior sin cambiar la firma. Ver sección 17.

**Si eres consumidor y el contrato no te sirve** (ej. le falta un parámetro): no lo modifiques tú. Escribe en el canal: "Necesito que `estaDisponible` acepte `excluirCitaId` para reprogramar citas. ¿Lo agregas tú o lo agrego yo en mi rama?". El dueño decide, y se actualiza la sección 6 de la guía.

### 11.3 Propiedad de archivos
No edites archivos de otra persona sin avisar. Si necesitas un cambio, pídelo o propónlo en un PR donde el dueño sea revisor.

| Archivos | Dueño |
|---|---|
| `config/*`, `app.js`, `server.js`, `constants/*`, `middlewares/validate.js`, `utils/*` (excepto `exportador.js`), `tests/setup/*`, `tests/helpers/*`, `scripts/seed.js`, `.github/*`, `package.json` (estructura) | Carol |
| `models/usuario/Usuario.js`, `models/usuario/Empleado.js`, `models/Sede.js`, `models/Servicio.js`, `models/HorarioLaboral.js`, `models/NoDisponibilidad.js`, `middlewares/authenticate.js`, `authorize.js`, `ownOnly.js`, `services/disponibilidadService.js`, `services/tokenService.js`, `utils/exportador.js`, `modules/auth`, `usuarios`, `sedes`, `servicios`, `empleados`, `horarios`, `reportes/desempeno*` | Nicolas |
| `models/usuario/Cliente.js`, `models/Mascota.js`, `models/Cita.js`, `models/Asistencia.js`, `models/Bitacora.js`, `middlewares/audit.js`, `middlewares/errorHandler.js`, `services/auditService.js`, `services/notificacionService.js`, `jobs/recordatorios.js`, `modules/clientes`, `mascotas`, `citas`, `auditoria`, `portal`, `reportes/citas*` | Felipe |
| `models/ParametroInventario.js`, `Producto.js`, `MovimientoInsumo.js`, `AlertaStock.js`, `services/inventarioService.js`, `services/alertasService.js`, `jobs/alertasInventario.js`, `modules/inventario`, `productos`, `movimientos`, `alertas`, `reportes/insumos*` | Carol |
| `package.json` (dependencias) | Cada uno agrega las que necesita en su rama y lo menciona en el PR |

Carol configura este reparto en `.github/CODEOWNERS` para que GitHub pida automáticamente la revisión del dueño cuando alguien toca sus archivos.

### 11.4 Responsabilidades rotativas
| Responsabilidad | Quién | Qué hace |
|---|---|---|
| **Revisor de PR** | Rotación fija: Nicolas → revisa a Felipe, Felipe → a Carol, Carol → a Nicolas | Revisa en máximo **24 horas hábiles** (sección 13, paso 10). |
| **Facilitador de la daily** | Rota cada semana (S1 Carol, S2 Nicolas, S3 Felipe, …) | Abre la reunión, cuida los 10 minutos y anota bloqueos en el canal. |
| **Guardián de `develop`** | Carol | Si `develop` deja de levantar o los tests fallan después de un merge, avisa y coordina quién lo arregla. Arreglar `develop` tiene prioridad sobre todo lo demás. |
| **Responsable de la demo de fase** | El dueño de cada módulo muestra lo suyo | 5 minutos por persona, en Postman, con un caso feliz y un error. |

### 11.5 Ceremonias del equipo
| Ceremonia | Cuándo | Duración | Qué se lleva |
|---|---|---|---|
| Planeación del sprint | Lunes, inicio del día | 30 min | Cada uno mueve sus tareas de la semana a "Por hacer" en el tablero (según sección 16). |
| Daily | Todos los días, misma hora | 10 min | Formato de la plantilla 18.3. Los problemas largos se resuelven después, solo con los involucrados. |
| Demo + retro | Viernes, final del día | 45 min | Demo de lo terminado (30 min) y retro: qué funcionó, qué no, qué cambiamos (15 min). |

---

## 12. Entorno de trabajo y herramientas

### 12.1 Qué instalar (cada uno, antes del día 1)
| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 20 LTS (o 22 LTS) | Ejecutar el backend. Verifica con `node -v`. |
| Git | 2.40+ | Control de versiones. Configura `git config --global user.name "Tu Nombre"` y `user.email`. |
| Docker Desktop | Reciente | Levantar MongoDB local en modo replica set (necesario para transacciones). Alternativa: cuenta gratuita de MongoDB Atlas. |
| MongoDB Compass | Reciente | Ver los datos de la base de forma visual. |
| VS Code | Reciente | Editor. Extensiones: ESLint, Prettier, GitLens, MongoDB for VS Code, Thunder Client (o Postman de escritorio). |
| Postman | Reciente | Probar endpoints y compartir la colección del equipo. |

### 12.2 Dependencias del proyecto
Carol instala las comunes en la Fase 0. Si necesitas otra, instálala en tu rama (`npm install paquete`) y explícala en el PR.

| Tipo | Paquetes | Quién la usa |
|---|---|---|
| Base | `express`, `mongoose`, `dotenv`, `zod`, `cors`, `cookie-parser` | Todos |
| Seguridad | `bcrypt`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `express-mongo-sanitize` | Nicolas (auth) · Fase 5 todos |
| Logs | `pino`, `pino-http` (o `winston`) | Felipe |
| Jobs y notificaciones | `node-cron`, `nodemailer` | Felipe y Carol |
| Exportación | `pdfkit`, `csv-stringify` | Nicolas |
| Fechas | `date-fns`, `date-fns-tz` | Nicolas y Felipe (zona horaria) |
| Desarrollo | `nodemon`, `jest`, `supertest`, `mongodb-memory-server`, `eslint`, `prettier`, `cross-env` | Todos |

### 12.3 Scripts de `package.json` (los crea Carol)
| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la API con recarga automática (nodemon). |
| `npm start` | Levanta la API sin recarga (producción). |
| `npm test` | Ejecuta todas las pruebas (Jest con soporte ESM). |
| `npm run test:watch` | Ejecuta las pruebas cada vez que guardas. |
| `npm run lint` / `npm run lint:fix` | Revisa / corrige estilo de código. |
| `npm run seed` | Carga los datos iniciales (admin, sede, servicios, parámetro GLOBAL, usuarios de prueba). |

### 12.4 Variables de entorno (`.env.example`)
```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/zoolomascotas?replicaSet=rs0
JWT_ACCESS_SECRET=cambia-esto
JWT_REFRESH_SECRET=cambia-esto-tambien
JWT_ACCESS_EXPIRES=15m
SESION_INACTIVIDAD_MIN=30
MAX_INTENTOS_LOGIN=5
BLOQUEO_MINUTOS=15
CORS_ORIGIN=http://localhost:5173
TZ_NEGOCIO=America/Bogota
MAIL_PROVIDER=console
```
Cada uno copia el archivo a `.env` (`cp .env.example .env`) y pone sus valores. **El archivo `.env` nunca se sube al repositorio.**

### 12.5 Tu entorno está listo si…
- [ ] `npm run dev` muestra "Servidor escuchando en puerto 4000" y "MongoDB conectado".
- [ ] `GET http://localhost:4000/api/health` responde `{ ok: true }`.
- [ ] `npm test` pasa (al inicio hay una sola prueba de humo).
- [ ] `npm run lint` no muestra errores.
- [ ] Ves la base `zoolomascotas` en Compass después de `npm run seed`.

---

## 13. Flujo de trabajo diario: el ciclo de una tarea

Este es el ciclo que repites con **cada** tarea de la sección 15. Síguelo en orden.

### Paso 1 – Elige la tarea en el tablero
El tablero (GitHub Projects) tiene las columnas: **Backlog → Por hacer → En progreso → En revisión → Hecho**.
- Toma la siguiente tarea tuya según el calendario (sección 16) y muévela a **En progreso**.
- Máximo **2 tareas** tuyas en "En progreso" al mismo tiempo. Si tienes una esperando revisión, puedes empezar otra.

### Paso 2 – Actualiza tu copia de `develop`
```bash
git checkout develop
git pull origin develop
npm install            # por si alguien agregó dependencias
```

### Paso 3 – Crea tu rama
Usa exactamente el nombre que dice la ficha de la tarea:
```bash
git checkout -b feature/rf-014-sedes-catalogo
```

### Paso 4 – Entiende la tarea antes de escribir código (15–30 min)
1. Lee la ficha completa de la tarea (sección 15).
2. Busca en el ERS cada RF y RB que menciona la ficha y léelos.
3. Revisa en la sección 5 el schema que vas a usar y en la sección 3 del ERS la fila de permisos.
4. Escribe en un papel o en la descripción de la tarjeta: qué endpoints harás, quién puede usarlos, qué errores pueden ocurrir.
5. Si algo no está claro después de esto, pregunta **ahora**, no a mitad de la tarea.

### Paso 5 – Construye en este orden (siempre el mismo)
1. **Modelo** (si no existe): copia el schema de la sección 5, sin cambiarlo.
2. **`validators.js`**: qué datos acepta cada endpoint.
3. **`service.js`**: la lógica de negocio y las reglas RB. Aquí van las consultas a la base.
4. **`controller.js`**: recibe la petición, llama al service y responde. Sin lógica de negocio.
5. **`routes.js`**: une ruta + `authenticate` + `authorize` + `validate` + `audit` + controller.
6. **Registra la ruta** en `app.js`.
7. **Pruebas** en `tests/` (caso feliz, 403 por rol, regla de negocio).
8. **Postman**: agrega las peticiones a la colección compartida.

La sección 14 tiene un ejemplo completo de cada archivo.

### Paso 6 – Haz commits pequeños y frecuentes
Un commit = un cambio con sentido propio. Haz commit cada vez que algo funciona.
```bash
git add src/modules/sedes/validators.js
git commit -m "feat(rf-014): validadores de creación y edición de sedes"
```
Tipos de commit:
| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `feat` | Funcionalidad nueva | `feat(rf-007): crear cita con validación de solapamiento` |
| `fix` | Corrección de un error | `fix(rf-016): impedir salida mayor al stock` |
| `test` | Solo pruebas | `test(rf-001): 403 para recepcionista al crear empleado` |
| `refactor` | Cambiar código sin cambiar comportamiento | `refactor(rf-005): extraer búsqueda de cliente a función` |
| `docs` | Documentación o Postman | `docs(rf-014): agregar sedes a la colección Postman` |
| `chore` | Configuración, dependencias | `chore: agregar pdfkit` |

### Paso 7 – Mantén tu rama al día con `develop` (al menos una vez al día)
```bash
git fetch origin
git merge origin/develop
```
Si aparecen **conflictos**:
1. VS Code marca los archivos en conflicto. Ábrelos: verás bloques `<<<<<<<`, `=======`, `>>>>>>>`.
2. Decide qué código queda (a veces ambos). Borra las marcas.
3. Si el conflicto es en un archivo que **no es tuyo**, llama al dueño antes de decidir.
4. `git add archivo` y `git commit` para cerrar el merge.
5. Ejecuta `npm test` para confirmar que nada se rompió.

> Usamos `merge` y no `rebase` para evitar reescribir historia. Si ya dominas `rebase`, úsalo solo en tu rama y nunca en una rama compartida.

### Paso 8 – Verificación local antes del PR
```bash
npm run lint
npm test
npm run dev    # y prueba tus endpoints en Postman con los 4 roles
```
Repasa la Definition of Done (sección 8) punto por punto.

### Paso 9 – Sube la rama y abre el Pull Request
```bash
git push -u origin feature/rf-014-sedes-catalogo
```
En GitHub: **Compare & pull request** → base `develop` → completa la plantilla (sección 18.1) → asigna al revisor de la rotación → mueve la tarjeta a **En revisión** → avisa en el canal con el enlace.

**Tamaño ideal de un PR:** menos de 400 líneas cambiadas. Si tu tarea es más grande, divídela (ej. primero el CRUD, después los filtros).

### Paso 10 – La revisión de código
**Si eres el autor:**
- Responde cada comentario: corrígelo y escribe "Hecho en `abc123`", o explica por qué no.
- No tomes los comentarios como algo personal: se revisa el código, no a la persona.
- Cuando termines, pide nueva revisión con el botón "Re-request review".

**Si eres el revisor (máximo 24 h hábiles):**
1. Descarga la rama y pruébala: `git fetch && git checkout feature/...` → `npm install` → `npm test` → prueba en Postman.
2. Revisa con esta lista: ¿cumple la DoD? ¿los permisos coinciden con la matriz del ERS? ¿las reglas RB están implementadas y probadas? ¿hay datos sensibles en la respuesta (`passwordHash`)? ¿los errores usan `AppError`? ¿el código se entiende?
3. Usa tres tipos de comentario: **"Bloqueante:"** (hay que cambiarlo), **"Sugerencia:"** (opcional), **"Pregunta:"** (quiero entender).
4. Aprueba solo cuando no haya bloqueantes.

### Paso 11 – Merge y cierre
- Con la aprobación, **el autor** hace **Squash and merge** y borra la rama en GitHub.
- Localmente: `git checkout develop && git pull && git branch -d feature/...`
- Mueve la tarjeta a **Hecho**.
- Si tu tarea desbloquea a alguien (lo dice la ficha), avísale en el canal: "Ya está en develop `authorize()`; pueden quitar el stub".

### Paso 12 – Qué hacer cuando te bloqueas
| Tiempo atascado | Qué haces |
|---|---|
| 0–30 min | Lee el mensaje de error completo, busca en esta guía (sección 19 de errores comunes), revisa la documentación oficial (Mongoose, Express, Zod). |
| 30 min | Escribe en el canal con la plantilla 18.2 (qué intentas, qué pasa, qué probaste). |
| 2 horas sin respuesta o sin avance | Pasa a otra tarea tuya que no dependa de esto y dilo en la daily. |
| Te bloquea una dependencia de otro | Usa el stub de la sección 17 y sigue trabajando. |

---

## 14. Anatomía de un módulo: ejemplo completo de punta a punta

Este ejemplo construye el módulo **Sedes** (RF-014). Es de Nicolas, pero **todos** deben copiar esta estructura para sus módulos. Primero están los utilitarios comunes que crea Carol en la Fase 1.

### 14.1 Utilitarios comunes (Carol, Fase 1)

**`utils/appError.js`** – el único tipo de error que lanzan los services:
```js
export default class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;   // código HTTP: 400, 401, 403, 404, 409, 423...
    this.code = code;       // código legible: 'SEDE_DUPLICADA', 'STOCK_INSUFICIENTE'...
    this.details = details; // opcional: detalle de validación
  }
}
```

**`utils/asyncHandler.js`** – envuelve controllers async para que sus errores lleguen al `errorHandler`:
```js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

**`utils/validaciones.js`** – piezas de Zod que se repiten:
```js
import { z } from 'zod';
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Id inválido');
export const paginacion = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
```

**`middlewares/validate.js`** – valida `body`, `params` y `query` y deja el resultado limpio en `req.validated`:
```js
import AppError from '../utils/appError.js';

export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!r.success) {
    return next(new AppError(400, 'VALIDACION', 'Datos inválidos', r.error.flatten()));
  }
  req.validated = r.data;   // usa SIEMPRE req.validated.body / .params / .query
  next();
};
```

**Formato de respuestas (obligatorio para todos):**
```js
// Éxito con un elemento
res.status(200).json({ ok: true, data: elemento });
// Éxito con listado paginado
res.status(200).json({ ok: true, data: lista, meta: { page, limit, total } });
// Error (lo arma errorHandler, tú solo lanzas AppError)
{ ok: false, code: 'SEDE_DUPLICADA', message: 'Ya existe una sede con ese nombre' }
```

**Códigos HTTP que usamos:**
| Código | Cuándo |
|---|---|
| 200 | Consulta o modificación exitosa |
| 201 | Creación exitosa |
| 400 | Datos inválidos (validación) |
| 401 | No autenticado o token inválido/expirado |
| 403 | Autenticado pero sin permiso (rol) o recurso ajeno (cliente) |
| 404 | No existe |
| 409 | Conflicto con una regla: duplicado, solapamiento de cita, stock insuficiente |
| 422 | Regla de negocio no cumplida que no es conflicto (ej. reservar con menos de 2 días) |
| 423 | Cuenta bloqueada |
| 500 | Error inesperado (nunca lo lances a propósito) |

### 14.2 `modules/sedes/validators.js`
```js
import { z } from 'zod';
import { objectId, paginacion } from '../../utils/validaciones.js';

const camposSede = {
  nombre: z.string().trim().min(1).max(80),
  direccion: z.string().trim().min(1),
  telefono: z.string().trim().optional(),
};

export const crear = z.object({ body: z.object(camposSede) });
export const actualizar = z.object({
  params: z.object({ id: objectId }),
  body: z.object(camposSede).partial().refine((b) => Object.keys(b).length > 0, 'Nada que actualizar'),
});
export const porId = z.object({ params: z.object({ id: objectId }) });
export const listar = z.object({
  query: z.object({ ...paginacion, activa: z.enum(['true', 'false']).optional() }),
});
```

### 14.3 `modules/sedes/service.js`
```js
import Sede from '../../models/Sede.js';
import AppError from '../../utils/appError.js';

const noEncontrada = () => new AppError(404, 'SEDE_NO_ENCONTRADA', 'Sede no encontrada');

export async function crear(datos) {
  try {
    return await Sede.create(datos);
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'SEDE_DUPLICADA', 'Ya existe una sede con ese nombre');
    throw e;
  }
}

export async function listar({ page, limit, activa }) {
  const filtro = {};
  if (activa) filtro.activa = activa === 'true';
  const [data, total] = await Promise.all([
    Sede.find(filtro).sort({ nombre: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Sede.countDocuments(filtro),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function obtener(id) {
  const sede = await Sede.findById(id).lean();
  if (!sede) throw noEncontrada();
  return sede;
}

export async function actualizar(id, cambios) {
  const sede = await Sede.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
  if (!sede) throw noEncontrada();
  return sede;
}

export const inactivar = (id) => actualizar(id, { activa: false });  // borrado lógico, nunca delete
```

### 14.4 `modules/sedes/controller.js`
```js
import * as service from './service.js';

export async function crear(req, res) {
  const sede = await service.crear(req.validated.body);
  res.locals.entidadId = sede._id;            // lo usa audit() para la bitácora
  res.status(201).json({ ok: true, data: sede });
}
export async function listar(req, res) {
  const { data, meta } = await service.listar(req.validated.query);
  res.json({ ok: true, data, meta });
}
export async function obtener(req, res) {
  res.json({ ok: true, data: await service.obtener(req.validated.params.id) });
}
export async function actualizar(req, res) {
  const sede = await service.actualizar(req.validated.params.id, req.validated.body);
  res.locals.entidadId = sede._id;
  res.json({ ok: true, data: sede });
}
export async function inactivar(req, res) {
  const sede = await service.inactivar(req.validated.params.id);
  res.locals.entidadId = sede._id;
  res.json({ ok: true, data: sede });
}
```

### 14.5 `modules/sedes/routes.js`
```js
import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { audit } from '../../middlewares/audit.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ROLES } from '../../constants/roles.js';
import * as v from './validators.js';
import * as ctrl from './controller.js';

const { ADMIN, VETERINARIO, RECEPCIONISTA, CLIENTE } = ROLES;
const router = Router();

router.use(authenticate);   // todas las rutas de sedes exigen sesión

router.get('/', authorize(ADMIN, VETERINARIO, RECEPCIONISTA, CLIENTE),
  validate(v.listar), asyncHandler(ctrl.listar));
router.get('/:id', authorize(ADMIN, VETERINARIO, RECEPCIONISTA, CLIENTE),
  validate(v.porId), asyncHandler(ctrl.obtener));
router.post('/', authorize(ADMIN),
  validate(v.crear), audit('Sede', 'CREAR'), asyncHandler(ctrl.crear));
router.put('/:id', authorize(ADMIN),
  validate(v.actualizar), audit('Sede', 'MODIFICAR'), asyncHandler(ctrl.actualizar));
router.patch('/:id/inactivar', authorize(ADMIN),
  validate(v.porId), audit('Sede', 'INACTIVAR'), asyncHandler(ctrl.inactivar));

export default router;
```
> **Orden de middlewares (siempre igual):** `authenticate` → `authorize` → `ownOnly` (si aplica) → `validate` → `audit` → `asyncHandler(controller)`.

### 14.6 Registro en `app.js`
```js
import sedesRoutes from './modules/sedes/routes.js';
// ...
app.use('/api/sedes', sedesRoutes);
// ... todas las rutas antes de esta línea:
app.use(errorHandler);   // SIEMPRE el último
```

### 14.7 `tests/sedes.test.js`
```js
import request from 'supertest';
import app from '../src/app.js';
import { tokenDe } from './helpers/auth.js';

describe('RF-014 Sedes', () => {
  it('ADMIN crea una sede (201)', async () => {
    const token = await tokenDe('ADMINISTRADOR');
    const res = await request(app).post('/api/sedes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Sede Norte', direccion: 'Calle 1 # 2-3' });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.nombre).toBe('Sede Norte');
  });

  it('RECEPCIONISTA no puede crear (403)', async () => {
    const token = await tokenDe('RECEPCIONISTA');
    const res = await request(app).post('/api/sedes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Sede Sur', direccion: 'Calle 9' });
    expect(res.status).toBe(403);
  });

  it('nombre duplicado (409)', async () => {
    const token = await tokenDe('ADMINISTRADOR');
    const body = { nombre: 'Sede Centro', direccion: 'Calle 5' };
    await request(app).post('/api/sedes').set('Authorization', `Bearer ${token}`).send(body);
    const res = await request(app).post('/api/sedes').set('Authorization', `Bearer ${token}`).send(body);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('SEDE_DUPLICADA');
  });

  it('sin token (401)', async () => {
    const res = await request(app).get('/api/sedes');
    expect(res.status).toBe(401);
  });
});
```
> `tokenDe(rol)` crea un usuario de prueba con ese rol y devuelve un token válido. Lo construyen Carol (archivo y configuración) y Nicolas (generación real del token). La base de pruebas se limpia entre cada archivo de test con `mongodb-memory-server`.

### 14.8 Postman
En la colección compartida, crea una carpeta por módulo (`Sedes`) con una petición por endpoint. Usa la variable `{{baseUrl}}` y `{{tokenAdmin}}`, `{{tokenRecep}}`, `{{tokenVet}}`, `{{tokenCliente}}` (las llena la petición de login de cada rol). Agrega un ejemplo de respuesta exitosa y uno de error.

---

## 15. Guía detallada por desarrollador

**Cómo leer cada ficha:**
- **Objetivo:** qué debe existir al terminar.
- **Rama / Estimado:** nombre exacto de la rama y días de trabajo esperados.
- **Depende de / Desbloquea:** qué necesitas de otros y a quién le sirve tu trabajo.
- **Archivos:** qué creas o modificas.
- **Pasos:** en orden. Cada paso es pequeño y verificable.
- **Criterios de aceptación:** cómo sabes que terminaste. Todos deben cumplirse.
- **Pruebas mínimas:** las que deben estar en tu PR.
- **Cuidado con:** errores típicos en esta tarea.

Las tareas de Fase 0 son comunes y se describen al inicio. Después cada desarrollador tiene su bloque.

### 15.0 Fase 0 – Tareas de los tres (Semana 1, días 1 y 2)

**T0.1 – Preparar el entorno (cada uno, día 1)**
1. Instala lo de la sección 12.1.
2. Crea tu cuenta de GitHub (si no tienes) y acepta la invitación al repositorio.
3. Cuando Carol confirme que el repo existe: `git clone <url>` → `cd backend` → `npm install` → `cp .env.example .env`.
4. Levanta MongoDB: `docker compose up -d mongo` (Carol deja el `docker-compose.yml`).
5. Verifica la lista 12.5.
- **Aceptación:** marcas los 5 puntos de 12.5 y lo confirmas en el canal.

**T0.2 – Lectura y reunión de contratos (los tres, día 1, 1 hora)**
1. Cada uno lee lo indicado en "Cómo usar esta guía".
2. Reunión de 30 min: recorren la sección 6 (contratos) y la sección 5.1 (Usuario). Cada proveedor explica qué entregará y cuándo.
3. Anotan dudas abiertas de la sección 9 y quién las llevará al responsable del negocio (Vladimir Cortés Arévalo, aprobador del ERS).
- **Aceptación:** existe un mensaje fijado en el canal con las decisiones tomadas.

**T0.3 – Tablero (Carol crea, cada uno revisa, día 2)**
- Cada uno revisa que sus tareas de la sección 15 estén como tarjetas en el tablero, con su nombre y la semana.

---

### 15.1 NICOLAS – Autenticación, RBAC, empleados y agenda

**Tu rol en el equipo:** eres el **proveedor de seguridad**. Todos protegen sus rutas con tus middlewares, así que tus entregas de la Semana 1 son las más urgentes del proyecto. Después construyes la parte del negocio que organiza al personal: sedes, servicios, empleados, horarios y la función que dice si un profesional está disponible, que Felipe usa para agendar citas.

**Tus entregas críticas (fechas que no se mueven):**
| Entrega | Para | Fecha |
|---|---|---|
| Esqueleto de `authenticate`, `authorize`, `ownOnly` + modelos `Usuario`/`Empleado` | Todos | S1-D2 |
| Implementación real de auth + `tokenDe()` | Todos | S1-D5 |
| Stub de `estaDisponible` | Felipe | S3-D1 |
| `estaDisponible` real | Felipe | S3-D5 |
| `exportador.js` | Felipe y Carol | S5-D2 |

#### Fase 1 – `feature/core-auth-rbac`

**N1.1 – Esqueleto de seguridad (PR rápido)**
- **Rama:** `feature/core-auth-rbac-esqueleto` · **Estimado:** 0,5 día (S1-D2)
- **Objetivo:** que los demás puedan importar tus middlewares desde el día 2.
- **Archivos:** `models/usuario/Usuario.js`, `Empleado.js`, `index.js`; `middlewares/authenticate.js`, `authorize.js`, `ownOnly.js`.
- **Pasos:**
  1. Copia los schemas de 5.1.a, 5.1.b y 5.1.d sin cambios.
  2. Crea los tres middlewares con su firma real y un interior provisional (ver sección 17.1).
  3. Abre el PR, pide revisión a Carol y avisa en el canal cuando esté en `develop`.
- **Aceptación:** `import { authenticate } from '../../middlewares/authenticate.js'` funciona en cualquier rama creada desde `develop`.

**N1.2 – Modelos Usuario y Empleado con pruebas**
- **Rama:** `feature/core-auth-rbac` · **Estimado:** 0,5 día
- **Pasos:**
  1. Escribe `tests/models/usuario.test.js` con los casos de abajo.
  2. Verifica en Compass que un Empleado creado aparece en la colección `usuarios` con `tipoUsuario: 'EMPLEADO'`.
- **Pruebas mínimas:** crear empleado válido · `Usuario.create()` falla · veterinario sin `tarjetaProfesional` falla · `roles` vacío falla · roles duplicados se limpian · correo duplicado lanza error 11000 · `toJSON()` no incluye `passwordHash` · `rolesEfectivos` devuelve los roles del empleado.

**N1.3 – Servicio de tokens y contraseñas**
- **Estimado:** 0,5 día
- **Archivos:** `services/tokenService.js`, `utils/password.js`
- **Pasos:**
  1. `password.js`: `hashear(texto)` con `bcrypt.hash(texto, 10)` y `comparar(texto, hash)`.
  2. Regla de contraseña segura (RS-001): mínimo 8 caracteres, una mayúscula, una minúscula y un número. Exporta el schema Zod `passwordSegura` para que lo usen Felipe (activación de clientes) y tú (empleados).
  3. `tokenService.js`:
     - `firmarAcceso(usuario)` → JWT con `{ sub: id, tipoUsuario, roles, tv: tokenVersion }`, expira en `JWT_ACCESS_EXPIRES` (15 min).
     - `firmarRefresh(usuario)` → JWT con `{ sub, tv }`, expira en `SESION_INACTIVIDAD_MIN` (RS-006: si el usuario no usa el sistema en ese tiempo, la sesión muere).
     - `verificarAcceso(token)` y `verificarRefresh(token)`.
     - `firmarActivacion(usuario)` → JWT con `{ sub, tv, proposito: 'ACTIVACION' }`, expira en 48 h (lo usa Felipe para invitar clientes).
- **Cuidado con:** usar el mismo secreto para acceso y refresh; poner datos sensibles en el JWT (se puede leer sin la clave).

**N1.4 – Login (`POST /api/auth/login`)**
- **Estimado:** 1 día
- **Pasos (lógica del service, en este orden):**
  1. Busca con `Usuario.findOne({ correo }).select('+passwordHash +intentosFallidos +bloqueadoHasta')`.
  2. Si no existe → `401 CREDENCIALES_INVALIDAS` (mismo mensaje que contraseña incorrecta: no reveles si el correo existe) y registra `ERROR_ACCESO` en bitácora.
  3. Si `bloqueadoHasta > ahora` → `423 CUENTA_BLOQUEADA` con los minutos restantes.
  4. Si `activo === false` → `403 CUENTA_INACTIVA`.
  5. Si no tiene `passwordHash` → `403 CUENTA_NO_ACTIVADA` (cliente que aún no acepta la invitación).
  6. Compara la contraseña. Si falla: incrementa `intentosFallidos`; si llega a `MAX_INTENTOS_LOGIN`, pon `bloqueadoHasta = ahora + BLOQUEO_MINUTOS` y `intentosFallidos = 0` (RS-005). Registra `AUTENTICACION` con resultado `FALLO`. Responde 401.
  7. Si acierta: `intentosFallidos = 0`, `bloqueadoHasta = null`, `ultimoLogin = ahora`, guarda.
  8. Genera ambos tokens. El refresh va en cookie `httpOnly`, `sameSite: 'strict'`, `secure` en producción, `path: '/api/auth'`.
  9. Registra `AUTENTICACION` con resultado `EXITO` (RF-029).
  10. Responde `{ ok: true, data: { accessToken, usuario } }`.
- **Aceptación:** los 4 roles pueden iniciar sesión; al 5.º intento fallido la cuenta se bloquea; todo intento queda en la bitácora.

**N1.5 – `authenticate`, `authorize`, `ownOnly` (versión real)**
- **Estimado:** 1 día
- **`authenticate`:**
  1. Lee `Authorization: Bearer <token>`. Si falta → `401 NO_AUTENTICADO`.
  2. Verifica el token. Si expiró → `401 TOKEN_EXPIRADO`; si es inválido → `401 TOKEN_INVALIDO`.
  3. Carga el usuario (`activo`, `tokenVersion`, `tipoUsuario`, `roles`, `correo`). Si no existe, está inactivo o `tokenVersion` no coincide con `tv` → 401 (así se revocan sesiones al inactivar o cambiar roles).
  4. Deja `req.user = { id, correo, tipoUsuario, roles }` (contrato de la sección 6).
- **`authorize(...roles)`:** si ningún rol de `req.user.roles` está en la lista → `403 SIN_PERMISO` y registra `ERROR_ACCESO`.
- **`ownOnly(Modelo, campo)`:**
  1. Si `req.user.tipoUsuario !== 'CLIENTE'` → `next()` (el personal ya pasó por `authorize`).
  2. Si es cliente: busca `Modelo.findById(req.params.id).select(campo)`. Si no existe → 404. Si `String(doc[campo]) !== req.user.id` → `403 RECURSO_AJENO` (RB-021, RS-009).
  3. Variante: si `Modelo` es `null`, compara `req.params.id` con `req.user.id` directamente (para `/api/clientes/:id`).
- **Pruebas mínimas:** sin token 401 · token expirado 401 · token de usuario inactivado 401 · rol sin permiso 403 · cliente leyendo cita ajena 403 · cliente leyendo cita propia 200 · empleado con dos roles pasa por cualquiera de ellos.

**N1.6 – Refresh, logout y me**
- **Estimado:** 0,5 día
- `POST /api/auth/refresh`: lee la cookie, verifica, comprueba `tokenVersion`, emite nuevo acceso **y** nuevo refresh (rotación).
- `POST /api/auth/logout`: borra la cookie y registra `AUTENTICACION / LOGOUT`.
- `GET /api/auth/me`: devuelve el usuario completo (con los campos de su tipo, sin datos de seguridad).

**N1.7 – Administración de roles y listado de usuarios**
- **Estimado:** 0,5 día
- `PATCH /api/empleados/:id/roles` (solo A): valida que `roles` sea un arreglo no vacío de `ROLES_EMPLEADO`; guarda; incrementa `tokenVersion`; registra `CAMBIO_PERMISOS` con `detalle: { antes, despues }` (RF-029, RS-007).
- **Regla de seguridad:** un administrador no puede quitarse a sí mismo el rol ADMINISTRADOR si es el último administrador activo → `409 ULTIMO_ADMIN`.
- `GET /api/usuarios?tipoUsuario&rol&activo&page&limit` (solo A).

**N1.8 – Helper de pruebas `tokenDe(rol)`**
- **Estimado:** 0,25 día
- En `tests/helpers/auth.js` (archivo creado por Carol): `tokenDe('VETERINARIO')` crea un Empleado (o Cliente si el rol es CLIENTE) con datos aleatorios y devuelve `firmarAcceso(usuario)`. Exporta también `usuarioDe(rol)` que devuelve `{ usuario, token }`.
- **Desbloquea:** las pruebas de todo el equipo. Avisa en cuanto esté en `develop`.

**Hito de Fase 1 (S1-D5):** PR de `feature/core-auth-rbac` en `develop`; demo en Postman: login de los 4 roles, bloqueo por intentos, 403 por rol, refresh.

#### Fase 2

**N2.1 – Sedes (RF-014)** · `feature/rf-014-sedes-catalogo` · 0,5 día
- Sigue exactamente la sección 14 (es el ejemplo de referencia).
- **Aceptación:** CRUD + inactivar; V, R y C pueden listar; solo A crea, modifica e inactiva; las sedes inactivas no aparecen para el cliente.

**N2.2 – Servicios (RF-011, RF-003)** · `feature/rf-011-servicios` · 0,5 día
- Igual a Sedes, con `duracionMin` entre 5 y 720 y `requiereVeterinario`.
- `GET /api/servicios/:id/profesionales?sede=` → empleados activos que prestan ese servicio (en esa sede). Lo usará el formulario de citas.
- **Pruebas:** duración fuera de rango → 400; nombre duplicado → 409.

**N2.3 – Empleados (RF-001, RF-003, RB-001, RU-001)** · `feature/rf-001-empleados` · 2 días
- **Endpoints:** `POST /api/empleados` · `GET /api/empleados?rol&sede&servicio&activo&q&page&limit` · `GET /:id` · `PUT /:id` · `PATCH /:id/inactivar` · `PATCH /:id/activar`.
- **Pasos:**
  1. Validador de creación: datos de identidad y contacto (base), `roles`, `especialidades`, `servicios`, `sedes`, `tarjetaProfesional`, `contactoEmergencia` y `passwordInicial` (usa `passwordSegura`).
  2. En el service, antes de crear: verifica que cada id de `servicios` y `sedes` exista y esté activo → si no, `422 REFERENCIA_INVALIDA`.
  3. Hashea `passwordInicial` y crea con `Empleado.create()`.
  4. Duplicado de correo o documento → `409 EMPLEADO_DUPLICADO` indicando qué campo (RB-001).
  5. El `PUT` **no** acepta `roles` (eso va por N1.7), ni `passwordHash`, ni `tipoUsuario`.
  6. Inactivar: `activo = false` y `tokenVersion + 1` (cierra sus sesiones). Si tiene citas futuras PROGRAMADA/CONFIRMADA, la respuesta incluye `advertencias: { citasFuturas: n }` para que recepción las reasigne.
  7. Búsqueda `q`: por nombres, apellidos, documento o correo (regex sin distinguir mayúsculas, escapando caracteres especiales).
- **Permisos:** A: todo · R: solo `GET`.
- **Pruebas mínimas:** crear (201) · documento duplicado (409) · veterinario sin tarjeta (400) · recepcionista intenta crear (403) · recepcionista lista (200) · inactivar invalida el token del empleado (401 en su siguiente petición).

#### Fase 3

**N3.1 – Horarios laborales (RF-002, RB-005, restricción 2.4)** · `feature/rf-002-004-horarios-disponibilidad` · 1,5 días
- **Endpoints:** `GET/POST /api/empleados/:id/horarios` · `PUT/DELETE /api/empleados/:id/horarios/:horarioId` (el DELETE marca `activo: false`).
- **Validaciones (en `pre('validate')` del schema y en el service):**
  1. `horaFin > horaInicio` (compara como minutos: `h*60 + m`).
  2. Si hay descanso: ambos campos presentes y `horaInicio ≤ descansoInicio < descansoFin ≤ horaFin`.
  3. Jornada efectiva (fin − inicio − descanso) ≤ 12 h.
  4. Suma de jornadas del empleado ese día en **todas** las sedes ≤ 12 h y sin cruces de horas entre sedes.
  5. El empleado es tipo EMPLEADO y activo; la sede está en `empleado.sedes`.
- **Permisos:** A, R: CLEM · V: solo lectura de los suyos (`req.user.id === :id`).

**N3.2 – No disponibilidades (RF-002)** · mismo PR · 0,5 día
- `GET/POST /api/empleados/:id/no-disponibilidades`, `DELETE /:ndId`.
- `fechaFin ≥ fechaInicio`; `creadoPor = req.user.id`.
- Si se cruza con citas activas, crea igual pero devuelve `advertencias.citasAfectadas` con sus ids.

**N3.3 – `disponibilidadService.estaDisponible` (RF-012, RB-004, RB-005)** · 1 día
- **Firma (sección 6):** `estaDisponible(empleadoId, sedeId, fechaInicio, fechaFin, opciones = {})` → `{ disponible, motivo? }`. El cuarto parámetro opcional `opciones.excluirCitaId` lo necesita Felipe al reprogramar; acuérdenlo en la reunión y anótenlo en la sección 6.
- **Algoritmo:**
  1. Convierte `fechaInicio` y `fechaFin` a la zona `TZ_NEGOCIO` con `date-fns-tz` y obtén el día de la semana y las horas "HH:MM" locales.
  2. Si inicio y fin caen en días distintos → `{ disponible: false, motivo: 'FUERA_DE_HORARIO' }`.
  3. Busca el `HorarioLaboral` activo de ese empleado, sede y día. Si no hay → `SIN_HORARIO`.
  4. Si `[inicio, fin]` no está dentro de `[horaInicio, horaFin]` → `FUERA_DE_HORARIO`.
  5. Si se cruza con el descanso → `EN_DESCANSO`.
  6. Si existe una `NoDisponibilidad` con `fechaInicio < fin` y `fechaFin > inicio` → `NO_DISPONIBLE` (+ tipo).
  7. Si existe una `Cita` del empleado con estado en `['PROGRAMADA', 'CONFIRMADA']`, `fechaInicio < fin` y `fechaFin > inicio` (excluyendo `excluirCitaId`) → `SOLAPAMIENTO`. *Nota: la sección 6 dice "CONFIRMADAS"; se recomienda incluir PROGRAMADA para evitar dobles reservas. Confírmenlo en la reunión de contratos.*
  8. Si pasa todo → `{ disponible: true }`.
- **Fórmula de solapamiento** (úsala siempre): dos rangos A y B se cruzan si `A.inicio < B.fin && A.fin > B.inicio`.
- **Pruebas unitarias (una por motivo):** sin horario · fuera de horario · en descanso · vacaciones · solapamiento · cita exactamente a continuación de otra (debe estar disponible) · excluirCitaId.

**N3.4 – Agenda y disponibilidad (RF-004, RU-005, RU-006)** · 1 día
- `GET /api/empleados/:id/agenda?desde&hasta` → citas del rango (máximo 31 días) con mascota, cliente (nombre y teléfono), servicio y estado, ordenadas por fecha. V solo la propia.
- `GET /api/disponibilidad?servicio&sede&fecha` → para cada profesional que presta el servicio en esa sede, los bloques libres del día de tamaño `duracionMin` (cada 15 minutos), usando la misma lógica de N3.3.
- **Aceptación:** la recepcionista ve la agenda semanal de cualquier profesional; el veterinario recibe 403 si consulta la de otro.

#### Fase 4

**N4.1 – Exportador PDF/CSV (RF-027)** · `feature/rf-027-exportacion-pdf-csv` · 1 día · **entrega S5-D2**
- **Firma:** `exportar(res, { formato: 'pdf' | 'csv', titulo, columnas: [{ clave, titulo }], filas, filtros })`.
- CSV con `csv-stringify`, separador `;` y BOM UTF-8 (para que Excel muestre bien las tildes). PDF con `pdfkit`: título, fecha de generación, filtros aplicados, tabla y número de página.
- Encabezado `Content-Disposition: attachment; filename="<titulo>-<fecha>.<ext>"`.
- **Uso por los demás:** cualquier endpoint de reporte acepta `?formato=pdf|csv`; sin `formato` responde JSON.

**N4.2 – Reporte de desempeño (RF-025)** · `feature/rf-025-reporte-desempeno` · 1,5 días
- `GET /api/reportes/desempeno?desde&hasta&empleado&sede&formato`.
- Por empleado: total de citas, atendidas, no asistió, canceladas, % de asistencia, horas atendidas y servicios más frecuentes. Usa una agregación (`$match` → `$group` → `$lookup` a usuarios).
- **Permisos:** A: todos · R: todos (lectura) · V: solo el propio (fuerza `empleado = req.user.id`).

**N4.3 – Portal del cliente: activación de cuenta (RF-030)** · `feature/rf-030-portal-cliente` (con Felipe) · 0,5 día
- `POST /api/auth/activar-cuenta` con `{ token, password }`: verifica el token de activación (`proposito`, `tv`), guarda el hash, incrementa `tokenVersion` (invalida el enlace) y registra `AUTENTICACION / ACTIVACION`.
- `POST /api/auth/cambiar-password` (autenticado): pide contraseña actual y nueva.

#### Fase 5
- **N5.1** Revisar el código de Felipe (rotación) con la lista del paso 13.10.
- **N5.2** Seguridad HTTP en `app.js` (coordinado con Carol): `helmet`, `cors` con `CORS_ORIGIN`, `express-rate-limit` (100 peticiones/15 min general, 10/15 min en `/api/auth/login`), `express-mongo-sanitize`.
- **N5.3** Documentación Swagger de tus módulos.
- **N5.4** Prueba de carga de login y agenda con k6 (RNF-002: p95 ≤ 2 s con 30 usuarios, RNF-003).

---

### 15.2 FELIPE – Clientes, mascotas, citas y auditoría

**Tu rol en el equipo:** eres el **proveedor de trazabilidad y manejo de errores**: todos registran eventos con tu `audit()` y todos los errores pasan por tu `errorHandler`. Después construyes el corazón operativo de la clínica: clientes, mascotas y el ciclo de vida de una cita. Eres el principal **consumidor** del trabajo de Nicolas (auth y disponibilidad), así que debes coordinarte mucho con él.

**Tus entregas críticas:**
| Entrega | Para | Fecha |
|---|---|---|
| Esqueleto de `audit()`, `auditService.log()` y `errorHandler` | Todos | S1-D2 |
| Versión real de auditoría y errores | Todos | S1-D5 |
| Modelo `Cliente` | Nicolas (tests), Carol (seeds) | S1-D3 |

#### Fase 1

**F1.1 – Esqueleto de auditoría y errores (PR rápido)**
- **Rama:** `feature/core-auditoria-esqueleto` · **Estimado:** 0,5 día (S1-D2)
- Crea `middlewares/audit.js`, `services/auditService.js` y `middlewares/errorHandler.js` con su firma real e interior provisional (sección 17.1). Pide revisión a Carol.

**F1.2 – Discriminador Cliente** · `feature/core-usuario-cliente` · 0,5 día (S1-D3)
- Copia 5.1.c sin cambios y agrégalo a `models/usuario/index.js`.
- **Pruebas:** crear cliente válido · sin `direccion` falla · `Cliente.find()` no devuelve empleados · mismo documento puede existir como cliente y como empleado · mismo documento dos veces como cliente falla.

**F1.3 – Bitácora inmutable (RF-028, RS-007)** · `feature/core-auditoria-errores` · 0,5 día
- Copia el schema 5.15.
- Agrega hooks que **lancen error** en `updateOne`, `updateMany`, `findOneAndUpdate`, `deleteOne`, `deleteMany`, `findOneAndDelete`: `bitacoraSchema.pre(['updateOne', ...], function () { throw new Error('La bitácora es inmutable'); })`.
- **Prueba:** intentar actualizar o borrar un registro lanza error.

**F1.4 – `auditService.log()`** · 0,5 día
- **Firma (sección 6):** `log({ req, tipoEvento, entidad, entidadId, accion, detalle, resultado })`.
- Toma de `req`: `req.user` (id, correo, tipoUsuario, roles), `req.ip` y `req.get('user-agent')`. Permite pasar `usuario` explícito para el login (cuando aún no hay `req.user`).
- **Nunca lanza errores:** envuelve todo en `try/catch` y, si falla, escribe en el logger. Una falla de auditoría no puede tumbar la operación del usuario.
- **Nunca guardes contraseñas ni tokens en `detalle`:** elimina las claves `password`, `passwordInicial`, `passwordHash`, `token` antes de guardar.

**F1.5 – Middleware `audit(entidad, accion)`** · 0,5 día
- Registra `res.on('finish', ...)` y, cuando la respuesta termina con estado < 400, llama a `log()`.
- Mapea la acción al `tipoEvento`: `CREAR → ALTA`, `MODIFICAR | CANCELAR | ... → MODIFICACION`, `INACTIVAR → BAJA`. Permite sobrescribirlo con un tercer parámetro: `audit('Movimiento', 'REGISTRAR', 'MOVIMIENTO_INVENTARIO')`.
- `entidadId` sale de `res.locals.entidadId` (el controller lo pone) o de `req.params.id`.
- `detalle`: `{ metodo, ruta, body (sin contraseñas), cambios: res.locals.cambios }`.

**F1.6 – `errorHandler` y logger (RNF-007)** · 1 día
- Logger con `pino` + `pino-http`: cada petición registra método, ruta, estado, duración y un `requestId` (`crypto.randomUUID()`) que se devuelve en el encabezado `X-Request-Id`.
- Traducción de errores al formato `{ ok: false, code, message, details? }`:
  | Error | Respuesta |
  |---|---|
  | `AppError` | su `status`, `code` y `message` |
  | `mongoose.Error.ValidationError` | 400 `VALIDACION` con los mensajes por campo |
  | `mongoose.Error.CastError` | 400 `ID_INVALIDO` |
  | Código `11000` (duplicado) | 409 `DUPLICADO` con el campo |
  | `JsonWebTokenError` / `TokenExpiredError` | 401 |
  | `SyntaxError` de JSON | 400 `JSON_INVALIDO` |
  | Cualquier otro | 500 `ERROR_INTERNO`, mensaje genérico; el detalle solo va al log |
- Ruta no encontrada: middleware antes del `errorHandler` que responde 404 `RUTA_NO_ENCONTRADA`.
- **Nunca** devuelvas el stack al cliente en producción.

**F1.7 – Consulta de auditoría (RU-010)** · 0,5 día
- `GET /api/auditoria?tipoEvento&desde&hasta&usuario&tipoUsuario&entidad&resultado&page&limit` (solo A), ordenado por fecha descendente.
- **Hito Fase 1 (S1-D5):** demo de un login fallido, un login exitoso y una creación de sede apareciendo en la bitácora.

#### Fase 2

**F2.1 – Clientes (RF-005, RB-001, RB-021, RU-003)** · `feature/rf-005-clientes` · 2 días
- **Endpoints:** `POST /api/clientes` · `GET /api/clientes?q&activo&page&limit` · `GET /:id` · `PUT /:id` · `PATCH /:id/inactivar` · `POST /:id/invitacion`.
- **Pasos:**
  1. Validador: nombres, apellidos, tipoDocumento, documento, correo, teléfono y dirección obligatorios (RF-005); `consentimientoDatos.aceptado` debe ser `true` al crear (Habeas Data), y el service le pone `fecha = ahora`.
  2. Crea con `Cliente.create()` **sin contraseña**.
  3. Duplicado → `409 CLIENTE_DUPLICADO` indicando si es correo o documento (RB-001).
  4. Invitación: genera el token con `tokenService.firmarActivacion()` de Nicolas y envía el enlace `${FRONTEND_URL}/activar?token=...` con `notificacionService` (en desarrollo, lo imprime en consola). Responde 202. No reveles el token en la respuesta.
  5. Un cliente autenticado solo puede hacer `GET` y `PUT` limitado (teléfono, dirección, preferencias) sobre **su propio** registro: usa `ownOnly(null)` (RB-021).
- **Permisos:** A, R: CLEM · V: L · C: L y M limitado del propio.
- **Pruebas:** crear sin consentimiento (400) · cliente consulta a otro cliente (403) · cliente consulta el suyo (200) · veterinario intenta crear (403).

**F2.2 – Mascotas (RF-006, RB-002, RB-019)** · `feature/rf-006-mascotas` · 1,5 días
- **Endpoints:** `POST/GET /api/clientes/:id/mascotas` · `GET /api/mascotas/:id` · `PUT /api/mascotas/:id` · `PATCH /api/mascotas/:id/inactivar`.
- **Pasos:**
  1. El `:id` de la ruta debe ser un `Cliente` activo → si no, `404 CLIENTE_NO_ENCONTRADO` (RB-002).
  2. `fechaNacimiento` no puede ser futura; `pesoKg` ≥ 0.
  3. `manejoEspecial.nivel` distinto de NORMAL exige `observaciones` (RB-019).
  4. El cliente solo ve sus mascotas: `ownOnly(Mascota, 'cliente')`.
- **Pruebas:** mascota para id que no es cliente (404) · agresiva sin observaciones (400) · cliente ve mascota ajena (403).

#### Fase 3

**F3.1 – Crear cita (RF-007, RF-012, RB-003, RB-004, RB-005, RB-012)** · `feature/rf-007-009-012-citas` · 2 días
- **Endpoint:** `POST /api/citas` (A, R).
- **Mientras Nicolas termina `estaDisponible`, usa el stub de la sección 17.2.**
- **Algoritmo del service (en este orden):**
  1. Carga en paralelo: cliente (`Cliente`, activo), mascota (activa), servicio (activo), empleado (`Empleado`, activo), sede (activa). Si falta alguno → 404 con el código correspondiente.
  2. `mascota.cliente` debe ser igual a `cliente._id` → si no, `422 MASCOTA_NO_PERTENECE`.
  3. El empleado debe prestar el servicio (`empleado.servicios`) y trabajar en la sede (`empleado.sedes`) → `422 EMPLEADO_NO_HABILITADO`.
  4. Si `servicio.requiereVeterinario` y el empleado no tiene rol VETERINARIO → `422 REQUIERE_VETERINARIO` (RB-003).
  5. `fechaFin = fechaInicio + servicio.duracionMin`.
  6. `fechaInicio` debe ser futura. RB-012 (≥ 2 días de anticipación): **aplícala según lo decidido en la reunión** (punto 4 de la sección 9). Mientras no haya decisión, aplícala solo cuando quien agenda es CLIENTE y deja la regla en una función `validarAnticipacion(fechaInicio, rol)` fácil de cambiar → `422 ANTICIPACION_INSUFICIENTE`.
  7. Llama a `estaDisponible(empleado, sede, fechaInicio, fechaFin)`. Si no está disponible → `409` con `code` = el `motivo` recibido (RB-004, RB-005).
  8. Crea la cita con `estado: 'PROGRAMADA'` y `creadaPor: req.user.id`.
  9. Registra en bitácora (`audit('Cita', 'CREAR')`).
- **Pruebas mínimas:** caso feliz · solapamiento (409) · fuera de horario (409) · mascota de otro cliente (422) · consulta con recepcionista como profesional (422) · veterinario intenta crear (403).
- **Cuidado con:** la condición de carrera de dos recepcionistas reservando el mismo horario al mismo tiempo. Si hay replica set, crea la cita dentro de una transacción después de volver a verificar disponibilidad.

**F3.2 – Consultar, modificar y cancelar citas (RF-008, RF-009, RB-018)** · mismo PR · 2 días
- **`GET /api/citas?desde&hasta&empleado&cliente&mascota&sede&estado&page&limit`:** filtro automático por rol: V → `empleado = req.user.id`; C → `cliente = req.user.id`. Hace `populate` de mascota, cliente (solo nombre y teléfono), servicio, empleado y sede.
- **`GET /api/citas/:id`:** `ownOnly(Cita, 'cliente')`; el veterinario solo si es su cita.
- **`PUT /api/citas/:id` (reprogramar o cambiar datos):**
  1. Solo citas PROGRAMADA o CONFIRMADA.
  2. RB-018: si cambia la fecha, la fecha actual de la cita debe estar a ≥ 24 h → `422 PLAZO_VENCIDO`.
  3. Si cambian fecha, empleado, servicio o sede: recalcula `fechaFin`, repite las validaciones 3–7 de F3.1 con `excluirCitaId`.
  4. Por cada campo que cambió, agrega a `historialCambios` `{ usuario, campo, valorAnterior, valorNuevo, motivo }` (RF-008). El `motivo` es obligatorio en el body si cambia la fecha.
  5. Guarda en `res.locals.cambios` la lista de cambios para la bitácora.
- **`PATCH /api/citas/:id/confirmar`** (A, R): PROGRAMADA → CONFIRMADA.
- **`PATCH /api/citas/:id/cancelar`** (A, R): body `{ motivo }` obligatorio (RF-009); valida RB-018; `estado = CANCELADA`, `motivoCancelacion`, `canceladaEn`; agrega al historial.
- **Transiciones de estado permitidas:**
  | Desde | Hacia |
  |---|---|
  | PROGRAMADA | CONFIRMADA, CANCELADA, ATENDIDA, NO_ASISTIO |
  | CONFIRMADA | CANCELADA, ATENDIDA, NO_ASISTIO |
  | CANCELADA, ATENDIDA, NO_ASISTIO | ninguna (estados finales) |
  Crea `utils/transicionesCita.js` con `puedeTransicionar(desde, hacia)` y úsala en todos los cambios.

**F3.3 – Asistencia y resultado (RF-010, RU-007) e historial clínico** · `feature/rf-010-asistencia-resultado` · 1,5 días
- **`POST /api/citas/:id/asistencia`** (A, V, R) con `{ asistio, observaciones, diagnostico }`:
  1. La cita debe estar PROGRAMADA o CONFIRMADA y su `fechaInicio ≤ ahora`.
  2. Un veterinario solo registra en **sus** citas → 403.
  3. Ya existe asistencia → `409 ASISTENCIA_YA_REGISTRADA` (el índice único lo garantiza).
  4. `resultado = asistio ? 'ATENDIDA' : 'NO_ASISTIO'`. Si no asistió, `diagnostico` no se acepta.
  5. Crea la Asistencia y actualiza `cita.estado` al mismo valor (en transacción si hay replica set).
- **`GET /api/mascotas/:id/historial`:** citas de la mascota con su asistencia (agregación con `$lookup` a `asistencias_cita`), ordenadas de la más reciente a la más antigua. Lectura para A, V, R; el cliente solo de sus mascotas (RS-008).

#### Fase 4

**F4.1 – Reportes de citas y ocupación (RF-025)** · `feature/rf-025-reportes-citas-ocupacion` · 2 días
- `GET /api/reportes/citas?desde&hasta&sede&servicio&empleado&estado&formato` → totales por estado, por servicio, por sede y por día.
- `GET /api/reportes/ocupacion?desde&hasta&sede&empleado&formato` → por empleado: minutos disponibles (según horarios menos descansos y no disponibilidades), minutos reservados y % de ocupación. Pide a Nicolas una función `minutosLaborables(empleadoId, sedeId, desde, hasta)` en `disponibilidadService` (extensión del contrato).
- Exporta con `exportador` de Nicolas (`?formato=pdf|csv`).
- **Permisos:** A, R: todo · V: solo los propios.

**F4.2 – Recordatorios (RF-013)** · `feature/rf-013-recordatorios` · 1 día
- `services/notificacionService.js` con `enviar({ para, asunto, texto, canal })` y proveedores intercambiables según `MAIL_PROVIDER` (`console` en desarrollo, `smtp` con Nodemailer en producción; SMS queda como interfaz vacía).
- `jobs/recordatorios.js` con `node-cron`, todos los días a las 08:00 (`timezone: TZ_NEGOCIO`): busca citas PROGRAMADA/CONFIRMADA del día siguiente y envía el recordatorio según `preferenciasRecordatorio` del cliente. El texto recuerda llegar 15 minutos antes (RB-013).
- Evita duplicados: guarda en la cita un registro en `historialCambios` con `campo: 'recordatorio'` y no lo reenvíes si ya existe.
- El job no corre cuando `NODE_ENV=test`.

**F4.3 – Portal del cliente (RF-030, RU-008, RS-009)** · `feature/rf-030-portal-cliente` (con Nicolas) · 1 día
- Rutas bajo `/api/mi/*`, solo para CLIENTE, que **nunca** reciben el id del cliente por parámetro (lo toman de `req.user.id`): `GET /api/mi/perfil`, `PUT /api/mi/perfil` (teléfono, dirección, preferencias), `GET /api/mi/mascotas`, `GET /api/mi/citas?estado&desde&hasta`, `GET /api/mi/mascotas/:id/historial`.
- **Prueba clave:** con el token de un cliente es imposible obtener datos de otro, por ninguna ruta.

#### Fase 5
- **F5.1** Revisar el código de Carol (rotación).
- **F5.2** Prueba de integración de punta a punta: crear cliente → mascota → horario → cita → confirmar → asistencia → historial → reporte.
- **F5.3** Documentación Swagger de tus módulos.

---

### 15.3 CAROL – Infraestructura del proyecto e inventario

**Tu rol en el equipo:** eres la **dueña de la base del proyecto**: el repositorio, la configuración, las herramientas de validación y pruebas, y los datos iniciales. Si `develop` se rompe, coordinas el arreglo. Después construyes de forma independiente el módulo de Insumos, que tiene la regla más delicada del sistema: el stock nunca puede quedar negativo, aunque dos personas registren salidas al mismo tiempo.

**Tus entregas críticas:**
| Entrega | Para | Fecha |
|---|---|---|
| Repositorio funcionando con estructura, scripts y CI básica | Todos | Fase 0, día 1 |
| `validate`, `AppError`, `asyncHandler`, `validaciones.js`, configuración de pruebas | Todos | S1-D2 |
| Seeds completos | Todos | S1-D5 |

#### Fase 0

**C0.1 – Crear el repositorio** · día 1 (mañana)
1. Crea el repo en GitHub con `README.md` y `.gitignore` de Node. Invita a Nicolas y Felipe como colaboradores.
2. Clona y crea la estructura de la sección 4: `backend/src/...`, `backend/tests/`, `frontend/` (vacío con un `README`).
3. `cd backend && npm init -y`; en `package.json` agrega `"type": "module"`, `"engines": { "node": ">=20" }` y los scripts de la sección 12.3. Para Jest con ESM: `"test": "cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --runInBand"`.
4. Instala las dependencias base y de desarrollo de la sección 12.2.
5. Configura ESLint (reglas recomendadas + `no-unused-vars` como error) y Prettier (`singleQuote: true`, `semi: true`, `printWidth: 100`).
6. Crea `.env.example` (sección 12.4) y `docker-compose.yml` con Mongo 7 en modo replica set (`command: --replSet rs0` y un servicio de inicialización que ejecute `rs.initiate()`).
7. Crea `src/app.js` mínimo con `express.json()` y `GET /api/health`, y `src/server.js` que conecta a Mongo y escucha en `PORT`.
8. Crea una prueba de humo `tests/health.test.js`.
9. Commit en `main`, crea `develop` desde `main`, súbelas.
10. En GitHub → Settings → Branches: protege `main` y `develop` (exigir PR, 1 aprobación, que pase la CI, sin push directo).
- **Aceptación:** Nicolas y Felipe clonan y completan la lista 12.5.

**C0.2 – Archivos de colaboración** · día 1 (tarde)
1. `src/constants/roles.js` (sección 5.0) y `src/constants/estados.js`.
2. `.github/pull_request_template.md` (plantilla 18.1) y `.github/CODEOWNERS` (tabla 11.3).
3. `.github/workflows/ci.yml`: en cada PR a `develop`, ejecuta `npm ci`, `npm run lint` y `npm test` con Node 20.
4. Tablero en GitHub Projects con las columnas del paso 13.1 y una tarjeta por tarea de la sección 15 (etiquetas: `nicolas`, `felipe`, `carol`, `fase-1`… `fase-5`, `bloqueante`).
5. Colección Postman compartida con el entorno `local` (`baseUrl = http://localhost:4000/api`).

#### Fase 1

**C1.1 – Configuración y conexión** · `feature/core-setup-config` · 0,5 día
- `config/env.js`: lee `process.env`, valida con Zod (tipos y obligatorios) y **detiene el arranque** con un mensaje claro si falta algo. Exporta un objeto `env` congelado. Nadie más usa `process.env` directamente.
- `config/db.js`: `conectar()` y `desconectar()`; en desarrollo activa `mongoose.set('debug', true)` solo si `MONGO_DEBUG=true`.

**C1.2 – Utilitarios comunes (S1-D2, PR rápido)** · `feature/core-utils` · 0,5 día
- `utils/appError.js`, `utils/asyncHandler.js`, `utils/validaciones.js`, `middlewares/validate.js` exactamente como en la sección 14.1.
- Prueba de `validate`: body inválido → 400 con `details`.
- **Desbloquea:** todos. Avisa en cuanto esté en `develop`.

**C1.3 – Infraestructura de pruebas** · 0,5 día
- `tests/setup/globalSetup.js`: inicia `MongoMemoryReplSet` (replica set en memoria, para que funcionen las transacciones) y guarda la URI.
- `tests/setup/setupFile.js`: conecta antes de cada archivo, **limpia todas las colecciones** después de cada archivo y desconecta al final.
- `tests/helpers/auth.js`: archivo con `tokenDe` y `usuarioDe` como stubs que Nicolas completa en N1.8.
- `tests/helpers/fabricas.js`: funciones `crearSede()`, `crearServicio()`, `crearProducto()`… con datos válidos por defecto que se pueden sobrescribir. Cada dev agrega las de su dominio.

**C1.4 – Parámetros de inventario (RF-023, RNF-006)** · `feature/rf-023-parametros-inventario` · 0,5 día
- Copia el schema 5.11.
- `services/parametrosService.js` con `obtenerParametros()`: hace `findOneAndUpdate({ clave: 'GLOBAL' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })` para que el singleton siempre exista.
- `GET /api/inventario/parametros` (A) y `PUT /api/inventario/parametros` (A) con `umbralVencimientoDias`, `stockMinimoDefault`, `unidadesMedida`; guarda `actualizadoPor`; audita como `MODIFICACION`.
- No se puede quitar una unidad de medida que esté en uso por algún producto → `409 UNIDAD_EN_USO`.

**C1.5 – Seeds (S1-D5)** · `feature/core-seeds` · 0,5 día
- `scripts/seed.js`, **idempotente** (se puede ejecutar muchas veces sin duplicar: usa `findOneAndUpdate` con `upsert` por correo, nombre o código).
- Crea: parámetro GLOBAL · sede "Sede Principal" · servicios base (Consulta general 30 min, Vacunación 15 min, Peluquería 60 min sin veterinario, Control 20 min) · usuarios de prueba: `admin@zoolo.mx` (ADMINISTRADOR), `vet@zoolo.mx` (VETERINARIO, con tarjeta), `recepcion@zoolo.mx` (RECEPCIONISTA), `cliente@correo.com` (CLIENTE, con contraseña para pruebas) y una mascota del cliente · 5 productos de ejemplo (uno de cada categoría, uno con stock bajo y un medicamento que vence en 10 días).
- Contraseña de todos: la de `SEED_PASSWORD` del `.env`. Nunca contraseñas reales en el código.
- **Depende de:** N1.2 (Empleado) y F1.2 (Cliente). Si no están, deja los usuarios para el final de la semana.

#### Fase 2

**C2.1 – Productos (RF-015, RF-020, RF-022, RB-022, RB-025, RU-011)** · `feature/rf-015-022-productos` · 2,5 días
- **Endpoints:** `POST /api/productos` · `GET /api/productos` · `GET /:id` · `PUT /:id` · `PATCH /:id/inactivar` · `PATCH /:id/activar`.
- **Pasos:**
  1. Copia el schema 5.12.
  2. Validador de creación: `codigo`, `nombre`, `categoria`, `unidadMedida`, `stockMinimo` obligatorios; `stockInicial` (≥ 0) obligatorio; `lote` y `fechaVencimiento` obligatorios si la categoría es MEDICAMENTO (RB-025); `umbralVencimientoDias`, `ubicacion` opcionales.
  3. En el service: `unidadMedida` debe estar en `parametros.unidadesMedida` → `422 UNIDAD_INVALIDA`. Si no envían `stockMinimo`, usa `stockMinimoDefault`.
  4. **Stock inicial:** en Fase 2 crea el producto con `stockActual = stockInicial`. En la Fase 3 (C3.1) lo cambias para que el producto se cree con 0 y se registre un movimiento ENTRADA con motivo "Stock inicial" (trazabilidad RB-023). Deja un comentario `// TODO C3.1` para no olvidarlo.
  5. El validador del `PUT` **no acepta** `stockActual` ni `stockInicial` (regla de la sección 5.12): el stock solo cambia con movimientos.
  6. Código duplicado → `409 CODIGO_DUPLICADO`.
  7. **Filtros del listado (RF-020):** `categoria`, `activo`, `ubicacion`, `q` (código o nombre), `nivelStock=BAJO` (usa `{ $expr: { $lte: ['$stockActual', '$stockMinimo'] } }`), `nivelStock=AGOTADO` (`stockActual: 0`), `venceAntesDe=<fecha>`, `vencidos=true`; orden por `nombre` o `fechaVencimiento`; paginación.
  8. Cada producto del listado incluye campos calculados `estadoStock` (`OK`, `BAJO`, `AGOTADO`) y `estadoVencimiento` (`OK`, `PROXIMO`, `VENCIDO`) para que el frontend pinte rojo/amarillo (mockup "Insumos").
- **Permisos:** A: CLEM · V, R: L.
- **Pruebas:** medicamento sin lote (400) · código duplicado (409) · PUT intentando cambiar stock (400) · filtro stock bajo devuelve solo los correctos · recepcionista intenta crear (403).

#### Fase 3

**C3.1 – `inventarioService.registrarMovimiento` (RF-016, RF-017, RF-024, RB-007, RB-023, RS-010)** · `feature/rf-016-017-024-movimientos` · 2 días
- **Firma (sección 6):** `registrarMovimiento({ productoId, tipo, sentidoAjuste, cantidad, motivo, lote, usuarioId, session })`.
- **Algoritmo:**
  1. Valida: `cantidad > 0`; `motivo` no vacío; si `tipo = AJUSTE`, `sentidoAjuste` obligatorio; si no es AJUSTE, `sentidoAjuste` no se acepta.
  2. Calcula `delta`: ENTRADA → `+cantidad`; SALIDA → `-cantidad`; AJUSTE → `+` o `-` según `sentidoAjuste`.
  3. Abre una sesión y transacción (`mongoose.startSession()` + `session.withTransaction(...)`).
  4. Actualiza de forma **atómica**:
     - Si `delta < 0`: `Producto.findOneAndUpdate({ _id, activo: true, stockActual: { $gte: -delta } }, { $inc: { stockActual: delta } }, { new: true, session })`. Si devuelve `null`, averigua si el producto no existe/está inactivo (404) o si no alcanza el stock → `409 STOCK_INSUFICIENTE` (RB-007, RF-024).
     - Si `delta > 0`: igual pero sin la condición de stock.
  5. `stockResultante = producto.stockActual`; `stockAnterior = stockResultante - delta`.
  6. Crea el `MovimientoInsumo` con todos los campos y `usuario: usuarioId` (RS-010).
  7. Si es una ENTRADA de un MEDICAMENTO con `lote` y `fechaVencimiento`, actualiza esos campos del producto (limitación conocida: un lote por producto, punto 7 de la sección 9).
  8. Registra en bitácora `MOVIMIENTO_INVENTARIO` con `{ productoId, tipo, cantidad, stockAnterior, stockResultante }` (RF-028).
  9. Fuera de la transacción, llama a `alertasService.evaluarProducto(producto)` (C3.3).
  10. Devuelve `{ movimiento, producto }`.
- Aplica ahora el `TODO C3.1` de productos (stock inicial como movimiento).
- **Pruebas mínimas:** entrada suma · salida resta · salida mayor al stock (409 y el stock no cambia) · ajuste sin sentido (400) · **prueba de concurrencia:** producto con stock 10, lanza con `Promise.all` 15 salidas de 1 unidad → exactamente 10 exitosas, 5 con 409 y stock final 0 · existe el registro en bitácora.

**C3.2 – Endpoints de movimientos (RF-016, RF-021, RU-012)** · mismo PR · 0,5 día
- `POST /api/movimientos` (A, R): llama a `registrarMovimiento` con `usuarioId = req.user.id`. Responde 201.
- `GET /api/productos/:id/movimientos?tipo&desde&hasta&page&limit` (A, R): historial del producto, más reciente primero, con el nombre y correo del usuario (RF-021).
- **No existen** `PUT` ni `DELETE` de movimientos: las correcciones se hacen con un AJUSTE.
- **Permisos:** V no tiene acceso (403).

**C3.3 – Alertas (RF-018, RF-019, RB-024, RU-013, RU-014)** · `feature/rf-018-019-021-alertas-historial` · 2 días
- Copia el schema 5.14.
- `services/alertasService.js` → `evaluarProducto(producto)`:
  1. Calcula el umbral: `producto.umbralVencimientoDias ?? parametros.umbralVencimientoDias`.
  2. Para cada tipo (`STOCK_BAJO` si `stockActual ≤ stockMinimo`; `VENCIDO` si `fechaVencimiento < hoy`; `PROXIMO_VENCER` si vence dentro del umbral y no está vencido):
     - Si la condición se cumple: crea la alerta ACTIVA con un mensaje claro ("Vacuna X: quedan 3 TABLETA, mínimo 5"). Si ya existe una activa del mismo tipo, el índice único lanza `11000`: **atrápalo y no hagas nada**.
     - Si la condición ya no se cumple y hay una alerta ACTIVA de ese tipo: márcala ATENDIDA con `atendidaEn = ahora` y `atendidaPor = null` (cierre automático).
  3. Cuando pasa a VENCIDO, cierra la de PROXIMO_VENCER.
- `GET /api/alertas?tipo&estado&categoria&page&limit` (A, V, R): con datos del producto; por defecto solo ACTIVAS.
- `GET /api/alertas/resumen` → conteo de activas por tipo (para el panel del mockup "Alertas").
- `PATCH /api/alertas/:id/atender` (solo A) con `{ observacion }` opcional: `estado = ATENDIDA`, `atendidaPor`, `atendidaEn`. Si la condición sigue vigente, la próxima evaluación la vuelve a crear; adviértelo en la respuesta.
- **Pruebas:** salida que deja el stock bajo crea una alerta · otra salida no duplica la alerta · entrada que recupera el stock la cierra · producto que vence en 10 días con umbral 30 crea PROXIMO_VENCER.

#### Fase 4

**C4.1 – Job diario de alertas** · `feature/job-alertas-cron` · 0,5 día
- `jobs/alertasInventario.js` con `node-cron` todos los días a las 06:00 (`timezone: TZ_NEGOCIO`): recorre los productos activos con un cursor (`Producto.find({ activo: true }).cursor()`) y llama a `evaluarProducto`. Registra en el log cuántas alertas creó y cerró.
- Exporta también la función `ejecutarEvaluacion()` para poder ejecutarla a mano y en pruebas. No se programa cuando `NODE_ENV=test`.

**C4.2 – Reportes de insumos (RF-026)** · `feature/rf-026-reportes-insumos` · 2 días
- `GET /api/reportes/insumos/movimientos?desde&hasta&categoria&producto&tipo&formato` → totales de entradas, salidas y ajustes por producto y por categoría, y el detalle.
- `GET /api/reportes/insumos/criticos?formato` → productos con stock bajo o agotados.
- `GET /api/reportes/insumos/vencimientos?dias&formato` → productos próximos a vencer y vencidos.
- Usa el `exportador` de Nicolas. **Permisos:** A: todo · R: lectura · V: sin acceso.

#### Fase 5
- **C5.1** Revisar el código de Nicolas (rotación).
- **C5.2** Respaldo (RNF-009): `scripts/backup.sh` con `mongodump --archive --gzip` y `scripts/restore.sh` con `mongorestore`; documenta en el README cómo programarlo y **prueba una restauración completa** en una base vacía.
- **C5.3** Docker Compose completo (api + mongo) y CI que además construya la imagen.
- **C5.4** Documentación Swagger de tus módulos y README final (cómo levantar, variables, scripts, usuarios de prueba).

---

### 15.4 Fase 6 – Frontend React (Semana 7+): reparto inicial

Se detallará con fichas como las anteriores al cerrar la Fase 5. El reparto sigue la misma lógica de dueños: cada uno construye las pantallas de su dominio.

| Dev | Pantallas y piezas |
|---|---|
| **Carol** | Proyecto Vite + React Router, estructura de carpetas, cliente HTTP con renovación automática del token (refresh), layout general, componentes base (tabla con paginación, formulario, modal, mensajes de error con el `code` del backend). Pantallas Insumos, Movimientos de Insumo, Alertas y reporte de insumos. |
| **Nicolas** | Login, cierre de sesión, activación de cuenta, rutas protegidas por rol, menú según rol. Pantallas Gestión de Empleados, horarios, Agenda (calendario día/semana) y reporte de desempeño. |
| **Felipe** | Pantallas de Clientes, Mascotas, formulario de cita con consulta de disponibilidad, detalle e historial de la cita, asistencia, "Mis Citas" del cliente, Auditoría y reportes de citas/ocupación. |

---

## 16. Calendario día a día

`S` = semana, `D` = día hábil (D1 = lunes). Si arrancan el lunes 16 de noviembre de 2026, la Semana 4 incluye el festivo del 8 de diciembre: muevan esa semana un día. Las celdas en **negrita** son entregas que desbloquean a otros y no deben retrasarse.

### Semana 1 – Fase 0 y Fase 1 (Core)
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | T0.1 entorno · T0.2 lectura y reunión de contratos | T0.1 · T0.2 | **C0.1 repo** · C0.2 colaboración · T0.2 |
| D2 | **N1.1 esqueleto de seguridad** | **F1.1 esqueleto de auditoría y errores** | C1.1 configuración · **C1.2 utilitarios** · T0.3 tablero |
| D3 | N1.2 modelos · N1.3 tokens y contraseñas | **F1.2 Cliente** · F1.3 bitácora | C1.3 infraestructura de pruebas |
| D4 | N1.4 login | F1.4 `log()` · F1.5 `audit()` | C1.4 parámetros de inventario |
| D5 | **N1.5 middlewares reales** · N1.6 · **N1.8 `tokenDe`** | F1.6 errorHandler · F1.7 consulta de auditoría | C1.5 seeds · revisión de PR · **Demo Fase 1** |

### Semana 2 – Fase 2 (entidades base)
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | N1.7 roles y usuarios · N2.1 Sedes | F2.1 Clientes | C2.1 Productos (schema, crear, validaciones) |
| D2 | N2.2 Servicios | F2.1 Clientes (invitación, pruebas) | C2.1 Productos (listado y filtros) |
| D3 | N2.3 Empleados (crear, listar) | F2.2 Mascotas | C2.1 Productos (campos calculados, pruebas) |
| D4 | N2.3 Empleados (editar, inactivar, pruebas) | F2.2 Mascotas (pruebas) | Fábricas de pruebas · Postman · revisiones |
| D5 | Revisiones · ajustes de comentarios | Revisiones · ajustes | Revisiones · ajustes · **Demo Fase 2** |

### Semana 3 – Fase 3 (parte 1)
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | **Stub de `estaDisponible`** · N3.1 horarios | F3.1 crear cita (con stub) | C3.1 `registrarMovimiento` |
| D2 | N3.1 horarios (validaciones, pruebas) | F3.1 crear cita (pruebas) | C3.1 concurrencia y transacción |
| D3 | N3.2 no disponibilidades | F3.2 consultar y confirmar citas | C3.2 endpoints de movimientos |
| D4 | N3.3 `estaDisponible` | F3.2 reprogramar (historial de cambios) | C3.3 `evaluarProducto` |
| D5 | **N3.3 `estaDisponible` real en develop** | F3.2 cancelar · transiciones de estado | C3.3 endpoints de alertas · demo parcial |

### Semana 4 – Fase 3 (parte 2) e integración
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | N3.4 agenda | Quitar el stub y probar con `estaDisponible` real | C3.3 pruebas de alertas |
| D2 | N3.4 disponibilidad por bloques | F3.3 asistencia | Aplicar `TODO C3.1` (stock inicial como movimiento) |
| D3 | `minutosLaborables` para Felipe · sesión de integración con Felipe | F3.3 historial clínico | Revisiones · Postman de inventario |
| D4 | Pruebas de integración de agenda | Pruebas de integración de citas | Ayuda a quien esté atrasado |
| D5 | Ajustes | Ajustes | **Demo Fase 3** |

### Semana 5 – Fase 4 (reportes, portal, automatización)
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | N4.1 exportador | F4.1 reporte de citas (JSON) | C4.1 job de alertas |
| D2 | **N4.1 exportador en develop** | F4.1 reporte de ocupación | C4.2 reporte de movimientos |
| D3 | N4.2 reporte de desempeño | F4.1 exportación · F4.2 notificaciones | C4.2 críticos y vencimientos + exportación |
| D4 | N4.2 pruebas | F4.2 job de recordatorios | Pruebas de reportes |
| D5 | N4.3 activación de cuenta | F4.3 portal del cliente | Revisiones · **Demo Fase 4** |

### Semana 6 – Fase 5 (integración y endurecimiento)
| Día | Nicolas | Felipe | Carol |
|---|---|---|---|
| D1 | N5.1 revisar a Felipe | F5.1 revisar a Carol | C5.1 revisar a Nicolas |
| D2 | N5.2 seguridad HTTP | F5.2 prueba de punta a punta | C5.2 respaldo y restauración |
| D3 | N5.4 pruebas de carga | F5.2 corrección de hallazgos | C5.3 Docker y CI |
| D4 | N5.3 Swagger | F5.3 Swagger | C5.4 Swagger y README |
| D5 | Merge de `develop` a `main` (los tres) · **Demo final del backend** · retro del proyecto |

---

## 17. Dependencias entre tareas y stubs

### 17.1 Esqueletos de la Semana 1 (permiten trabajar en paralelo)
El proveedor sube estos archivos el **S1-D2**. Los consumidores importan las mismas rutas que usarán siempre; cuando llegue la versión real, no cambian nada en su código.

**`middlewares/authenticate.js` (esqueleto de Nicolas)** – solo para desarrollo y pruebas, mientras llega el JWT real:
```js
import AppError from '../utils/appError.js';
// ESQUELETO: reemplazar en N1.5. Lee el usuario de un encabezado de prueba.
export function authenticate(req, _res, next) {
  const crudo = req.get('x-usuario-prueba');   // ej: {"id":"...","tipoUsuario":"EMPLEADO","roles":["ADMINISTRADOR"]}
  if (!crudo || process.env.NODE_ENV === 'production') {
    return next(new AppError(401, 'NO_AUTENTICADO', 'Sesión requerida'));
  }
  req.user = JSON.parse(crudo);
  next();
}
```
**`middlewares/authorize.js`** – es tan simple que se entrega real desde el esqueleto:
```js
import AppError from '../utils/appError.js';
export const authorize = (...roles) => (req, _res, next) =>
  req.user?.roles?.some((r) => roles.includes(r))
    ? next()
    : next(new AppError(403, 'SIN_PERMISO', 'No tienes permiso para esta acción'));
```
**`middlewares/ownOnly.js` (esqueleto):** `export const ownOnly = () => (_req, _res, next) => next();`

**`middlewares/audit.js` y `services/auditService.js` (esqueletos de Felipe):**
```js
// audit.js – ESQUELETO: reemplazar en F1.5
export const audit = () => (_req, _res, next) => next();
// auditService.js – ESQUELETO: reemplazar en F1.4
export async function log(evento) { console.debug('[auditoria]', evento.tipoEvento, evento.accion); }
```

**`middlewares/errorHandler.js` (esqueleto de Felipe):**
```js
// ESQUELETO: reemplazar en F1.6
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  res.status(status).json({ ok: false, code: err.code ?? 'ERROR_INTERNO', message: err.message });
}
```

### 17.2 Stub de disponibilidad (Nicolas, S3-D1; lo usa Felipe hasta S4-D1)
Revisa solo solapamientos, para que las pruebas de Felipe tengan sentido desde el primer día:
```js
// services/disponibilidadService.js – STUB: reemplazar en N3.3
import Cita from '../models/Cita.js';
export async function estaDisponible(empleadoId, _sedeId, fechaInicio, fechaFin, opciones = {}) {
  const choque = await Cita.exists({
    empleado: empleadoId,
    estado: { $in: ['PROGRAMADA', 'CONFIRMADA'] },
    fechaInicio: { $lt: fechaFin },
    fechaFin: { $gt: fechaInicio },
    ...(opciones.excluirCitaId && { _id: { $ne: opciones.excluirCitaId } }),
  });
  return choque ? { disponible: false, motivo: 'SOLAPAMIENTO' } : { disponible: true };
}
```

### 17.3 Mapa de dependencias por tarea
| Tarea | Depende de | Si no está lista… |
|---|---|---|
| Cualquier ruta protegida | N1.1 (S1-D2) | Escribe service y pruebas unitarias del service; conecta las rutas cuando llegue. |
| Pruebas con tokens reales | N1.8 (S1-D5) | Usa el encabezado `x-usuario-prueba` del esqueleto. |
| Seeds de usuarios (C1.5) | N1.2, F1.2 | Haz primero sede, servicios, parámetro y productos. |
| Empleados (N2.3) | Sedes y Servicios (N2.1, N2.2) | Son del mismo dueño: hazlas en ese orden. |
| Mascotas (F2.2) | Clientes (F2.1) | Mismo dueño, mismo orden. |
| Crear cita (F3.1) | Empleados, Servicios, Sedes, Mascotas, `estaDisponible` | Usa el stub 17.2. Para datos, usa las fábricas de `tests/helpers/fabricas.js`. |
| Asistencia (F3.3) | Citas (F3.1, F3.2) | Mismo dueño. |
| Movimientos (C3.1) | Productos (C2.1), `audit` real (F1.4) | Usa el esqueleto de `log()`. |
| Alertas (C3.3) | Movimientos (C3.1), Parámetros (C1.4) | Mismo dueño. |
| Reportes con exportación | N4.1 (S5-D2) | Empieza por la respuesta JSON; el `?formato=` va al final. |
| Reporte de ocupación (F4.1) | `minutosLaborables` (S4-D3) | Calcula solo minutos reservados y agrega el % cuando llegue. |
| Activación de cuenta (N4.3) | Invitación de clientes (F2.1) | Prueba con un token generado a mano en la prueba. |

---

## 18. Plantillas

### 18.1 Pull Request (`.github/pull_request_template.md`)
```markdown
## Qué hace este PR
<!-- 2-3 líneas. Ej: "Agrega el CRUD de sedes (RF-014) con inactivación lógica." -->

## Tarea de la guía
<!-- Ej: N2.1 – Sedes -->

## Requisitos cubiertos
- RF: 
- RB: 
- RS/RNF: 

## Endpoints
| Método | Ruta | Roles |
|---|---|---|
|  |  |  |

## Cómo probarlo
1. `npm run seed`
2. En Postman, carpeta "…", ejecutar "…"
3. Resultado esperado: …

## Checklist (Definition of Done)
- [ ] Schema usado tal cual
- [ ] authenticate + authorize (+ ownOnly si aplica al Cliente)
- [ ] validate en todas las rutas con datos de entrada
- [ ] Errores con AppError y formato { ok:false, code, message }
- [ ] audit() en altas, modificaciones y bajas
- [ ] Pruebas: caso feliz + 403 por rol + regla de negocio
- [ ] npm run lint y npm test pasan
- [ ] Colección Postman actualizada
- [ ] Sin console.log de depuración ni archivos .env

## Dependencias nuevas
<!-- Ninguna / paquete y para qué -->

## Notas para el revisor
<!-- Decisiones tomadas, dudas, partes en las que quieres más atención -->
```

### 18.2 Pregunta o bloqueo (en el canal del equipo)
```
🔴 Bloqueo / ❓ Pregunta – [tarea, ej. F3.1 Crear cita]
Qué intento hacer: …
Qué pasa: … (pega el error completo o el código de respuesta)
Qué ya probé: 1) … 2) …
Rama: feature/...   Archivo y línea: …
¿Me bloquea?: sí, desde [hora] / no, sigo con otra tarea
```

### 18.3 Daily (10 minutos, cada persona ≤ 2 minutos)
```
Ayer terminé: [tarea y estado del PR]
Hoy haré: [tarea según calendario]
Bloqueos: [ninguno / qué y de quién dependo]
¿Voy al día con el calendario?: sí / atrasado X días (y qué propongo)
```

### 18.4 Reporte de bug (issue en GitHub)
```markdown
**Módulo / dueño:** 
**Pasos para reproducir:** 1. … 2. …
**Resultado esperado:** 
**Resultado obtenido:** (código HTTP y cuerpo de respuesta)
**Rama o commit:** 
**Severidad:** bloqueante / alta / media / baja
```

### 18.5 Aviso de merge que desbloquea
```
✅ En develop: [qué] (PR #N). [A quién desbloquea] ya puede [qué hacer, ej. "quitar el stub de estaDisponible"].
Cambios en contratos: ninguno / [cuál].
```

---

## 19. Errores comunes y cómo evitarlos

| Síntoma | Causa probable | Solución |
|---|---|---|
| La petición se queda "colgada" y nunca responde | Error en un controller async sin `asyncHandler`, o falta `next()` en un middleware | Envuelve siempre con `asyncHandler`; todo middleware termina con `next()` o con una respuesta. |
| `Cannot set headers after they are sent` | Respondiste dos veces (ej. falta `return` antes de `res.json` o de `next(error)`) | Usa `return next(...)` y `return res...`. |
| Una comparación de ids siempre da `false` | Comparar `ObjectId` con `===` | Usa `String(a) === String(b)` o `a.equals(b)`. |
| La respuesta trae `passwordHash` | Usaste `.lean()` (el `toJSON` no se aplica) con `+passwordHash` o armaste el objeto a mano | No selecciones `passwordHash` salvo en login; no uses `+passwordHash` en otras consultas. |
| `findByIdAndUpdate` guarda datos inválidos | Mongoose no valida en updates por defecto | Pasa siempre `{ new: true, runValidators: true }`. |
| Las citas aparecen un día antes o en otra hora | Mezcla de hora local y UTC | Guarda en UTC; convierte a `TZ_NEGOCIO` solo para comparar con horarios y para mostrar (N3.3). |
| `Transaction numbers are only allowed on a replica set` | Mongo local sin replica set | Usa el `docker-compose.yml` del proyecto (`--replSet rs0`) y `?replicaSet=rs0` en `MONGO_URI`. |
| `ERR_MODULE_NOT_FOUND` | En ESM falta la extensión `.js` en el import | Escribe siempre `import x from './archivo.js'`. |
| Las pruebas pasan solas pero fallan juntas | Datos que quedan de otra prueba | Crea los datos dentro de cada prueba con las fábricas; no dependas del orden. |
| `E11000 duplicate key` en pruebas | Correos o códigos repetidos entre pruebas | Las fábricas generan valores únicos (`correo: \`u${Date.now()}${Math.random()}@t.com\``). |
| Subiste el `.env` | No revisaste antes del commit | Revisa `git status` antes de cada commit. Si pasó: avisa, cambia los secretos y bórralo del repo. |
| PR enorme que nadie quiere revisar | Muchas tareas en una rama | Un PR por tarea; menos de 400 líneas. |
| Trabajaste horas sobre código viejo | No actualizaste con `develop` | Paso 7 del flujo, todos los días. |
| Commit directo en `develop` rechazado | La rama está protegida (correcto) | Crea una rama: `git switch -c feature/...`, haz push y abre PR. |
| Cambiaste un schema "solo un poquito" | Falta de acuerdo | Los schemas se cambian solo tras acordarlo en el canal y actualizar la sección 5. |
| La regla de negocio está en el controller | Mezcla de capas | El controller solo recibe, llama al service y responde; las reglas van en el service. |

---

## 20. Glosario técnico para el equipo

| Término | Qué significa aquí |
|---|---|
| **Endpoint** | Una combinación de método y ruta de la API, por ejemplo `POST /api/citas`. |
| **Middleware** | Función que Express ejecuta antes del controller; puede dejar pasar (`next()`), cortar con un error o agregar datos a `req`. |
| **Controller** | Función que recibe la petición, llama al service y responde. No contiene reglas de negocio. |
| **Service** | Donde vive la lógica de negocio y las reglas RB; habla con los modelos. |
| **Schema / Modelo** | El schema define la forma de un documento en Mongoose; el modelo es lo que usas para consultar y guardar (`Sede.find()`). |
| **Discriminador** | Forma de Mongoose de guardar varios "subtipos" en la misma colección con campos distintos. Aquí: `Empleado` y `Cliente` dentro de `usuarios`. |
| **populate** | Reemplaza un id guardado por el documento al que apunta (ej. el nombre de la mascota en lugar de su id). |
| **lean()** | Devuelve objetos JavaScript simples en vez de documentos de Mongoose: más rápido, ideal para listados de solo lectura. |
| **Índice único** | Regla de la base de datos que impide repetir un valor (ej. correo). Al violarla, Mongo lanza el error `11000`. |
| **Agregación** | Consulta de Mongo por etapas (`$match`, `$group`, `$lookup`…) para calcular totales; se usa en los reportes. |
| **Transacción** | Varias operaciones que se guardan todas o ninguna. En Mongo requiere replica set. |
| **Operación atómica** | Una actualización que Mongo hace de una sola vez, sin que otra petición pueda meterse en medio (ej. `$inc` con condición de stock). |
| **JWT** | Token firmado que demuestra quién es el usuario. El de acceso dura poco; el de refresh sirve para pedir uno nuevo. |
| **Hash (bcrypt)** | Transformación irreversible de la contraseña. Se guarda el hash, nunca la contraseña. |
| **RBAC** | Control de acceso por roles: lo que puedes hacer depende de tu rol (matriz del ERS). |
| **Contrato** | La firma acordada de una función o middleware que otro desarrollador usa (sección 6). |
| **Stub / Esqueleto** | Versión provisional de una función con la firma real pero lógica mínima, para que otros avancen. |
| **Idempotente** | Se puede ejecutar varias veces y el resultado es el mismo (ej. los seeds). |
| **Borrado lógico** | Marcar `activo: false` en lugar de eliminar el documento. |
| **Rama (branch)** | Copia de trabajo aislada del código. Cada tarea tiene la suya. |
| **Pull Request (PR)** | Solicitud para integrar tu rama en `develop`, con revisión de otro integrante. |
| **Squash and merge** | Une todos los commits del PR en uno solo al integrarlo, para que el historial de `develop` quede limpio. |
| **Conflicto de merge** | Git no sabe qué versión de unas líneas conservar porque dos personas las cambiaron; lo resuelves tú. |
| **CI (Integración continua)** | GitHub Actions ejecuta lint y pruebas en cada PR automáticamente. |
| **Cron** | Tarea programada que se ejecuta sola a cierta hora (alertas, recordatorios). |
| **ESM** | Sistema de módulos de JavaScript con `import`/`export` (por eso `"type": "module"`). |
| **Definition of Done (DoD)** | Lista de condiciones para considerar una tarea terminada (sección 8). |
