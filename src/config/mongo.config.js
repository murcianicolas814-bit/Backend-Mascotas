// mongoose.createConnection('mongodb://127.0.0.1:27017/test')
// ODM: 
import mongoose from "mongoose";

const URI_MONGO = process.env.URI_MONGO || 'mongodb://localhost:27017/db-mascotas';

// Sequelize (SQL) -> MySQL, PostgreSQL, MariaDB, SQLite, Microsoft SQL Server
// Prisma (SQL, NoSQL) -> MySQL, PostgreSQL, MariaDB, SQLite, Microsoft SQL Server, MongoDB
const conexion = async () => {
    try {
        await mongoose.connect(URI_MONGO);
        console.log('Conectado a la base de datos MongoDB');
    } catch (error) {
        console.error('Error al conectar a la base de datos:');
    }

}

export default conexion;