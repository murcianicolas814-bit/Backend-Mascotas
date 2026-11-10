import { Schema, model } from "mongoose";

// Expresión regular para validar formato de correo electrónico:
// - ^                 : Inicio de la cadena
// - [a-zA-Z0-9._%+-]+ : Parte local / Usuario (letras, números, puntos, guiones, etc., al menos 1 carácter)
// - @                 : Arroba obligatoria que separa el usuario del dominio
// - [a-zA-Z0-9.-]+    : Nombre del dominio o proveedor (ej: gmail, sena, al menos 1 carácter)
// - \.                : Punto literal obligatorio antes de la extensión
// - [a-zA-Z]{2,}      : Dominio de nivel superior / TLD (solo letras, mínimo 2 caracteres: com, co, edu, org, etc.)
// - $                 : Fin de la cadena
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Expresión regular para validar contraseña segura:
// - (?=.*[a-z])                                  : Al menos una letra minúscula
// - (?=.*[A-Z])                                  : Al menos una letra mayúscula
// - (?=.*\d)                                     : Al menos un dígito numérico (alfanumérico)
// - (?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]): Al menos un símbolo o carácter especial
// - [^\s]{7,24}                                  : Más de 6 caracteres (mínimo 7) y máximo 24 caracteres, sin espacios
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])[^\s]{7,24}$/;

// Parte 1: Definir la estructura de datos de mi Documento con validaciones y mensajes personalizados
const UserSchema = new Schema(
    // Definición de los campos del documento
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
            maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            // match: [emailRegex, 'El correo electrónico no tiene un formato válido']
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            trim: true,
            // match: [
            //     passwordRegex,
            //     'La contraseña debe tener entre 7 y 24 caracteres, incluir al menos una mayúscula, una minúscula, un número y un símbolo'
            // ]
        },
        role: {
            type: String,
            enum: {
                values: ['ADMIN', 'SELLER', 'CUSTOMER'],
                message: 'El rol {VALUE} no es válido, debe ser ADMIN, SELLER o CUSTOMER'
            },
            default: 'CUSTOMER'
        },
        status: {
            type: Boolean,
            default: true
        },
        // Determina el origen del registro:
        // - null: El usuario se registró solo (auto-registro / público).
        // - ObjectId: Referencia al ID del administrador que lo registró en el sistema.
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            default: null
        }
    },
    // Opciones del esquema
    {
        timestamps: true,     // Crea automaticamente createdAt, updatedAt
        versionKey: false     // Elimina la propiedad de versionamiento __v del Schema
    }
);

// Parte 2: Definir el modelo atado a la colección
const UserModel = model(
    'usuarios',             // Nombre de la colección (pluraliza a 'users')
    UserSchema          // Esquema asociado
);

export default UserModel;
