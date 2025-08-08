// src/config/dbcchh.js
import sql from "mssql";

const configReloj = {
  user: process.env.DB_RELOJ_USER,
  password: process.env.DB_RELOJ_PASS,
  server: process.env.DB_RELOJ_HOST,
  database: "RelojCrossCheck",
  options: {
    encrypt: false, // true si usas Azure
    trustServerCertificate: true,
  },
};

export const getConnectionReloj = async () => {
  try {
    const pool = await sql.connect(configReloj);
    return pool;
  } catch (err) {
    console.error("Error al conectar a la base de datos Reloj:", err.message);
    throw err;
  }
};

export default sql;
