import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";

const router = Router();

// Ruta para login usando Membership
router.post("/login-membership", auth.loginMembershipController);

export default router;
