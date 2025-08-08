import { registrarAuditoria } from "../utils/auditoria.js";

export const auditoriaGlobal = async (req, res, next) => {
  const metodosAuditables = ["POST", "PUT", "PATCH", "DELETE"];

  if (req.usuario?.username && metodosAuditables.includes(req.method)) {
    const datos = {
      body: { ...req.body },
      params: req.params,
      query: req.query,
    };

    // Evitar guardar binarios o contraseñas
    if (datos.body?.password) delete datos.body.password;
    if (datos.body?.archivo) delete datos.body.archivo;

    await registrarAuditoria({
      UsuarioSitae: req.usuario?.username,
      tabla: req.baseUrl, // ejemplo: /api/clientes
      accion: `${req.method} ${req.originalUrl}`,
      datos,
      ip: req.ip,
    });
  }

  next();
};
