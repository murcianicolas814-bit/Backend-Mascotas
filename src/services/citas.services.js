import mongoose from 'mongoose';
import Cita from '../models/cita.model.js';
import Cliente from '../models/auth/cliente.model.js';
import Empleado from '../models/auth/empleado.model.js';
import Mascota from '../models/mascota.model.js';
import Servicio from '../models/servicio.model.js';
import Sede from '../models/sede.model.js';
import Usuario from '../models/auth/usuario.model.js';
import { resolverPerfilCliente, resolverPerfilVeterinario } from '../helpers/user-orchestrator.helper.js';
import { ROLES } from '../config/constant-roles.js';
import disponibilidadService from './disponibilidadService.js';

const ANTICIPACION_MINIMA_CLIENTE_DIAS = 2;
const ANTICIPACION_CANCELACION_CLIENTE_HORAS = 24;
const ESTADOS_QUE_RESERVAN_HORARIO = ['PROGRAMADA', 'CONFIRMADA'];
const ESTADOS_NO_EDITABLES = ['ATENDIDA', 'NO_ASISTIO', 'CANCELADA'];
const MS_POR_DIA = 24 * 60 * 60 * 1000;

const crearError = (code, message, status) => {
    const error = new Error(message);
    error.code = code;
    error.status = status;
    return error;
};

const errorDeValidacion = (message) => crearError('VALIDATION_ERROR', message, 400);
const errorNoEncontrado = (message) => crearError('NOT_FOUND', message, 404);
const errorSinPermiso = (message) => crearError('FORBIDDEN', message, 403);
const errorConflicto = (message) => crearError('CITA_CONFLICTO', message, 409);

const obtenerRol = (usuario) => usuario?.rol || usuario?.role;
const obtenerId = (valor) => valor?._id || valor;
const idIgual = (a, b) => String(obtenerId(a)) === String(obtenerId(b));

const parsearFechaUtc = (valor, campo) => {
    if (valor instanceof Date) {
        if (!Number.isNaN(valor.getTime())) return valor;
        throw errorDeValidacion(`${campo} debe ser una fecha válida`);
    }

    if (typeof valor !== 'string' || !valor.trim()) {
        throw errorDeValidacion(`${campo} debe ser una fecha válida`);
    }

    const fechaConZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(valor)
        ? valor
        : `${valor}Z`;
    const fecha = new Date(fechaConZona);
    if (Number.isNaN(fecha.getTime())) {
        throw errorDeValidacion(`${campo} debe ser una fecha válida`);
    }
    return fecha;
};

const resolverPerfil = async (resolver, identificador, nombre) => {
    try {
        return await resolver(identificador);
    } catch (error) {
        if (error.name === 'CastError') throw error;
        if (error.name === 'Error') {
            throw errorDeValidacion(error.message || `El perfil de ${nombre} no es válido`);
        }
        throw error;
    }
};

const obtenerUsuarioAutenticado = async (usuarioAutenticado) => {
    const usuarioId = obtenerId(usuarioAutenticado);
    if (!usuarioId) throw errorSinPermiso('Se requiere un usuario autenticado');

    if (usuarioAutenticado.rol) return usuarioAutenticado;

    const usuario = await Usuario.findById(usuarioId).select('rol activo cliente empleado');
    if (!usuario || !usuario.activo) throw errorSinPermiso('El usuario no está activo');
    return usuario;
};

const resolverClienteUsuario = async (usuario) => {
    const cliente = await resolverPerfil(resolverPerfilCliente, usuario._id, 'cliente');
    if (!cliente.activo) throw errorSinPermiso('El perfil de cliente está inactivo');
    return cliente;
};

const resolverEmpleado = async (identificador) => {
    const empleado = await resolverPerfil(resolverPerfilVeterinario, identificador, 'veterinario');
    if (!empleado.activo || !empleado.usuario?.activo) {
        throw errorDeValidacion('El veterinario debe estar activo');
    }
    return empleado;
};

const validarAccesoCita = async (cita, usuarioAutenticado) => {
    const usuario = await obtenerUsuarioAutenticado(usuarioAutenticado);
    const rol = obtenerRol(usuario);

    if ([ROLES.ADMIN, ROLES.RECEPCIONISTA].includes(rol)) return usuario;

    if (rol === ROLES.CLIENTE) {
        const cliente = await resolverClienteUsuario(usuario);
        if (!idIgual(cita.cliente, cliente._id)) {
            throw errorSinPermiso('No tienes permiso para consultar esta cita');
        }
        return usuario;
    }

    if (rol === ROLES.VETERINARIO) {
        const empleado = await resolverEmpleado(usuario._id);
        if (!idIgual(cita.empleado, empleado._id)) {
            throw errorSinPermiso('No tienes permiso para consultar esta cita');
        }
        return usuario;
    }

    throw errorSinPermiso('No tienes permiso para consultar citas');
};

