import { verifyPassword } from "../helpers/bcrypt.helpers.js";
import { generateToken } from "../helpers/jwt.helpers.js";
import { dbGetUserByEmail } from "../services/usuarios.services.js";

const loginUser = async ( req, res ) => {
    try {
        const inputData = req.body;
        const correo = inputData.correo || inputData.email;
        const password = inputData.password || inputData.contraseña;

        if ( ! correo ) {
            return res.status(400).json({
                msg: 'El correo electrónico es obligatorio (campo correo o email)'
            });
        }

        if ( ! password ) {
            return res.status(400).json({
                msg: 'La contraseña es obligatoria (campo password)'
            });
        }

        // Buscar usuario incluyendo passwordHash para validar
        const userFound = await dbGetUserByEmail( correo, true );

        if ( ! userFound ) {
            return res.status(404).json({
                msg: 'El usuario no existe o se encuentra inactivo. Por favor verifique sus credenciales'
            });
        }

        // Verificar si la contraseña es válida
        const hashToVerify = userFound.passwordHash || userFound.password;
        const isValid = verifyPassword( password, hashToVerify );

        if ( ! isValid ) {
            return res.status(401).json({
                msg: 'Contraseña o credenciales inválidas'
            });
        }

        // Generar Payload para el Token JWT
        const payload = {
            _id: userFound._id,
            nombres: userFound.nombres,
            apellidos: userFound.apellidos,
            correo: userFound.correo,
            rol: userFound.rol,
            activo: userFound.activo,
            empleado: userFound.empleado,
            cliente: userFound.cliente,
            // Campos de compatibilidad hacia atrás:
            name: `${userFound.nombres} ${userFound.apellidos}`.trim(),
            email: userFound.correo,
            role: userFound.rol,
            status: userFound.activo
        };

        const token = generateToken( payload );

        // Convertir a objeto y limpiar datos sensibles
        const jsonObj = userFound.toObject();
        delete jsonObj.passwordHash;
        delete jsonObj.password;

        res.json({
            msg: 'Login de usuario exitoso',
            token: token,
            data: jsonObj
        });
    } 
    catch (error) {
        console.error( error );
        res.status(500).json({
            msg: 'No se pudo autenticar el usuario'
        });
    }
}

const verifyAuthenticate = ( req, res ) => {
    try {
        const userFound = req.userFound;

        const newPayload = {
            _id: userFound._id,
            nombres: userFound.nombres,
            apellidos: userFound.apellidos,
            correo: userFound.correo,
            rol: userFound.rol,
            activo: userFound.activo,
            empleado: userFound.empleado,
            cliente: userFound.cliente,
            name: `${userFound.nombres} ${userFound.apellidos}`.trim(),
            email: userFound.correo,
            role: userFound.rol,
            status: userFound.activo
        };

        const newToken = generateToken( newPayload );

        const jsObj = userFound.toObject();
        delete jsObj.passwordHash;
        delete jsObj.password;

        res.json({
            msg: 'Autenticidad del Token Verificada con éxito',
            token: newToken,
            data: jsObj
        });
    } catch (error) {
        console.error( error );
        res.status(500).json({
            msg: 'No se pudo verificar la autenticidad de las credenciales'
        });
    }
}

export {
    loginUser,
    verifyAuthenticate
}
