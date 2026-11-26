import { Router } from "express";
import { crearServicio, obtenerServicios, eliminarServicio, actualizarServicio, obtenerServicio } from '../controllers/servicios.controllers.js';
import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';

const router = Router();

router.post( '/', authMiddleware, authorizationMiddleware(['ADMIN']), crearServicio );
router.get( '/', obtenerServicios );
router.delete( '/:id', authMiddleware, authorizationMiddleware(['ADMIN']), eliminarServicio );
router.patch( '/:id', authMiddleware, authorizationMiddleware(['ADMIN']), actualizarServicio );
router.get( '/:id', obtenerServicio );

export default router;