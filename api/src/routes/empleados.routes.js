import { Router } from "express";
import * as empleado from "../controllers/empleados.controller.js";

const router = Router();

router.get("/perfil", empleado.getPerfilEmpleado);
router.get("/select", empleado.listarEmpleadosSelect);
router.get("/areas", empleado.listarAreas);
router.get("/ubicaciones/:codigoArea", empleado.listarUbicacionesPorArea);

export default router;
