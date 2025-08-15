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

export const listarActivosLibres = async (req, res) => {
  try {
    const activosLibres = await prisma.tB_Activo.findMany({
      where: {
        // No existe en Acta_Detalle un registro con Estado = 1
        detalles: {
          none: {
            Estado: 1,
          },
        },
      },
      select: {
        Act_Registro: true,
        Act_Descripcion: true,
        Act_Serie: true,
      },
      orderBy: {
        Act_Registro: "asc",
      },
    });

    const resultado = activosLibres.map((a) => ({
      id: Number(a.Act_Registro), // Convertimos BigInt → Int
      registro: Number(a.Act_Registro),
      descripcion: a.Act_Descripcion || "-",
      serie: a.Act_Serie || "-",
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al listar activos libres:", error);
    res.status(500).json({ error: "Error al listar los activos libres." });
  }
};

export const obtenerActivoPorRegistro = async (req, res) => {
  const { registro } = req.params;
  const { empleado } = req.query; // opcional: código del empleado que quiere descargar

  try {
    // 1) Buscar el activo
    const activo = await prisma.tB_Activo.findUnique({
      where: { Act_Registro: BigInt(registro) },
      select: {
        Act_Registro: true,
        Act_Caracteristica: true,
        Act_Serie: true,
        Act_Descripcion: true,
        Act_Marca: true,
        Act_Modelo: true,
        Act_Color: true,
        Act_Costo: true,
        Act_Ubicacion: true,
        Act_FechaAdquisicion: true,
        Act_DocumentoAdquisicion: true,
        MetodoAdquisicion: true,
        Act_SistemaOperativo: true,
        Act_Procesador: true,
        Act_MemoriaRam: true,
        Act_DiscoDuro: true,
        FichaSiafi: true,
      },
    });

    if (!activo) {
      return res.status(404).json({
        error: `No se encontró un activo con el registro ${registro}`,
      });
    }

    // 2) Ver si está cargado (Acta_Detalle con Estado = 1)
    const detalleCargado = await prisma.acta_Detalle.findFirst({
      where: {
        Registro: BigInt(registro),
        Estado: 1,
      },
      select: {
        Id_Acta_Enc: true,
        encabezado: {
          select: {
            FechaActa: true,
            Id_Usuario: true,
            empleado: { select: { Empleado: true } }, // nombre del empleado
          },
        },
      },
    });

    const cargado = !!detalleCargado;
    const codigoEmpleadoActual = detalleCargado?.encabezado?.Id_Usuario ?? null;

    // 3) Si viene ?empleado=xxxx, validar “pertenece al empleado”
    let validacionDescargo = null;
    if (empleado) {
      const empleadoNum = Number(empleado);
      const esDelEmpleado = cargado && codigoEmpleadoActual === empleadoNum;

      validacionDescargo = {
        solicitadoPor: empleadoNum,
        estaCargado: cargado,
        esDelEmpleado, // true si el registro cargado pertenece a ese empleado
        puedeDescargar: esDelEmpleado, // solo puede descargar si esDelEmpleado
        motivo: !cargado
          ? "El activo no está cargado."
          : esDelEmpleado
          ? null
          : "El activo está cargado a otro empleado.",
        // info del “dueño” actual si aplica
        perteneceA: cargado
          ? {
              CodigoEmpleado: codigoEmpleadoActual,
              Empleado: detalleCargado.encabezado?.empleado?.Empleado ?? null,
              Id_Acta_Enc: detalleCargado.Id_Acta_Enc,
              FechaActa: detalleCargado.encabezado?.FechaActa ?? null,
            }
          : null,
      };
    }

    // 4) Respuesta
    res.json({
      id: Number(activo.Act_Registro),
      registro: Number(activo.Act_Registro),
      descripcion: activo.Act_Caracteristica || "-",
      serie: activo.Act_Serie || "-",
      descripcionDetallada: activo.Act_Descripcion || "-",
      marca: activo.Act_Marca || "-",
      modelo: activo.Act_Modelo || "-",
      color: activo.Act_Color || "-",
      costo: activo.Act_Costo || "-",
      ubicacion: activo.Act_Ubicacion || "-",
      fechaAdquisision: activo.Act_FechaAdquisicion || "-",
      documentoAdquisicion: activo.Act_DocumentoAdquisicion || "-",
      metodoAdquisicion: activo.MetodoAdquisicion || "-",
      sistemaOperativo: activo.Act_SistemaOperativo || "-",
      procesador: activo.Act_Procesador || "-",
      ram: activo.Act_MemoriaRam || "-",
      discoDuro: activo.Act_DiscoDuro || "-",
      dichaSiafi: activo.FichaSiafi || "-",
      cargado, // true/false global
      cargadoInfo: cargado
        ? {
            Id_Acta_Enc: detalleCargado.Id_Acta_Enc,
            FechaActa: detalleCargado.encabezado?.FechaActa ?? null,
            CodigoEmpleado: codigoEmpleadoActual,
            Empleado: detalleCargado.encabezado?.empleado?.Empleado ?? null,
          }
        : null,
      validacionDescargo, // solo aparece si mandas ?empleado=
    });
  } catch (error) {
    console.error("Error al obtener activo:", error);
    res.status(500).json({ error: "Error al obtener el activo." });
  }
};
