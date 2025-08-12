import { Router } from "express";
import * as actas from "../controllers/acta.controller.js";
import { auditoriaGlobal } from "../middlewares/auditoria.middleware.js";

const router = Router();

router.get("/", actas.listarActas);
router.get("/listaDescargo", actas.listarActasDescargo);
router.get("/empleado/:codigo", actas.getActasPorEmpleado);
router.get("/cargo/:id", actas.getActaCargoById);
router.get("/descargo/:id", actas.getActaDescargoById);
router.post("/cargo", actas.crearActaCargo);
router.post("/descargo", actas.crearActaDescargo);

export default router;
