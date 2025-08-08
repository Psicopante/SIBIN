import prisma from "../config/prismaClient.js";

/**
 * Registra una entrada de auditoría en la base de datos
 * @param {Object} opciones
 * @param {number} opciones.usuarioId
 * @param {string} opciones.tabla
 * @param {string} opciones.accion
 * @param {object} opciones.datos
 * @param {string} [opciones.ip]
 */
export const registrarAuditoria = async ({ UsuarioSitae, tabla, accion, datos, ip = "" }) => {
  try {
    await prisma.tB_Auditoria.create({
      data: {
        UsuarioSitae,
        TablaAfectada: tabla,
        Accion: accion,
        IP: ip,
        Datos: JSON.stringify(datos),
      },
    });
  } catch (err) {
    console.error("Error al registrar auditoría:", err.message);
  }
};
