// const express = require('express');   // CommonJS
import express from 'express';           // ESModule

import conexion from './config/mongo.config.js';  // Conexion a la base de datos

import usuariosRuta from './routes/usuarios.routes.js';
import categoriasRuta from './routes/categorias.routes.js';
import productosRuta from './routes/productos.routes.js';
import serviciosRuta from './routes/servicios.routes.js';
import authRoute from './routes/auth.routes.js';

const port = process.env.PORT || 3001;

const app = express();      // Instancia de Express

conexion();     // Ejecuta la conexion a la base de datos

// Habilita a la aplicacion para interpretar JSON
app.use( express.json() );

// Definiendo 1 endpoint (ruta de entrada)
app.get('/health', (req, res) => {
    res.json({ msg: 'Servidor de SenaStore Funcionando!' });
});

// Enlazar todas las rutas de la aplicacion
app.use( '/api/usuarios', usuariosRuta );
app.use( '/api/categorias', categoriasRuta );
app.use( '/api/productos', productosRuta );
app.use( '/api/servicios', serviciosRuta)
app.use( '/api/auth', authRoute );




// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});