<<<<<<< HEAD

import { crearSede, getSedes, deleteSede, updateSede, getSede } from '../controllers/sedes.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';

const router = Router();

router.post( '/', authMiddleware, authorizationMiddleware(['ADMIN']), crearSede );
router.get( '/',authMiddleware, authorizationMiddleware(['ADMIN']), getSedes );
router.delete( '/:id', authMiddleware, authorizationMiddleware(['ADMIN']), deleteSede );
router.patch( '/:id', authMiddleware, authorizationMiddleware(['ADMIN']), updateSede );
router.get( '/:id', authMiddleware, authorizationMiddleware(['ADMIN']), getSede );

export default router;
=======
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
>>>>>>> 08ac6a94d750fb164016cdee573a63560420eb6f
