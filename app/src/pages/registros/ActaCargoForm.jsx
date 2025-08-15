import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Typography,
  Grid,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/theme/theme";
import Header from "@/components/Header";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { buscarPorRegistro } from "@/services/activosService";
import { listaEmpleados, listaAreas, listarUbicaciones } from "@/services/empleadosService";
import { crearActaCargo } from "@services/actasService";

const validationSchema = Yup.object().shape({
  Id_Usuario: Yup.number()
    .typeError("Debe ser un número")
    .integer("Entero")
    .positive("Positivo")
    .required("Campo obligatorio"),
  FechaActa: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .required("Campo obligatorio"),
  IdCategoria: Yup.number().oneOf([1, 2], "Valor inválido").required("Campo obligatorio"),
  IdArea: Yup.number()
    .typeError("Debe ser un número")
    .integer("Entero")
    .positive("Positivo")
    .when("IdCategoria", {
      is: 2,
      then: (s) => s.required("Seleccione un área"),
      otherwise: (s) => s.nullable(),
    }),

  NotaMarginal: Yup.string()
    .trim()
    .min(5, "Muy corto")
    .max(500, "Máximo 500 caracteres")
    .required("Campo obligatorio"),
});

const today = dayjs().format("YYYY-MM-DD");

const initialValues = {
  Id_Usuario: "",
  FechaActa: today,
  IdCategoria: 1,
  IdArea: "",
  NotaMarginal: "",
};

