import { Router } from "express";
import * as activos from "../controllers/activo.controller.js";
import { auditoriaGlobal } from "../middlewares/auditoria.middleware.js";

const router = Router();

router.get("/empleado/:codigo", activos.getActivosPorEmpleado);
router.get("/libres", activos.listarActivosLibres);
router.get("/:registro", activos.obtenerActivoPorRegistro);

export default router;
