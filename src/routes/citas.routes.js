import { Router } from 'express';
import {
    actualizarCita,
    cancelarCita,
    crearCita,
    obtenerCitaPorId,
    obtenerCitas
} from '../controllers/citas.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from '../config/constant-roles.js';

const router = Router();

router.post(
    '/',
    authMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE]),
    crearCita
);
router.get(
    '/',
    authMiddleware,
    authorizationMiddleware([
        ROLES.ADMIN,
        ROLES.RECEPCIONISTA,
        ROLES.VETERINARIO,
        ROLES.CLIENTE
    ]),
    obtenerCitas
);
router.get(
    '/:id',
    authMiddleware,
    authorizationMiddleware([
        ROLES.ADMIN,
        ROLES.RECEPCIONISTA,
        ROLES.VETERINARIO,
        ROLES.CLIENTE
    ]),
    obtenerCitaPorId
);
router.put(
    '/:id',
    authMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE]),
    actualizarCita
);
router.patch(
    '/:id/cancelar',
    authMiddleware,
    authorizationMiddleware([ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.CLIENTE]),
    cancelarCita
);

export default router;