const FormularioActaCargo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [areas, setAreas] = useState([]);

  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [errorEmpleados, setErrorEmpleados] = useState(null);
  const [errorAreas, setErrorAreas] = useState(null);

  const [pasesSeleccionados, setPasesSeleccionados] = useState([]);

  const [registroInput, setRegistroInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultadoActivo, setResultadoActivo] = useState(null);

  const [ubicacionDefault, setUbicacionDefault] = useState("");
  const [ubicacionesMap, setUbicacionesMap] = useState({}); // { [registro]: "Ubicación" }

  const [ubicacionesOptions, setUbicacionesOptions] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const getRowKey = (row) => String(row.registro ?? row.id);

  useEffect(() => {
    let alive = true;

    const cargarInicial = async () => {
      setErrorEmpleados(null);
      setErrorAreas(null);
      setLoadingEmpleados(true);
      setLoadingAreas(true);

      const [empRes, areaRes] = await Promise.allSettled([listaEmpleados(), listaAreas()]);

      if (!alive) return;

      // Empleados
      if (empRes.status === "fulfilled") {
        setEmpleados(Array.isArray(empRes.value) ? empRes.value : []);
        setLoadingEmpleados(false);
      } else {
        console.error("Error empleados:", empRes.reason);
        setErrorEmpleados("No se pudo cargar la lista de empleados.");
        setLoadingEmpleados(false);
      }

      // Áreas
      if (areaRes.status === "fulfilled") {
        setAreas(Array.isArray(areaRes.value) ? areaRes.value : []);
        setLoadingAreas(false);
      } else {
        console.error("Error áreas:", areaRes.reason);
        setErrorAreas("No se pudo cargar la lista de áreas.");
        setLoadingAreas(false);
      }
    };

    cargarInicial();
    return () => {
      alive = false;
    };
  }, []);

  const cargarUbicacionesPorArea = async (areaValue) => {
    if (!areaValue) {
      setUbicacionesOptions([]);
      setUbicacionDefault("");
      return;
    }
    try {
      setLoadingUbicaciones(true);
      const data = await listarUbicaciones(areaValue); // ← tu servicio
      // backend: [{value, label}, ...]  -> usamos value como string
      const opts = Array.isArray(data) ? data.map((o) => o.value || o.label).filter(Boolean) : [];
      setUbicacionesOptions(opts);
      // si quieres preseleccionar la primera:
      // setUbicacionDefault(opts[0] ?? "");
    } catch (e) {
      console.error("Error cargando ubicaciones:", e);
      setUbicacionesOptions([]);
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  const handleBuscarRegistro = async () => {
    const reg = Number(registroInput);
    if (!reg || isNaN(reg)) {
      toast.warn("Ingresa un número de registro válido");
      return;
    }
    try {
      setBuscando(true);
      const data = await buscarPorRegistro(reg);
      setResultadoActivo(data);
    } catch (e) {
      console.error(e);
      setResultadoActivo(null);
      toast.error("No se encontró el activo o hubo un error");
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarActual = () => {
    if (!resultadoActivo || resultadoActivo.cargado) return;

    const key = getRowKey(resultadoActivo);
    // si no hay ubicación específica, usa la default (puedes exigirla)
    const ubic = ubicacionesMap[key] ?? ubicacionDefault ?? "";
    setUbicacionesMap((m) => ({ ...m, [key]: ubic }));

    setPasesSeleccionados((prev) => {
      const existe = prev.some((r) => getRowKey(r) === key);
      return existe ? prev : [...prev, resultadoActivo];
    });

    // limpieza visual
    setRegistroInput("");
    setResultadoActivo(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Validación: que todas las filas tengan ubicación (ya sea específica o default)
      const faltanUbicaciones = pasesSeleccionados.filter((n) => {
        const key = getRowKey(n);
        const ub = ubicacionesMap[key] ?? ubicacionDefault ?? n.ubicacion ?? n.Ubicacion ?? "";
        return !ub;
      });
      if (faltanUbicaciones.length) {
        toast.warn("Hay activos sin ubicación. Asigna una ubicación por defecto o específica.");
        setSubmitting(false);
        return;
      }

      const Registros = pasesSeleccionados.map((n) => {
        const key = getRowKey(n);
        const Ubicacion = ubicacionesMap[key] ?? ubicacionDefault ?? n.ubicacion ?? n.Ubicacion ?? "";

        return {
          Registro: Number(n.registro ?? n.Registro),
          Ubicacion,
        };
      });

      const payload = { ...values, Registros };

      try {
        const resp = await crearActaCargo(payload);
        console.log(resp);
        // Si llega status 201 y tiene mensaje de éxito
        if (resp?.message) {
          toast.success(`${resp.message} (ID: ${resp.Id_Acta_Enc})`);
        } else {
          toast.success("Acta guardada correctamente");
        }
      } catch (error) {
        // Si el backend envía error con registros ocupados
        if (error.response?.data?.error) {
          const { error: msg, registrosOcupados } = error.response.data;
          const detalle = registrosOcupados?.length ? `Registros: ${registrosOcupados.join(", ")}` : "";
          toast.error(`${msg} ${detalle}`);
        } else {
          // Error genérico
          toast.error("Ocurrió un error al guardar el acta");
        }
      }
      resetForm();
      setPasesSeleccionados([]);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el acta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="Acta de Cargo" subtitle="Registro de acta y selección de activos" />

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              {/* IZQUIERDA: Formulario */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, backgroundColor: colors.backGround[100] }}>
                  {/* Categoría */}
                  <ToggleButtonGroup
                    value={values.IdCategoria}
                    exclusive
                    onChange={(e, val) => {
                      if (!val) return;
                      setFieldValue("IdCategoria", val);
                      if (val === 1) setFieldValue("IdArea", "");
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton
                      value={1}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: colors.gov[500],
                          color: "#fff",
                          "&:hover": { backgroundColor: colors.gov[600] },
                        },
                      }}
                    >
                      Empleado
                    </ToggleButton>
                    <ToggleButton
                      value={2}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: colors.gov[500],
                          color: "#fff",
                          "&:hover": { backgroundColor: colors.gov[600] },
                        },
                      }}
                    >
                      Área
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Autocomplete
                        options={empleados} // [{ value: CodigoEmpleado, label: Nombre }]
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : `${option.value} - ${option.label}`
                        }
                        // muy importante para que no parpadee al comparar objetos
                        isOptionEqualToValue={(opt, val) => String(opt.value) === String(val.value)}
                        // valor actual: busca por el ID que guarda Formik
                        value={
                          empleados.find((emp) => String(emp.value) === String(values.Id_Usuario)) ||
                          null
                        }
                        onChange={(event, newValue) => {
                          // guarda el ID numérico que espera tu Yup (Id_Usuario)
                          setFieldValue("Id_Usuario", newValue ? Number(newValue.value) : "");
                        }}
                        onBlur={handleBlur}
                        // (opcional) mejor búsqueda por código o nombre
                        filterOptions={(opts, state) => {
                          const q = state.inputValue.toLowerCase().trim();
                          if (!q) return opts;
                          return opts.filter(
                            (o) =>
                              String(o.value).toLowerCase().includes(q) ||
                              String(o.label).toLowerCase().includes(q)
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            color="secondary"
                            label="Empleado"
                            fullWidth
                            error={touched.Id_Usuario && Boolean(errors.Id_Usuario)}
                            helperText={touched.Id_Usuario && errors.Id_Usuario}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        color="secondary"
                        type="date"
                        name="FechaActa"
                        label="Fecha del Acta"
                        value={values.FechaActa}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={touched.FechaActa && Boolean(errors.FechaActa)}
                        helperText={touched.FechaActa && errors.FechaActa}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    {values.IdCategoria === 2 && (
                      <Grid size={{ xs: 12, md: 12 }}>
                        <Autocomplete
                          options={areas} // [{ value, label }]
                          getOptionLabel={(o) => (typeof o === "string" ? o : `${o.value} - ${o.label}`)}
                          isOptionEqualToValue={(opt, val) => String(opt.value) === String(val.value)}
                          value={areas.find((a) => String(a.value) === String(values.IdArea)) || null}
                          onChange={(e, newVal) =>
                            setFieldValue("IdArea", newVal ? Number(newVal.value) : "")
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              color="secondary"
                              label="Área"
                              error={touched.IdArea && Boolean(errors.IdArea)}
                              helperText={touched.IdArea && errors.IdArea}
                            />
                          )}
                          // (opcional) mejor búsqueda por código o nombre
                          filterOptions={(opts, state) => {
                            const q = state.inputValue.toLowerCase().trim();
                            if (!q) return opts;
                            return opts.filter(
                              (o) =>
                                String(o.value).toLowerCase().includes(q) ||
                                String(o.label).toLowerCase().includes(q)
                            );
                          }}
                        />
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        color="secondary"
                        name="NotaMarginal"
                        label="Nota marginal"
                        value={values.NotaMarginal}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        multiline
                        rows={3}
                        error={touched.NotaMarginal && Boolean(errors.NotaMarginal)}
                        helperText={touched.NotaMarginal && errors.NotaMarginal}
                      />
                    </Grid>

                    {/* Vista de Registros seleccionados desde el grid (solo lectura) */}
                    <Grid size={{ xs: 12 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${colors.grey[700]}`,
                          backgroundColor: colors.backGround[100],
                        }}
                      >
                        {/* Encabezado: título + contador + limpiar */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ color: colors.grey[200], fontWeight: 700 }}>
                            Registros seleccionados
                            {pasesSeleccionados.length > 0 && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, color: colors.greenAccent[400] }}
                              >
                                ({pasesSeleccionados.length})
                              </Typography>
                            )}
                          </Typography>

                          {pasesSeleccionados.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPasesSeleccionados([]);
                                setUbicacionesMap({});
                              }}
                              sx={{
                                color: colors.grey[300],
                                "&:hover": { color: colors.gov[500], backgroundColor: "transparent" },
                              }}
                              title="Limpiar todo"
                            >
                              <ClearAllRoundedIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>

                        {pasesSeleccionados.length === 0 ? (
                          <Typography variant="caption" sx={{ color: colors.grey[400] }}>
                            (Agrega registros con el buscador)
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                            {pasesSeleccionados.map((r) => {
                              const key = getRowKey(r);
                              const ub = ubicacionesMap[key] ?? "";
                              const label = `${r.registro}${ub ? ` — ${ub}` : ""}`;
                              const tooltip = [
                                r.descripcion || "",
                                r.serie ? `Serie: ${r.serie}` : "",
                                ub ? `Ubicación: ${ub}` : "",
                              ]
                                .filter(Boolean)
                                .join(" · ");

                              return (
                                <Tooltip key={key} title={tooltip} arrow>
                                  <Chip
                                    size="small"
                                    icon={<Inventory2RoundedIcon sx={{ fontSize: 18 }} />}
                                    label={label}
                                    onDelete={() => {
                                      setPasesSeleccionados((prev) =>
                                        prev.filter((x) => getRowKey(x) !== key)
                                      );
                                      setUbicacionesMap((m) => {
                                        const n = { ...m };
                                        delete n[key];
                                        return n;
                                      });
                                    }}
                                    sx={{
                                      mr: 0.5,
                                      mb: 0.75,
                                      borderRadius: 1.5,
                                      fontWeight: 600,
                                      backgroundColor: colors.blueAccent[600],
                                      color: "#fff",
                                      border: `1px solid ${colors.blueAccent[400]}`,
                                      "& .MuiChip-icon": { color: "#fff", ml: 0.5 },
                                      "& .MuiChip-deleteIcon": { color: "#fff" },
                                      "&:hover": { backgroundColor: colors.blueAccent[500] },
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Stack>
                        )}
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 12 }}>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="secondary"
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <CircularProgress size={20} />}
                      >
                        {isSubmitting ? "Guardando..." : "Guardar Acta"}
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* DERECHA: Selector por registro */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, backgroundColor: colors.backGround[100] }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: colors.grey[100] }}>
                    Seleccionar Activos
                  </Typography>

                  {/* Barra: Registro + Buscar + Ubicación por defecto */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      border: `1px solid ${colors.grey[700]}`,
                      backgroundColor: colors.backGround[100],
                    }}
                  >
                    <Grid container spacing={1.5} alignItems="center">
                      {/* Área */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          size="small"
                          fullWidth
                          options={areas} // [{ value, label }]
                          getOptionLabel={(o) => (typeof o === "string" ? o : `${o.value} - ${o.label}`)}
                          isOptionEqualToValue={(opt, val) => String(opt.value) === String(val.value)}
                          value={areas.find((a) => String(a.value) === String(values.IdArea)) || null}
                          onChange={async (e, newVal) => {
                            const idArea = newVal ? Number(newVal.value) : "";
                            setFieldValue("IdArea", idArea);
                            await cargarUbicacionesPorArea(newVal?.value);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              color="secondary"
                              label="Área"
                              error={touched.IdArea && Boolean(errors.IdArea)}
                              helperText={touched.IdArea && errors.IdArea}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ApartmentRoundedIcon
                                      sx={{ fontSize: 18, color: colors.grey[400] }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                          filterOptions={(opts, state) => {
                            const q = state.inputValue.toLowerCase().trim();
                            if (!q) return opts;
                            return opts.filter(
                              (o) =>
                                String(o.value).toLowerCase().includes(q) ||
                                String(o.label).toLowerCase().includes(q)
                            );
                          }}
                        />
                      </Grid>

                      {/* Ubicación por defecto */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          size="small"
                          fullWidth
                          options={ubicacionesOptions} // array de strings
                          value={ubicacionDefault}
                          onChange={(e, val) => setUbicacionDefault(val ?? "")}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              color="secondary"
                              label="Ubicación por defecto"
                              InputProps={{
                                ...p.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PlaceRoundedIcon sx={{ fontSize: 18, color: colors.grey[400] }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>

                      {/* Registro */}
                      <Grid size={{ xs: 12, md: 8 }}>
                        <TextField
                          fullWidth
                          size="small"
                          color="secondary"
                          label="Ingrese registro"
                          value={registroInput}
                          onChange={(e) => setRegistroInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleBuscarRegistro();
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon sx={{ fontSize: 18, color: colors.grey[400] }} />
                              </InputAdornment>
                            ),
                            endAdornment: registroInput ? (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setRegistroInput("")}
                                  sx={{ color: colors.grey[400] }}
                                >
                                  <ClearRoundedIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                          }}
                        />
                      </Grid>

                      {/* Botón Buscar */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={handleBuscarRegistro}
                          disabled={buscando}
                          startIcon={!buscando && <SearchRoundedIcon />}
                          sx={{
                            height: 40,
                            fontWeight: 700,
                            boxShadow: "none",
                          }}
                        >
                          {buscando ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Buscar"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Resultado de búsqueda */}
                  {resultadoActivo && (
                    <Card
                      sx={{
                        p: 2.5,
                        backgroundColor: colors.backGround[100],
                        border: `1px solid ${colors.grey[700]}`,
                      }}
                    >
                      <Grid container spacing={1.5}>
                        {/* Info del activo */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography
                            variant="h6"
                            sx={{ mb: 0.75, fontWeight: 800, color: colors.grey[100] }}
                          >
                            Registro: {resultadoActivo.registro}
                          </Typography>

                          <Typography variant="body1" sx={{ color: colors.grey[200], mb: 0.25 }}>
                            {resultadoActivo.descripcion}
                          </Typography>

                          <Typography variant="body2" sx={{ color: colors.grey[300] }}>
                            Serie: {resultadoActivo.serie || "-"}
                          </Typography>

                          <Typography variant="body2" sx={{ color: colors.grey[300], mb: 1 }}>
                            Marca/Modelo: {resultadoActivo.marca || "-"} {resultadoActivo.modelo || ""}
                          </Typography>
                        </Grid>

                        {/* Acciones / Ubicación / Estado */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          {/* <Autocomplete
                            size="small"
                            options={ubicacionesOptions}
                            value={ubicacionesMap[getRowKey(resultadoActivo)] ?? ""}
                            onChange={(e, val) =>
                              setUbicacionesMap((m) => ({
                                ...m,
                                [getRowKey(resultadoActivo)]: val ?? "",
                              }))
                            }
                            renderInput={(p) => (
                              <TextField color="secondary" {...p} label="Ubicación (este ítem)" />
                            )}
                            sx={{ mb: 1.25 }}
                          /> */}

                          {resultadoActivo.cargado ? (
                            <>
                              <Chip label="Ya cargado" color="warning" sx={{ mb: 1, fontWeight: 800 }} />
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 900, color: colors.grey[100], lineHeight: 1.2 }}
                              >
                                Acta #{resultadoActivo.cargadoInfo?.Id_Acta_Enc}
                              </Typography>
                              <Typography variant="body1" sx={{ color: colors.grey[200], mt: 0.25 }}>
                                {dayjs(resultadoActivo.cargadoInfo?.FechaActa).format("YYYY-MM-DD")}
                                {" — "}
                                {resultadoActivo.cargadoInfo?.Empleado}
                              </Typography>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={handleAgregarActual}
                              fullWidth
                              sx={{ fontWeight: 800 }}
                            >
                              Agregar a la lista
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Card>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default FormularioActaCargo;
