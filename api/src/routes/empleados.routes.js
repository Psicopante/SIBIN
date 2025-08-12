import { Router } from "express";
import * as empleado from "../controllers/empleados.controller.js";

const router = Router();

router.get("/perfil", empleado.getPerfilEmpleado);
router.get("/select", empleado.listarEmpleadosSelect);

export default router;
