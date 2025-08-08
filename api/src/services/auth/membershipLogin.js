import sql from "mssql";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Configuración de conexión a la base de datos Membership
const configMembership = {
  user: process.env.MEMBERSHIP_DB_USER,
  password: process.env.MEMBERSHIP_DB_PASSWORD,
  server: process.env.MEMBERSHIP_DB_SERVER,
  database: process.env.MEMBERSHIP_DB_DATABASE,
  options: {
    encrypt: false, // o true dependiendo de tu SQL Server
    trustServerCertificate: true,
  },
};

// Función para hashear la contraseña usando SHA1 + salt
function getContrasenaHash(password, saltBase64) {
  const passwordBytes = Buffer.from(password, "utf16le");
  const saltBytes = Buffer.from(saltBase64, "base64");
  const combined = Buffer.concat([saltBytes, passwordBytes]);

  const hash = crypto.createHash("sha1");
  hash.update(combined);
  const hashedBytes = hash.digest();

  return hashedBytes.toString("base64");
}

// Función principal para loguear usuario
export async function loginMembership(nombreUsuario, password) {
  let pool;
  try {
    pool = await sql.connect(configMembership);

    // Buscar usuario en base de datos Membership
    const result = await pool.request().input("nombreUsuario", sql.VarChar, nombreUsuario).query(`
        SELECT u.UserName, m.Password, m.PasswordSalt
        FROM aspnet_Users u
        INNER JOIN aspnet_Membership m ON u.UserId = m.UserId
        WHERE u.UserName = @nombreUsuario
      `);

    if (result.recordset.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const user = result.recordset[0];

    // Verificar contraseña
    const hashedInputPassword = getContrasenaHash(password, user.PasswordSalt);

    if (hashedInputPassword !== user.Password) {
      throw new Error("Contraseña incorrecta");
    }

    // Login exitoso
    return {
      username: user.UserName,
    };
  } catch (error) {
    throw new Error(`Error en login Membership: ${error.message}`);
  } finally {
    if (pool) {
      pool.close(); // cerrar conexión manualmente
    }
  }
}
