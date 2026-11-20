import { Router } from 'express';
import {
    crearSede,
    obtenerSedes,
    obtenerSedePorId,
    actualizarSede,
    eliminarSede
} from '../controllers/sedes.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from '../config/constant-roles.js';

const router = Router();

router.get('/', obtenerSedes);
router.get('/:id', obtenerSedePorId);

router.use(authMiddleware);

router.post('/', authorizationMiddleware([ROLES.ADMIN]), crearSede);
router.patch('/:id', authorizationMiddleware([ROLES.ADMIN]), actualizarSede);
router.delete('/:id', authorizationMiddleware([ROLES.ADMIN]), eliminarSede);

export default router;
