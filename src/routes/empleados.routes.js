import { Router } from 'express';
import {
    crearEmpleado,
    obtenerEmpleados,
    obtenerVeterinariosActivos,
    obtenerEmpleadoPorId,
    actualizarEmpleado,
    eliminarEmpleado
} from '../controllers/empleados.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from '../config/constant-roles.js';

const router = Router();

// Todas las rutas de empleados requieren autenticación
router.use(authMiddleware);

// 1. Crear nuevo empleado (Solo Administrador)
router.post('/', authorizationMiddleware([ROLES.ADMIN]), crearEmpleado);

// 2. Listar empleados con filtros de rol, sede, etc. (Admin y Recepcionista)
router.get('/', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA]), obtenerEmpleados);

router.get(
    '/veterinarios/activos',
    authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE]),
    obtenerVeterinariosActivos
);

// 3. Obtener un empleado por ID (Admin, Recepcionista y Veterinario)
router.get('/:id', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.VETERINARIO]), obtenerEmpleadoPorId);

// 4. Actualizar empleado (Solo Administrador)
router.patch('/:id', authorizationMiddleware([ROLES.ADMIN]), actualizarEmpleado);

// 5. Eliminar empleado (Solo Administrador)
router.delete('/:id', authorizationMiddleware([ROLES.ADMIN]), eliminarEmpleado);

export default router;
