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
  const { empleado } = req.query; // opcional: validar si pertenece a ese empleado

  try {
    // 1) Activo
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
      return res.status(404).json({ error: `No se encontró un activo con el registro ${registro}` });
    }

    // 2) Estado actual (cargado?)
    const detalleCargado = await prisma.acta_Detalle.findFirst({
      where: { Registro: BigInt(registro), Estado: 1 },
      select: {
        Id_Acta_Enc: true,
        encabezado: {
          select: {
            FechaActa: true,
            Id_Usuario: true,
            empleado: { select: { Empleado: true } },
          },
        },
      },
    });

    const cargado = !!detalleCargado;
    const codigoEmpleadoActual = detalleCargado?.encabezado?.Id_Usuario ?? null;

    // 3) Validación opcional para descargo
    let validacionDescargo = null;
    if (empleado) {
      const empleadoNum = Number(empleado);
      const esDelEmpleado = cargado && codigoEmpleadoActual === empleadoNum;
      validacionDescargo = {
        solicitadoPor: empleadoNum,
        estaCargado: cargado,
        esDelEmpleado,
        puedeDescargar: esDelEmpleado,
        motivo: !cargado
          ? "El activo no está cargado."
          : esDelEmpleado
          ? null
          : "El activo está cargado a otro empleado.",
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

    // 4) HISTORIAL: cargos y descargos del registro
    const [cargos, descargos] = await Promise.all([
      prisma.acta_Detalle.findMany({
        where: { Registro: BigInt(registro) },
        select: {
          Id_Acta_Enc: true,
          FechaDescargo: true, // por si hay fecha de baja marcada aquí
          Id_Acta_Descargo: true,
          encabezado: {
            select: {
              FechaActa: true,
              Id_Usuario: true,
              empleado: { select: { Empleado: true } },
            },
          },
        },
        orderBy: {
          // orden preliminar por fecha de acta
          Id_Acta_Enc: "asc",
        },
      }),
      prisma.acta_Detalle_Descargo.findMany({
        where: { Registro: BigInt(registro) },
        select: {
          Id_Acta_Enc_Des: true,
          FechaDescargo: true,
          encabezadoDesc: {
            select: {
              FechaActa: true,
              Id_Usuario: true,
              empleado: { select: { Empleado: true } },
            },
          },
        },
        orderBy: { FechaDescargo: "asc" },
      }),
    ]);

    // Normalizar historial
    const historial = [
      // Eventos de CARGO
      ...cargos.map((c) => ({
        tipo: "cargo",
        acta: c.Id_Acta_Enc,
        fecha: c.encabezado?.FechaActa ?? null,
        codigoEmpleado: c.encabezado?.Id_Usuario ?? null,
        empleado: c.encabezado?.empleado?.Empleado ?? null,
      })),
      // Eventos de DESCARGO (histórico)
      ...descargos.map((d) => ({
        tipo: "descargo",
        acta: d.Id_Acta_Enc_Des,
        fecha: d.FechaDescargo ?? d.encabezadoDesc?.FechaActa ?? null,
        codigoEmpleado: d.encabezadoDesc?.Id_Usuario ?? null,
        empleado: d.encabezadoDesc?.empleado?.Empleado ?? null,
      })),
    ].sort((a, b) => {
      const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
      const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
      return ta - tb; // ascendente; usa 'tb - ta' si lo quieres más reciente primero
    });

    // 5) Respuesta
    res.json({
      id: Number(activo.Act_Registro),
      registro: Number(activo.Act_Registro),
      descripcion: activo.Act_Caracteristica || "-",
      serie: activo.Act_Serie || "-",
      descripcionDetallada: activo.Act_Descripcion || "-",
      marca: activo.Act_Marca || "-",
      modelo: activo.Act_Modelo || "-",
      color: activo.Act_Color || "-",
      costo: activo.Act_Costo ?? null,
      ubicacion: activo.Act_Ubicacion || "-",
      fechaAdquisicion: activo.Act_FechaAdquisicion ?? null,
      documentoAdquisicion: activo.Act_DocumentoAdquisicion || "-",
      metodoAdquisicion: activo.MetodoAdquisicion || "-",
      sistemaOperativo: activo.Act_SistemaOperativo || "-",
      procesador: activo.Act_Procesador || "-",
      ram: activo.Act_MemoriaRam || "-",
      discoDuro: activo.Act_DiscoDuro || "-",
      fichaSiafi: activo.FichaSiafi || "-",
      cargado,
      cargadoInfo: cargado
        ? {
            Id_Acta_Enc: detalleCargado.Id_Acta_Enc,
            FechaActa: detalleCargado.encabezado?.FechaActa ?? null,
            CodigoEmpleado: codigoEmpleadoActual,
            Empleado: detalleCargado.encabezado?.empleado?.Empleado ?? null,
          }
        : null,
      validacionDescargo, // aparece solo si mandas ?empleado=
      historial, // ← NUEVO: timeline cargo/descargo
    });
  } catch (error) {
    console.error("Error al obtener activo:", error);
    res.status(500).json({ error: "Error al obtener el activo." });
  }
};
