// src/controllers/empleados/getPerfilEmpleado.js
import prisma from "../config/prismaClient.js";

export const getPerfilEmpleado = async (req, res) => {
  try {
    const codigoEmpleado = req.usuario?.codigoEmpleado;

    if (!codigoEmpleado) {
      return res.status(400).json({ error: "Token inválido: código de empleado no encontrado." });
    }

    const perfil = await prisma.view_EmpleadosCH.findUnique({
      where: { CodigoEmpleado: codigoEmpleado },
    });

    if (!perfil) {
      return res.status(404).json({ error: "Empleado no encontrado." });
    }

    res.json({ success: true, perfil });
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const listarEmpleadosSelect = async (req, res) => {
  try {
    const empleados = await prisma.view_EmpleadosCH.findMany({
      select: {
        CodigoEmpleado: true,
        Empleado: true,
      },
      orderBy: {
        Empleado: "asc",
      },
    });

    const resultado = empleados.map((e) => ({
      value: e.CodigoEmpleado,
      label: e.Empleado,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al listar empleados:", error);
    res.status(500).json({ error: "Error al listar los empleados." });
  }
};