const validarAnticipacionCliente = (fechaInicio, usuario) => {
    if (
        obtenerRol(usuario) === ROLES.CLIENTE &&
        fechaInicio.getTime() < Date.now() + ANTICIPACION_MINIMA_CLIENTE_DIAS * MS_POR_DIA
    ) {
        throw errorDeValidacion('Las citas deben reservarse con al menos 2 días de anticipación');
    }
};

const validarAnticipacionCambio = (fechaInicio, usuario) => {
    if (
        obtenerRol(usuario) === ROLES.CLIENTE &&
        fechaInicio.getTime() - Date.now() < ANTICIPACION_CANCELACION_CLIENTE_HORAS * 60 * 60 * 1000
    ) {
        throw errorConflicto('Solo puedes reprogramar o cancelar con al menos 24 horas de anticipación');
    }
};

const cargarRelacionesCita = (query) => query
    .populate('cliente')
    .populate('mascota')
    .populate('servicio')
    .populate('empleado')
    .populate('sede')
    .populate('creadaPor');

const validarRelacionVet = (servicio, empleado, sede) => {
    if (!servicio.requiereVeterinario) return;

    const atiendeSede = empleado.sedes.some((id) => idIgual(id, sede._id));
    const atiendeServicio = empleado.servicios.some((id) => idIgual(id, servicio._id));
    if (!atiendeSede || !atiendeServicio) {
        throw errorDeValidacion('El veterinario no atiende en la sede o no realiza el servicio seleccionado');
    }
};

const resolverDatosCita = async ({ cliente, mascota, empleado, sede, servicio, fechaInicio }) => {
    const perfilCliente = await resolverPerfil(resolverPerfilCliente, cliente, 'cliente');
    if (!perfilCliente.activo) throw errorDeValidacion('El cliente está inactivo');

    const [mascotaEncontrada, servicioEncontrado, sedeEncontrada, empleadoEncontrado] = await Promise.all([
        Mascota.findById(mascota),
        Servicio.findById(servicio),
        Sede.findById(sede),
        resolverEmpleado(empleado)
    ]);

    if (!mascotaEncontrada) throw errorNoEncontrado('No se encontró la mascota');
    if (!idIgual(mascotaEncontrada.cliente, perfilCliente._id)) {
        throw errorDeValidacion('La mascota no pertenece al cliente indicado');
    }
    if (!mascotaEncontrada.activa) throw errorDeValidacion('La mascota está inactiva');
    if (!servicioEncontrado || servicioEncontrado.estado !== 'Activo') {
        throw errorNoEncontrado('El servicio no existe o está inactivo');
    }
    if (!sedeEncontrada || !sedeEncontrada.activa) {
        throw errorNoEncontrado('La sede no existe o está inactiva');
    }

    validarRelacionVet(servicioEncontrado, empleadoEncontrado, sedeEncontrada);

    const duracionMinutos = Number(servicioEncontrado.duracionMinutos);
    if (!Number.isFinite(duracionMinutos) || duracionMinutos <= 0) {
        throw errorDeValidacion('El servicio no tiene una duración válida configurada');
    }

    const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60 * 1000);
    return {
        cliente: perfilCliente,
        mascota: mascotaEncontrada,
        servicio: servicioEncontrado,
        sede: sedeEncontrada,
        empleado: empleadoEncontrado,
        fechaInicio,
        fechaFin
    };
};

const validarDisponibilidadYSolapamiento = async ({
    empleado,
    sede,
    fechaInicio,
    fechaFin,
    excluirCitaId
}) => {
    const resultado = await disponibilidadService.estaDisponible(
        empleado._id,
        sede._id,
        fechaInicio,
        fechaFin
    );
    if (resultado?.disponible !== true) {
        throw errorConflicto('El veterinario no está disponible en el horario solicitado');
    }

    const filtroSolapamiento = {
        empleado: empleado._id,
        estado: { $in: ESTADOS_QUE_RESERVAN_HORARIO },
        fechaInicio: { $lt: fechaFin },
        fechaFin: { $gt: fechaInicio }
    };
    if (excluirCitaId) filtroSolapamiento._id = { $ne: excluirCitaId };

    const citaSolapada = await Cita.exists(filtroSolapamiento);
    if (citaSolapada) {
        throw errorConflicto('El veterinario ya tiene una cita en ese horario');
    }
};

