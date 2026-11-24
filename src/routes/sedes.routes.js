import { Router } from "express";
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