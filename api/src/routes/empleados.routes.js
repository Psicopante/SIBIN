import { Router } from "express";
import * as empleado from "../controllers/empleados.controller.js";

const router = Router();

router.get("/perfil", empleado.getPerfilEmpleado);

export default router;