const agregarCambio = (historial, usuarioId, campo, valorAnterior, valorNuevo, motivo = '') => {
    if (String(valorAnterior ?? '') === String(valorNuevo ?? '')) return;
    historial.push({
        fecha: new Date(),
        usuario: usuarioId,
        campo,
        valorAnterior,
        valorNuevo,
        motivo
    });
};

const validarId = (id, nombre = 'ID') => {
    if (!mongoose.isValidObjectId(id)) throw errorDeValidacion(`${nombre} no tiene un formato válido`);
};

export const dbCrearCita = async (
    { cliente, mascota, empleado, sede, servicio, fechaInicio, observaciones },
    creadaPorId
) => {
    validarId(creadaPorId, 'creadaPorId');
    const usuarioCreador = await Usuario.findById(creadaPorId).select('rol activo cliente');
    if (!usuarioCreador || !usuarioCreador.activo) {
        throw errorSinPermiso('El usuario que crea la cita no existe o está inactivo');
    }

    if (obtenerRol(usuarioCreador) === ROLES.CLIENTE) {
        const clientePropio = await resolverClienteUsuario(usuarioCreador);
        cliente = clientePropio._id;
    }

    validarId(mascota, 'mascota');
    validarId(sede, 'sede');
    validarId(servicio, 'servicio');
    validarId(empleado, 'empleado');

    const inicioUtc = parsearFechaUtc(fechaInicio, 'fechaInicio');
    validarAnticipacionCliente(inicioUtc, usuarioCreador);

    const datosCita = await resolverDatosCita({
        cliente,
        mascota,
        empleado,
        sede,
        servicio,
        fechaInicio: inicioUtc
    });

    await validarDisponibilidadYSolapamiento(datosCita);
    const cita = await Cita.create({
        cliente: datosCita.cliente._id,
        mascota: datosCita.mascota._id,
        servicio: datosCita.servicio._id,
        empleado: datosCita.empleado._id,
        sede: datosCita.sede._id,
        fechaInicio: datosCita.fechaInicio,
        fechaFin: datosCita.fechaFin,
        observaciones,
        creadaPor: usuarioCreador._id
    });

    return cargarRelacionesCita(Cita.findById(cita._id));
};

