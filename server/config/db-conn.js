// Database connection - creates a connection pool to the AudiBird postgres database
import { Pool } from 'pg';

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: process.env.MAX_CONNECTIONS,
    idleTimeoutMillis: process.env.IDLE_TIMEOUT,
    connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT
});


export default db;