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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/theme/theme";
import Header from "@/components/Header";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { buscarPorRegistro } from "@/services/activosService";
import { listaEmpleados, listaAreas } from "@/services/empleadosService";

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
  IdCategoria: 2,
  IdArea: "",
  NotaMarginal: "",
};

const FormularioActaDescargo = () => {
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

  const handleBuscarRegistro = async (codigoEmpleado) => {
    const reg = Number(registroInput);
    console.log(codigoEmpleado);
    if (!reg || isNaN(reg)) {
      toast.warn("Ingresa un número de registro válido");
      return;
    }
    try {
      setBuscando(true);
      const data = await buscarPorRegistro(reg, { empleado: codigoEmpleado });
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
    if (!resultadoActivo) return;

    if (!resultadoActivo.validacionDescargo?.puedeDescargar) {
      toast.warn("Este activo no pertenece al empleado seleccionado.");
      return;
    }

    const key = getRowKey(resultadoActivo);

    setPasesSeleccionados((prev) => {
      const existe = prev.some((r) => getRowKey(r) === key);
      return existe ? prev : [...prev, resultadoActivo];
    });

    setRegistroInput("");
    setResultadoActivo(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const Registros = pasesSeleccionados.map((n) => Number(n.registro ?? n.Registro));

      const payload = { ...values, Registros };

      console.log("payload a enviar:", payload);
      // const resp = await crearActaDescargo(payload);
      // toast.success("Acta guardada correctamente");
      // resetForm();
      toast.info("Demo: revisa la consola para ver el payload.");
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el acta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="Acta de Descargo" subtitle="Registro de acta de descargo." />

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
                      <Typography variant="body2" sx={{ mb: 0.5, color: colors.grey[300] }}>
                        Registros seleccionados
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                        {pasesSeleccionados.length === 0 ? (
                          <Typography variant="caption" sx={{ color: colors.grey[400] }}>
                            (Agrega registros con el buscador)
                          </Typography>
                        ) : (
                          pasesSeleccionados.map((r) => {
                            const key = getRowKey(r);
                            return (
                              <Chip
                                key={key}
                                size="medium"
                                label={`${r.registro}`}
                                onDelete={() => {
                                  setPasesSeleccionados((prev) =>
                                    prev.filter((x) => getRowKey(x) !== key)
                                  );
                                }}
                                sx={{
                                  backgroundColor: colors.blueAccent[600],
                                  color: "#fff",
                                  fontWeight: "bold",
                                  "&:hover": { backgroundColor: colors.blueAccent[500] },
                                  fontSize: "1rem",
                                  height: "30px",
                                  "& .MuiChip-label": { padding: "0 12px" },
                                }}
                              />
                            );
                          })
                        )}
                      </Box>
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
                  <Box sx={{ mb: 2, display: "flex", gap: 1, alignItems: "center" }}>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                            handleBuscarRegistro(values.Id_Usuario);
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Button
                        fullWidth
                        type="button"
                        variant="outlined"
                        onClick={() => handleBuscarRegistro(values.Id_Usuario)}
                        disabled={buscando}
                        sx={{ height: 40, borderColor: colors.gov[500], color: colors.gov[500] }}
                      >
                        {buscando ? "Buscando..." : "Buscar"}
                      </Button>
                    </Grid>
                  </Box>

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

                        {/* Acciones / Estado */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          {(() => {
                            const puedeDescargar = !!resultadoActivo?.validacionDescargo?.puedeDescargar;
                            const estaCargado = !!resultadoActivo?.cargado;

                            // Caso 1: viene validación (llamaste con ?empleado=)
                            if (resultadoActivo?.validacionDescargo) {
                              return puedeDescargar ? (
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={handleAgregarActual}
                                  fullWidth
                                  sx={{ fontWeight: 800 }}
                                >
                                  Agregar a la lista
                                </Button>
                              ) : (
                                <>
                                  <Chip
                                    label="No se puede descargar: pertenece a otro empleado"
                                    color="warning"
                                    sx={{ mb: 1, fontWeight: 800 }}
                                  />
                                  {estaCargado && (
                                    <>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 900,
                                          color: colors.grey[100],
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        Acta #{resultadoActivo.cargadoInfo?.Id_Acta_Enc}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        sx={{ color: colors.grey[200], mt: 0.25 }}
                                      >
                                        {resultadoActivo.cargadoInfo?.FechaActa
                                          ? dayjs(resultadoActivo.cargadoInfo.FechaActa).format(
                                              "YYYY-MM-DD"
                                            )
                                          : "-"}
                                        {" — "}
                                        {resultadoActivo.cargadoInfo?.Empleado || "-"}
                                      </Typography>
                                    </>
                                  )}
                                </>
                              );
                            }

                            // Caso 2: no vino validación (fallback por si no mandaste ?empleado=)
                            return estaCargado ? (
                              <>
                                <Chip
                                  label="Ya cargado"
                                  color="warning"
                                  sx={{ mb: 1, fontWeight: 800 }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 900, color: colors.grey[100], lineHeight: 1.2 }}
                                >
                                  Acta #{resultadoActivo.cargadoInfo?.Id_Acta_Enc}
                                </Typography>
                                <Typography variant="body1" sx={{ color: colors.grey[200], mt: 0.25 }}>
                                  {resultadoActivo.cargadoInfo?.FechaActa
                                    ? dayjs(resultadoActivo.cargadoInfo.FechaActa).format("YYYY-MM-DD")
                                    : "-"}
                                  {" — "}
                                  {resultadoActivo.cargadoInfo?.Empleado || "-"}
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
                            );
                          })()}
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

export default FormularioActaDescargo;