export const dbObtenerCitas = async (filtros = {}, paginacion = {}, usuarioAutenticado) => {
    const usuario = await obtenerUsuarioAutenticado(usuarioAutenticado);
    const rol = obtenerRol(usuario);
    const query = {};

    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.sede) query.sede = filtros.sede;
    if (filtros.empleado) query.empleado = filtros.empleado;
    if (filtros.mascota) query.mascota = filtros.mascota;

    if (filtros.desde || filtros.hasta) {
        query.fechaInicio = {};
        if (filtros.desde) query.fechaInicio.$gte = parsearFechaUtc(filtros.desde, 'desde');
        if (filtros.hasta) query.fechaInicio.$lte = parsearFechaUtc(filtros.hasta, 'hasta');
        if (
            query.fechaInicio.$gte &&
            query.fechaInicio.$lte &&
            query.fechaInicio.$gte > query.fechaInicio.$lte
        ) {
            throw errorDeValidacion('desde no puede ser posterior a hasta');
        }
    }

    if (rol === ROLES.CLIENTE) {
        const cliente = await resolverClienteUsuario(usuario);
        query.cliente = cliente._id;
    } else if (rol === ROLES.VETERINARIO) {
        const empleado = await resolverEmpleado(usuario._id);
        query.empleado = empleado._id;
    } else if (![ROLES.ADMIN, ROLES.RECEPCIONISTA].includes(rol)) {
        throw errorSinPermiso('No tienes permiso para listar citas');
    }

    const pagina = Math.max(1, Number.parseInt(paginacion.pagina, 10) || 1);
    const limite = Math.min(100, Math.max(1, Number.parseInt(paginacion.limite, 10) || 10));
    const [citas, total] = await Promise.all([
        cargarRelacionesCita(Cita.find(query))
            .sort({ fechaInicio: 1 })
            .skip((pagina - 1) * limite)
            .limit(limite),
        Cita.countDocuments(query)
    ]);

    return { citas, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

export const dbObtenerCitaPorId = async (id, usuarioAutenticado) => {
    validarId(id, 'id');
    const cita = await cargarRelacionesCita(Cita.findById(id));
    if (!cita) throw errorNoEncontrado('No se encontró la cita');
    await validarAccesoCita(cita, usuarioAutenticado);
    return cita;
};

export const dbActualizarCita = async (id, datos, usuarioAutenticado) => {
    const cita = await dbObtenerCitaPorId(id, usuarioAutenticado);
    if (ESTADOS_NO_EDITABLES.includes(cita.estado)) {
        throw errorConflicto(`No se puede editar una cita en estado ${cita.estado}`);
    }

    const usuario = await obtenerUsuarioAutenticado(usuarioAutenticado);
    const nuevaFechaInicio = datos.fechaInicio !== undefined
        ? parsearFechaUtc(datos.fechaInicio, 'fechaInicio')
        : cita.fechaInicio;
    if (datos.fechaInicio !== undefined && nuevaFechaInicio.getTime() !== cita.fechaInicio.getTime()) {
        validarAnticipacionCambio(cita.fechaInicio, usuario);
    }

    const datosRelacionados = await resolverDatosCita({
        cliente: cita.cliente._id,
        mascota: datos.mascota ?? cita.mascota._id,
        empleado: datos.empleado ?? cita.empleado._id,
        sede: datos.sede ?? cita.sede._id,
        servicio: datos.servicio ?? cita.servicio._id,
        fechaInicio: nuevaFechaInicio
    });

    await validarDisponibilidadYSolapamiento({
        ...datosRelacionados,
        excluirCitaId: cita._id
    });

    const motivo = typeof datos.motivo === 'string' ? datos.motivo.trim() : '';
    const cambios = [
        ['fechaInicio', cita.fechaInicio, datosRelacionados.fechaInicio],
        ['fechaFin', cita.fechaFin, datosRelacionados.fechaFin],
        ['mascota', cita.mascota._id, datosRelacionados.mascota._id],
        ['empleado', cita.empleado._id, datosRelacionados.empleado._id],
        ['sede', cita.sede._id, datosRelacionados.sede._id],
        ['servicio', cita.servicio._id, datosRelacionados.servicio._id]
    ];

    if (datos.observaciones !== undefined) {
        cambios.push(['observaciones', cita.observaciones, datos.observaciones]);
    }

    for (const [campo, valorAnterior, valorNuevo] of cambios) {
        agregarCambio(cita.historialCambios, usuario._id, campo, valorAnterior, valorNuevo, motivo);
    }

    cita.fechaInicio = datosRelacionados.fechaInicio;
    cita.fechaFin = datosRelacionados.fechaFin;
    cita.mascota = datosRelacionados.mascota._id;
    cita.empleado = datosRelacionados.empleado._id;
    cita.sede = datosRelacionados.sede._id;
    cita.servicio = datosRelacionados.servicio._id;
    if (datos.observaciones !== undefined) cita.observaciones = datos.observaciones;

    await cita.save();
    return cargarRelacionesCita(Cita.findById(cita._id));
};

export const dbCancelarCita = async (id, motivo, usuarioAutenticado) => {
    const motivoNormalizado = typeof motivo === 'string' ? motivo.trim() : '';
    if (!motivoNormalizado) throw errorDeValidacion('motivoCancelacion es obligatorio');

    const cita = await dbObtenerCitaPorId(id, usuarioAutenticado);
    if (ESTADOS_NO_EDITABLES.includes(cita.estado)) {
        throw errorConflicto(`No se puede cancelar una cita en estado ${cita.estado}`);
    }

    const usuario = await obtenerUsuarioAutenticado(usuarioAutenticado);
    validarAnticipacionCambio(cita.fechaInicio, usuario);

    const canceladaEn = new Date();
    agregarCambio(cita.historialCambios, usuario._id, 'estado', cita.estado, 'CANCELADA', motivoNormalizado);
    agregarCambio(
        cita.historialCambios,
        usuario._id,
        'motivoCancelacion',
        cita.motivoCancelacion,
        motivoNormalizado,
        motivoNormalizado
    );
    agregarCambio(cita.historialCambios, usuario._id, 'canceladaEn', cita.canceladaEn, canceladaEn, motivoNormalizado);
    cita.estado = 'CANCELADA';
    cita.motivoCancelacion = motivoNormalizado;
    cita.canceladaEn = canceladaEn;
    await cita.save();

    return cargarRelacionesCita(Cita.findById(cita._id));
};
