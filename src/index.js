// const express = require('express');   // CommonJS
import express from 'express';           // ESModule

import conexion from './config/mongo.config.js';  // Conexion a la base de datos

import usuariosRuta from './routes/usuarios.routes.js';
import empleadosRuta from './routes/empleados.routes.js';
import clientesRuta from './routes/clientes.routes.js';
import authRoute from './routes/auth.routes.js';

const port = process.env.PORT || 3001;

const app = express();      // Instancia de Express

conexion();     // Ejecuta la conexion a la base de datos

// Habilita a la aplicacion para interpretar JSON
app.use( express.json() );

// Definiendo 1 endpoint (ruta de entrada)
app.get('/health', (req, res) => {
    res.json({ msg: 'Servidor de ZoloMascotas Funcionando!' });
});

// Enlazar todas las rutas de la aplicacion
app.use( '/api/usuarios', usuariosRuta );
app.use( '/api/empleados', empleadosRuta );
app.use( '/api/clientes', clientesRuta );
app.use( '/api/auth', authRoute );

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
