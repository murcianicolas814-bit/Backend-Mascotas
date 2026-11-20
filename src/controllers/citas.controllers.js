import mongoose from 'mongoose';
import { ESTADOS_CITA, ROLES } from '../config/constant-roles.js';
import handleMongooseError from '../helpers/handle-mongoose-error.helper.js';
import {
    dbActualizarCita,
    dbCancelarCita,
    dbCrearCita,
    dbObtenerCitaPorId,
    dbObtenerCitas
} from '../services/citas.services.js';

const crearErrorValidacion = (message) => {
    const error = new Error(message);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    return error;
};

const validarObjetoBody = (body, camposPermitidos) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw crearErrorValidacion('El body debe ser un objeto JSON');
    }

    const campoDesconocido = Object.keys(body).find((campo) => !camposPermitidos.includes(campo));
    if (campoDesconocido) {
        throw crearErrorValidacion(`El campo '${campoDesconocido}' no está permitido`);
    }
};

const validarId = (id, nombre) => {
    if (!mongoose.isValidObjectId(id)) {
        throw crearErrorValidacion(`${nombre} no tiene un formato válido`);
    }
};

const obtenerRol = (usuario) => usuario?.rol || usuario?.role;

const construirRespuestaError = (error, res) => {
    if (error.status) {
        return res.status(error.status).json({
            ok: false,
            code: error.code || 'REQUEST_ERROR',
            message: error.message
        });
    }

    const erroresMongoose = handleMongooseError(error);
    if (erroresMongoose) {
        const message = Object.entries(erroresMongoose)
            .map(([campo, detalle]) => `${campo}: ${detalle}`)
            .join('; ');
        return res.status(400).json({
            ok: false,
            code: error.name === 'CastError' ? 'INVALID_ID' : 'VALIDATION_ERROR',
            message
        });
    }

    console.error('Error en el módulo de citas:', error);
    return res.status(500).json({
        ok: false,
        code: 'INTERNAL_ERROR',
        message: 'No se pudo completar la operación de citas'
    });
};

const procesarError = (error, res) => construirRespuestaError(error, res);

export const crearCita = async (req, res) => {
    try {
        validarObjetoBody(req.body, [
            'cliente', 'mascota', 'empleado', 'sede', 'servicio', 'fechaInicio', 'observaciones'
        ]);
        const esCliente = obtenerRol(req.userFound) === ROLES.CLIENTE;
        const camposRequeridos = ['mascota', 'empleado', 'sede', 'servicio', 'fechaInicio'];
        if (!esCliente) camposRequeridos.push('cliente');

        for (const campo of camposRequeridos) {
            if (req.body[campo] === undefined || req.body[campo] === '') {
                throw crearErrorValidacion(`El campo '${campo}' es obligatorio`);
            }
        }

        for (const campo of ['mascota', 'empleado', 'sede', 'servicio']) {
            validarId(req.body[campo], campo);
        }
        if (!esCliente) validarId(req.body.cliente, 'cliente');
        if (typeof req.body.fechaInicio !== 'string') {
            throw crearErrorValidacion('fechaInicio debe ser una fecha en formato ISO');
        }
        if (req.body.observaciones !== undefined && typeof req.body.observaciones !== 'string') {
            throw crearErrorValidacion('observaciones debe ser texto');
        }

        const cliente = esCliente
            ? req.userFound.cliente?._id || req.userFound._id
            : req.body.cliente;
        const data = await dbCrearCita({
            ...req.body,
            cliente
        }, req.userFound._id);
        return res.status(201).json({ ok: true, data });
    } catch (error) {
        return procesarError(error, res);
    }
};

export const obtenerCitas = async (req, res) => {
    try {
        const filtrosPermitidos = [
            'estado', 'sede', 'empleado', 'mascota', 'desde', 'hasta', 'pagina', 'limite'
        ];
        const campoDesconocido = Object.keys(req.query)
            .find((campo) => !filtrosPermitidos.includes(campo));
        if (campoDesconocido) {
            throw crearErrorValidacion(`El filtro '${campoDesconocido}' no está permitido`);
        }

        const { estado, sede, empleado, mascota, desde, hasta, pagina, limite } = req.query;
        if (estado && !ESTADOS_CITA.includes(estado)) {
            throw crearErrorValidacion('estado no es válido');
        }
        for (const [campo, valor] of Object.entries({ sede, empleado, mascota })) {
            if (valor) validarId(valor, campo);
        }
        for (const [campo, valor] of Object.entries({ desde, hasta })) {
            if (valor !== undefined && (typeof valor !== 'string' || !valor.trim())) {
                throw crearErrorValidacion(`${campo} debe ser una fecha en formato ISO`);
            }
        }
        for (const [campo, valor] of Object.entries({ pagina, limite })) {
            if (valor !== undefined && !/^[1-9]\d*$/.test(valor)) {
                throw crearErrorValidacion(`${campo} debe ser un entero positivo`);
            }
        }
        if (limite !== undefined && Number(limite) > 100) {
            throw crearErrorValidacion('limite no puede ser mayor que 100');
        }

        const filtros = { estado, sede, empleado, mascota, desde, hasta };
        const paginacion = { pagina, limite };
        const data = await dbObtenerCitas(filtros, paginacion, req.userFound);
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        return procesarError(error, res);
    }
};

export const obtenerCitaPorId = async (req, res) => {
    try {
        validarId(req.params.id, 'id');
        const data = await dbObtenerCitaPorId(req.params.id, req.userFound);
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        return procesarError(error, res);
    }
};

export const actualizarCita = async (req, res) => {
    try {
        validarId(req.params.id, 'id');
        validarObjetoBody(req.body, [
            'fechaInicio', 'mascota', 'empleado', 'sede', 'servicio', 'observaciones', 'motivo'
        ]);
        if (Object.keys(req.body).length === 0) {
            throw crearErrorValidacion('Debe proporcionar al menos un campo para actualizar');
        }

        for (const campo of ['mascota', 'empleado', 'sede', 'servicio']) {
            if (req.body[campo] !== undefined) validarId(req.body[campo], campo);
        }
        for (const campo of ['fechaInicio', 'observaciones', 'motivo']) {
            if (req.body[campo] !== undefined && typeof req.body[campo] !== 'string') {
                throw crearErrorValidacion(`${campo} debe ser texto`);
            }
        }

        const data = await dbActualizarCita(req.params.id, req.body, req.userFound);
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        return procesarError(error, res);
    }
};

export const cancelarCita = async (req, res) => {
    try {
        validarId(req.params.id, 'id');
        validarObjetoBody(req.body, ['motivoCancelacion']);
        if (typeof req.body.motivoCancelacion !== 'string' || !req.body.motivoCancelacion.trim()) {
            throw crearErrorValidacion('motivoCancelacion es obligatorio');
        }

        const data = await dbCancelarCita(
            req.params.id,
            req.body.motivoCancelacion,
            req.userFound
        );
        return res.status(200).json({ ok: true, data });
    } catch (error) {
        return procesarError(error, res);
    }
};
