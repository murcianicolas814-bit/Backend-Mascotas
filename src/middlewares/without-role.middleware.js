import { ROLES } from '../config/constant-roles.js';

const withoutRoleMiddleware = (req, res, next) => {
    // Al registrarse públicamente, se elimina cualquier intento de asignar rol administrativo
    delete req.body.role;
    delete req.body.rol;
    
    // Se asigna el rol CLIENTE por defecto
    req.body.rol = ROLES.CLIENTE;

    next();
}

export default withoutRoleMiddleware;
