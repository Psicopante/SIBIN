import prisma from "../config/prismaClient.js";

export const listarActas = async (req, res) => {
  const { empleado } = req.query;

  try {
    const actas = await prisma.acta_Encabezado.findMany({
      where: {
        empleado: empleado
          ? {
              Empleado: {
                contains: empleado,
              },
            }
          : undefined,
      },
      select: {
        Id_Acta_Enc: true,
        FechaActa: true,
        empleado: {
          select: {
            Empleado: true,
          },
        },
        categoria: {
          select: {
            Categoria: true,
          },
        },
      },
      orderBy: {
        Id_Acta_Enc: "desc",
      },
    });

    const resultado = actas.map((a) => ({
      numeroActa: a.Id_Acta_Enc,
      empleado: a.empleado?.Empleado || "Sin nombre",
      categoria: a.categoria?.Categoria || "Sin categoría",
      fecha: a.FechaActa,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al listar actas:", error);
    res.status(500).json({ error: "Error al listar las actas." });
  }
};

export const listarActasDescargo = async (req, res) => {
  const { empleado } = req.query;

  try {
    const actas = await prisma.acta_Encabezado_Descargo.findMany({
      where: {
        empleado: empleado
          ? {
              Empleado: {
                contains: empleado,
                mode: "insensitive", // búsqueda sin mayúsc/minúsc
              },
            }
          : undefined,
      },
      select: {
        Id_Acta_Enc_Des: true,
        FechaActa: true,
        empleado: {
          select: {
            Empleado: true,
          },
        },
      },
      orderBy: {
        Id_Acta_Enc_Des: "desc",
      },
    });

    const resultado = actas.map((a) => ({
      numeroActa: a.Id_Acta_Enc_Des,
      empleado: a.empleado?.Empleado || "Sin nombre",
      categoria: "Descargo",
      fecha: a.FechaActa,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al listar actas de descargo:", error);
    res.status(500).json({ error: "Error al listar las actas de descargo." });
  }
};

export const getActaCargoById = async (req, res) => {
  const { id } = req.params;

  try {
    const acta = await prisma.acta_Encabezado.findUnique({
      where: { Id_Acta_Enc: parseInt(id) },
      select: {
        Id_Acta_Enc: true,
        FechaActa: true,
        empleado: { select: { CodigoEmpleado: true, Empleado: true, Identidad: true, Area: true } },
        categoria: { select: { Categoria: true } },
        NotaMarginal: true,
        SistemaUsuario: true,
        detalles: {
          select: {
            Id_Acta_Det: true,
            Id_Usuario: true,
            Registro: true,
            Estado: true,
            JefeArea: true,
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
                Act_Serie: true,
                estado: {
                  select: { Es_Descripcion: true },
                },
              },
            },
          },
          orderBy: { Registro: "asc" },
        },
      },
    });

    if (!acta) return res.status(404).json({ error: "Acta de cargo no encontrada." });

    // Normalizar BigInt -> string
    const payload = {
      numeroActa: acta.Id_Acta_Enc,
      fecha: acta.FechaActa,
      empleado: acta.empleado?.Empleado ?? "Sin nombre",
      identidad: acta.empleado?.Identidad ?? null,
      codigoEmpleado: acta.empleado?.CodigoEmpleado ?? null,
      area: acta.empleado?.Area ?? null,
      categoria: acta.categoria?.Categoria ?? "Sin categoría",
      SistemaUsuario: acta.SistemaUsuario,
      NotaMarginal: acta.NotaMarginal,
      detalles: acta.detalles.map((d) => ({
        Id_Acta_Det: d.Id_Acta_Det,
        Id_Usuario: d.Id_Usuario,
        Registro: d.Registro ? d.Registro.toString() : null,
        Estado: d.Estado,
        JefeArea: d.JefeArea,
        activo: d.activo
          ? {
              Act_Registro: d.activo.Act_Registro?.toString(),
              Act_Descripcion: d.activo.Act_Descripcion,
              Act_Modelo: d.activo.Act_Modelo,
              Act_Marca: d.activo.Act_Marca,
              Act_Caracteristica: d.activo.Act_Caracteristica,
              Act_Color: d.activo.Act_Color,
              Act_Costo: d.activo.Act_Costo,
              Act_Observacion: d.activo.Act_Observacion,
              Act_Ubicacion: d.activo.Act_Ubicacion,
              Act_Serie: d.activo.Act_Serie,
              EstadoDescripcion: d.activo.estado?.Es_Descripcion ?? null,
            }
          : null,
      })),
    };

    res.json(payload);
  } catch (error) {
    console.error("Error al obtener acta de cargo:", error);
    res.status(500).json({ error: "Error al obtener acta de cargo." });
  }
};

export const getActaDescargoById = async (req, res) => {
  const { id } = req.params;

  try {
    const acta = await prisma.acta_Encabezado_Descargo.findUnique({
      where: { Id_Acta_Enc_Des: parseInt(id) },
      select: {
        Id_Acta_Enc_Des: true,
        FechaActa: true,
        SistemaUsuario: true,
        NotaMarginal: true,
        empleado: { select: { CodigoEmpleado: true, Empleado: true, Identidad: true, Area: true } },
        detallesDescargo: {
          select: {
            Id_Acta_Det_Des: true,
            Id_Usuario: true,
            Registro: true,
            FechaDescargo: true,
            JefeArea: true,
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
                Act_Serie: true,
                estado: {
                  select: { Es_Descripcion: true },
                },
              },
            },
          },
          orderBy: { Id_Acta_Det_Des: "asc" },
        },
      },
    });

    if (!acta) return res.status(404).json({ error: "Acta de descargo no encontrada." });

    const payload = {
      numeroActa: acta.Id_Acta_Enc_Des,
      fecha: acta.FechaActa,
      empleado: acta.empleado?.Empleado ?? "Sin nombre",
      codigoEmpleado: acta.empleado?.CodigoEmpleado ?? null,
      area: acta.empleado?.Area ?? null,
      identidad: acta.empleado?.Identidad ?? null,
      categoria: "Descargo",
      SistemaUsuario: acta.SistemaUsuario,
      NotaMarginal: acta.NotaMarginal,
      detalles: acta.detallesDescargo.map((d) => ({
        Id_Acta_Det_Des: d.Id_Acta_Det_Des,
        Id_Usuario: d.Id_Usuario,
        Registro: d.Registro ? d.Registro.toString() : null,
        FechaDescargo: d.FechaDescargo,
        JefeArea: d.JefeArea,
        activo: d.activo
          ? {
              Act_Registro: d.activo.Act_Registro?.toString(),
              Act_Descripcion: d.activo.Act_Descripcion,
              Act_Modelo: d.activo.Act_Modelo,
              Act_Marca: d.activo.Act_Marca,
              Act_Caracteristica: d.activo.Act_Caracteristica,
              Act_Color: d.activo.Act_Color,
              Act_Costo: d.activo.Act_Costo,
              Act_Observacion: d.activo.Act_Observacion,
              Act_Ubicacion: d.activo.Act_Ubicacion,
              EstadoDescripcion: d.activo.estado?.Es_Descripcion ?? null,
              Act_Serie: d.activo.Act_Serie,
            }
          : null,
      })),
    };

    res.json(payload);
  } catch (error) {
    console.error("Error al obtener acta de descargo:", error);
    res.status(500).json({ error: "Error al obtener acta de descargo." });
  }
};

export const getActasPorEmpleado = async (req, res) => {
  const { codigo } = req.params;

  try {
    const actas = await prisma.acta_Encabezado.findMany({
      where: {
        Id_Usuario: parseInt(codigo),
      },
      include: {
        detalles: {
          include: {
            activo: true,
          },
        },
      },
      orderBy: {
        FechaActa: "desc",
      },
    });

    const parsed = actas.map((acta) => ({
      ...acta,
      detalles: acta.detalles.map((detalle) => ({
        ...detalle,
        Registro: detalle.Registro?.toString(),
        activo: detalle.activo
          ? {
              ...detalle.activo,
              Act_Registro: detalle.activo.Act_Registro.toString(),
            }
          : null,
      })),
    }));

    res.json(parsed);
  } catch (error) {
    console.error("Error al obtener actas:", error);
    res.status(500).json({ error: "Error al obtener las actas del empleado." });
  }
};

export const crearActaCargo = async (req, res) => {
  const {
    Id_Usuario,
    FechaActa,
    IdCategoria,
    IdArea,
    JefeArea,
    NotaMarginal,
    Archivo,
    SistemaUsuario,
    Registros, // [{ Registro, Ubicacion }]
  } = req.body;

  try {
    // Extraer solo los IDs para la validación
    const idsRegistros = Registros.map((r) => BigInt(r.Registro));

    // Validar si hay activos ya cargados
    const registrosOcupados = await prisma.acta_Detalle.findMany({
      where: {
        Estado: 1,
        Registro: { in: idsRegistros },
      },
      select: {
        Registro: true,
        Id_Usuario: true,
        Id_Acta_Enc: true,
        encabezado: {
          select: {
            FechaActa: true,
          },
        },
      },
    });

    if (registrosOcupados.length > 0) {
      const idsUsuarios = [...new Set(registrosOcupados.map((r) => r.Id_Usuario))];
      const empleados = await prisma.view_EmpleadosCH.findMany({
        where: {
          CodigoEmpleado: { in: idsUsuarios },
        },
        select: {
          CodigoEmpleado: true,
          Empleado: true,
        },
      });

      const empleadoMap = Object.fromEntries(empleados.map((e) => [e.CodigoEmpleado, e.Empleado]));

      const detalleOcupados = registrosOcupados.map((r) => ({
        Registro: r.Registro.toString(),
        CodigoEmpleado: r.Id_Usuario,
        Empleado: empleadoMap[r.Id_Usuario] || "Desconocido",
        Id_Acta_Enc: r.Id_Acta_Enc || null,
        FechaActa: r.encabezado?.FechaActa || null,
      }));

      return res.status(400).json({
        error: "Uno o más registros ya están cargados.",
        registrosOcupados: detalleOcupados,
      });
    }

    // Crear encabezado
    const nuevaActa = await prisma.acta_Encabezado.create({
      data: {
        Id_Usuario,
        //Id_Tipo_Acta: 1, este no iria
        FechaActa: new Date(FechaActa),
        IdCategoria,
        IdArea,
        JefeArea,
        NotaMarginal,
        SistemaUsuario,
      },
    });

    // Crear detalle + actualizar ubicación
    for (const r of Registros) {
      await prisma.acta_Detalle.create({
        data: {
          Id_Usuario,
          Id_Acta_Enc: nuevaActa.Id_Acta_Enc,
          Registro: BigInt(r.Registro),
          Estado: 1,
          JefeArea,
          SistemaFecha: new Date(),
        },
      });

      await prisma.tB_Activo.update({
        where: {
          Act_Registro: BigInt(r.Registro),
        },
        data: {
          Act_Ubicacion: r.Ubicacion,
        },
      });
    }

    res.status(201).json({
      message: "Acta de cargo creada exitosamente",
      Id_Acta_Enc: nuevaActa.Id_Acta_Enc,
    });
  } catch (error) {
    console.error("Error al crear acta de cargo:", error);
    res.status(500).json({ error: "Error al crear acta de cargo." });
  }
};

export const crearActaDescargo = async (req, res) => {
  const {
    Id_Usuario,
    FechaActa,
    IdCategoria,
    IdArea,
    JefeArea,
    NotaMarginal,
    SistemaUsuario,
    Registros, // array de registros a descargar
  } = req.body;

  try {
    // Verificar que los registros estén cargados
    const detallesActivos = await prisma.acta_Detalle.findMany({
      where: {
        Registro: { in: Registros.map((r) => BigInt(r)) },
        Estado: 1,
      },
      select: {
        Id_Acta_Det: true,
        Registro: true,
      },
    });

    const registrosActivos = detallesActivos.map((d) => d.Registro?.toString());
    const registrosNoEncontrados = Registros.filter((r) => !registrosActivos.includes(r.toString()));

    if (registrosNoEncontrados.length > 0) {
      return res.status(400).json({
        error: "Algunos registros no están cargados y no pueden ser descargados.",
        registrosNoEncontrados,
      });
    }

    // Crear encabezado de descargo
    const encabezadoDescargo = await prisma.acta_Encabezado_Descargo.create({
      data: {
        Id_Usuario,
        FechaActa: new Date(FechaActa),
        IdCategoria,
        IdArea,
        JefeArea,
        NotaMarginal,
        SistemaUsuario,
      },
    });

    const fechaHoy = new Date();

    // Insertar detalles en tabla de descargo
    const detallesDescargo = Registros.map((registro) => ({
      Id_Usuario,
      Id_Acta_Enc_Des: encabezadoDescargo.Id_Acta_Enc_Des,
      Registro: BigInt(registro),
      FechaDescargo: fechaHoy,
      JefeArea,
      SistemaFecha: fechaHoy,
    }));

    await prisma.acta_Detalle_Descargo.createMany({
      data: detallesDescargo,
    });

    // Actualizar registros originales en acta_detalle
    await Promise.all(
      Registros.map(async (registro) => {
        await prisma.acta_Detalle.updateMany({
          where: {
            Registro: BigInt(registro),
            Estado: 1,
          },
          data: {
            Estado: 0,
            FechaDescargo: fechaHoy,
            Id_Acta_Descargo: encabezadoDescargo.Id_Acta_Enc_Des,
          },
        });
      })
    );

    return res.status(201).json({
      message: "Acta de descargo creada exitosamente",
      Id_Acta_Enc_Des: encabezadoDescargo.Id_Acta_Enc_Des,
    });
  } catch (error) {
    console.error("Error al crear acta de descargo:", error);
    res.status(500).json({ error: "Error al crear acta de descargo." });
  }
};
