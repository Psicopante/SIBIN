import express from "express";
import empleados from "./empleados.routes.js";
import actas from "./actas.routes.js";
import activos from "./activos.routes.js";

const router = express.Router();

router.use("/actas", actas);
router.use("/activos", activos);
router.use("/empleado", empleados);

export default router;
