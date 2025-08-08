import prisma from "../config/prismaClient.js";

export const getActivosPorEmpleado = async (req, res) => {
  const { codigo } = req.params;

  try {
    const detalles = await prisma.acta_Detalle.findMany({
      where: {
        Estado: 1,
        encabezado: {
          Id_Usuario: parseInt(codigo),
        },
      },
      include: {
        activo: {
          select: {
            Act_Registro: true,
            Act_Descripcion: true,
            Act_Modelo: true,
            Act_Marca: true,
            Act_Caracteristica: true,
            Act_Color: true,
            Act_Costo: true,
            Act_Observacion: true,
            Act_Ubicacion: true,
          },
        },
        encabezado: {
          select: {
            Id_Acta_Enc: true,
            FechaActa: true,
            categoria: {
              select: {
                Categoria: true,
              },
            },
          },
        },
      },
      orderBy: {
        SistemaFecha: "desc",
      },
    });

    const resultado = detalles.map((item) => ({
      Id_Acta_Det: item.Id_Acta_Det,
      Id_Acta_Enc: item.Id_Acta_Enc,
      Id_Usuario: item.Id_Usuario,
      Registro: item.Registro?.toString(),
      Estado: item.Estado,
      JefeArea: item.JefeArea,
      FechaActa: item.encabezado?.FechaActa,
      CategoriaBien: item.encabezado?.categoria?.Categoria || null,
      activo: item.activo
        ? {
            Act_Registro: item.activo.Act_Registro?.toString(),
            Act_Descripcion: item.activo.Act_Descripcion,
            Act_Modelo: item.activo.Act_Modelo,
            Act_Marca: item.activo.Act_Marca,
            Act_Caracteristica: item.activo.Act_Caracteristica,
            Act_Color: item.activo.Act_Color,
            Act_Costo: item.activo.Act_Costo,
            Act_Observacion: item.activo.Act_Observacion,
            Act_Ubicacion: item.activo.Act_Ubicacion,
          }
        : null,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener activos del empleado:", error);
    res.status(500).json({ error: "Error al obtener activos del empleado." });
  }
};
