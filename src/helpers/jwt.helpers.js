import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ZoloMascotas_Super_Secret_Key_2026';

const generateToken = ( payload ) => {
    try {
        return jwt.sign( 
            payload,  // Carga Util: Datos que el BackEnd quiere compartir con el FrontEnd que envia a traves del token  
            JWT_SECRET,     // Cadena Secreta (se mezcla con el payload para proteger los datos)
            { expiresIn: '1h' }         // Tiempo de Expiracion del token
        );
    } 
    catch (error) {
        console.error( error );

        return null;
    }

}

const validateToken = ( token ) => {
    try {
        // Si es valido devuelve el payload, si no devuelve null
        const payload = jwt.verify( 
            token,                      // Token valido enviado por el usuario
            JWT_SECRET      // Cadena Secreta que se mezclo con el payload
        );
    
        console.log( 'payload (validateToken): ', payload );    // Debbuging
    
        return payload;
    } 
    catch (error) {
        console.error( error );

        return null;
    }

}


export { 
    generateToken,
    validateToken
}