import { Router } from 'express';
import {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente
} from '../controllers/clientes.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from '../config/constant-roles.js';

const router = Router();

// Todas las rutas de clientes requieren autenticación
router.use(authMiddleware);

// 1. Crear nuevo cliente (Admin y Recepcionista)
router.post('/', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA]), crearCliente);

// 2. Listar clientes con paginación y filtros (Admin, Recepcionista y Veterinario)
router.get('/', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.VETERINARIO]), obtenerClientes);

// 3. Obtener cliente por ID (Admin, Recepcionista y Veterinario)
router.get('/:id', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.VETERINARIO]), obtenerClientePorId);

// 4. Actualizar cliente (Admin y Recepcionista)
router.patch('/:id', authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA]), actualizarCliente);

// 5. Eliminar cliente (Solo Administrador)
router.delete('/:id', authorizationMiddleware([ROLES.ADMIN]), eliminarCliente);

export default router;
