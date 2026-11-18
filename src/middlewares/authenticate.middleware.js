import { validateToken } from "../helpers/jwt.helpers.js";
import { dbGetUserByEmail } from "../services/usuarios.services.js";

const authMiddleware = async ( req, res, next ) => {
    try {
        // Paso 1: Obtener el Token de la cabecera
        const token = req.header( 'X-Token' );

        if( ! token ) {
            return res.status( 401 ).json({
                msg: 'Cadena de token vacía. Debe proporcionar la cabecera X-Token'
            });
        }

        // Divide la cadena en partes usando el punto como referencia
        const tokenParts = token.split( '.' );
        if( tokenParts.length !== 3 ) {
            return res.status( 401 ).json({
                msg: 'Formato del token no es válido'
            });
        }

        // Verificar la autenticidad del token
        const payload = validateToken(token);
        if( ! payload ) {
            return res.status( 401 ).json({
                msg: 'Token inválido o expirado'
            });
        }

        // Paso 3: Verificar que el usuario exista en la base de datos y esté activo
        const correo = payload.correo || payload.email;
        const userFound = await dbGetUserByEmail( correo );

        if( ! userFound ) {
            return res.status( 401 ).json({
                msg: 'El usuario se encuentra deshabilitado o no está registrado'
            });
        }

        req.userFound = userFound;
        next();
    } catch (error) {
        console.error('Error en authMiddleware:', error);
        return res.status(500).json({ msg: 'Error interno en autenticación' });
    }
}

export {
    authMiddleware
}
