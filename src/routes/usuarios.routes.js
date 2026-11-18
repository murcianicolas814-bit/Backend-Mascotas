import { Router } from "express";
import { createUser, deleteUser, getUsers, getUser, updateUser } from "../controllers/usuarios.controllers.js";
import { authMiddleware } from "../middlewares/authenticate.middleware.js";
import { authorizationMiddleware } from '../middlewares/authorization.middleware.js';
import { ROLES } from "../config/constant-roles.js";

const router = Router();    

// 1. Registro Privado (Solo ADMINISTRADOR)
router.post( '/', authMiddleware, authorizationMiddleware([ROLES.ADMIN]), createUser );

// 2. Listado con paginación y filtro de estado (Solo ADMINISTRADOR)
router.get( '/', authMiddleware, authorizationMiddleware([ROLES.ADMIN]), getUsers );

// 3. Operaciones individuales por ID
router.delete( '/:id', authMiddleware, authorizationMiddleware([ROLES.ADMIN]), deleteUser );
router.patch( '/:id', authMiddleware, authorizationMiddleware([ROLES.ADMIN]), updateUser );
router.get( '/:id', authMiddleware, authorizationMiddleware([ROLES.ADMIN]), getUser );

export default router;
