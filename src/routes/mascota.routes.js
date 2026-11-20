import { Router } from 'express';

import { crearMascota, obtenerMascotas, obtenerMascotaPorId, actualizarMascota, eliminarMascota } from '../controllers/mascotas.controllers.js';

import { authMiddleware } from '../middlewares/authenticate.middleware.js';
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from '../config/constant-roles.js';

const router = Router();


router.use(authMiddleware);


router.post( '/', authorizationMiddleware([ROLES.ADMIN, ROLES.CLIENTE]), crearMascota  );

router.get( '/', authorizationMiddleware([ ROLES.ADMIN, ROLES.RECEPCIONISTA, 
    ROLES.VETERINARIO,ROLES.CLIENTE ]), obtenerMascotas );

router.get( '/:id', authorizationMiddleware([ ROLES.ADMIN, ROLES.RECEPCIONISTA,
        ROLES.VETERINARIO, ROLES.CLIENTE ]), obtenerMascotaPorId );

router.patch( '/:id', authorizationMiddleware([ROLES.ADMIN, ROLES.CLIENTE]), actualizarMascota );

router.delete( '/:id', authorizationMiddleware([ROLES.ADMIN, ROLES.CLIENTE]), eliminarMascota );

export default router;

