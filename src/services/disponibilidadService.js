const disponibilidadService = {
    async estaDisponible(empleadoId, sedeId, fechaInicio, fechaFin) {
        // TODO: Validar horario laboral, disponibilidades y bloqueos del empleado.
        return { disponible: true };
    }
};

export default disponibilidadService;
