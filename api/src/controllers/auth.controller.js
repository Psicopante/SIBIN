import { loginMembership } from "../services/auth/membershipLogin.js";
import jwt from "jsonwebtoken"; // para emitir el token JWT
import prisma from "../config/prismaClient.js";

// Función para manejar login Membership
export const loginMembershipController = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await loginMembership(username, password);

    // Buscar empleado y su tipo de cargo
    const empleado = await prisma.view_EmpleadosCH.findFirst({
      where: { UsuarioSITAE: usuario.username },
      select: {
        CodigoEmpleado: true,
        CodigoCargo: true,
        TipoCargo: true,
      },
    });

    if (!empleado) {
      return res.status(404).json({ success: false, message: "Empleado no encontrado." });
    }

    const token = jwt.sign(
      {
        username: usuario.username,
        tipoLogin: "membership",
        codigoEmpleado: empleado.CodigoEmpleado,
        tipoEmpleado: empleado?.TipoCargo || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      user: {
        username: usuario.username,
        id: empleado.CodigoEmpleado,
        tipoEmpleado: empleado?.TipoCargo || null,
      },
      token,
    });
  } catch (error) {
    console.error("Error en loginMembership:", error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};
