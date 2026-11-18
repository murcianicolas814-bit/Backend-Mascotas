import { ROLES } from '../config/constant-roles.js';

// allowedRoles: Roles permitidos, ej. [ROLES.ADMIN] o ['ADMINISTRADOR', 'ADMIN']
const authorizationMiddleware = ( allowedRoles ) => {
    return ( req, res, next ) => {
        // Extraer el rol del usuario autenticado
        const userRole = req.userFound?.rol || req.userFound?.role;

        if ( ! userRole ) {
            return res.status(403).json({ msg: 'Error: El usuario autenticado no tiene rol definido' });
        }

        // Mapeo flexible para normalizar roles tradicionales e internos
        const roleSynonyms = {
            'ADMIN': [ROLES.ADMIN, 'ADMIN', 'ADMINISTRADOR'],
            'ADMINISTRADOR': [ROLES.ADMIN, 'ADMIN', 'ADMINISTRADOR'],
            'VETERINARIO': [ROLES.VETERINARIO, 'VETERINARIO'],
            'RECEPCIONISTA': [ROLES.RECEPCIONISTA, 'RECEPCIONISTA'],
            'CLIENTE': [ROLES.CLIENTE, 'CLIENTE', 'CUSTOMER'],
            'CUSTOMER': [ROLES.CLIENTE, 'CLIENTE', 'CUSTOMER']
        };

        const isAuthorized = allowedRoles.some(allowed => {
            const synonyms = roleSynonyms[allowed] || [allowed];
            return synonyms.includes(userRole);
        });

        if ( ! isAuthorized ) {
            return res.status(403).json({
                msg: `Error: el rol ${ userRole } no está autorizado para realizar esta acción`
            });
        }

        next();
    }
}

export {
    authorizationMiddleware
}
