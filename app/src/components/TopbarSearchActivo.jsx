// src/components/TopbarSearchActivo.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";
import { tokens } from "@/theme/theme";
import { buscarPorRegistro } from "@/services/activosService";

const fmtFecha = (iso) => (iso ? dayjs(iso).format("DD/MM/YYYY") : "-");
const fmtHNL = (n) =>
  new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(Number(n || 0));

export default function TopbarSearchActivo() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activo, setActivo] = useState(null);
  const [error, setError] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setActivo(null);
    setError(null);
    setLoading(false);
  };

  const doSearch = async () => {
    const reg = Number(query);
    if (!reg || Number.isNaN(reg)) {
      setError("Ingresa un número de registro válido.");
      setOpen(true);
      setActivo(null);
      return;
    }
    setOpen(true);
    setLoading(true);
    setError(null);
    setActivo(null);
    try {
      const data = await buscarPorRegistro(reg);
      setActivo(data);
    } catch (e) {
      setError("No se encontró el activo o hubo un error al consultar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Caja de búsqueda para el Topbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          color="secondary"
          size="small"
          placeholder="Buscar activo por registro…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doSearch();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Inventory2RoundedIcon sx={{ fontSize: 18, color: colors.grey[400] }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 260 }}
        />
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={doSearch}
          startIcon={<SearchRoundedIcon />}
        >
          Buscar
        </Button>
      </Box>

      {/* Modal con resultados */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: colors.backGround[100], // 🎨 color de fondo
            color: colors.grey[100], // opcional: color de texto
          }}
        >
          <Inventory2RoundedIcon />
          Detalle del activo
          <Box sx={{ flex: 1 }} />
          <IconButton onClick={handleClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ backgroundColor: colors.backGround[100] }}>
          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : !activo ? (
            <Typography variant="body2" sx={{ color: colors.grey[300] }}>
              Escribe un número de registro y busca para ver el detalle.
            </Typography>
          ) : (
            <>
              {/* Encabezado principal */}
              <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  Registro: {activo.registro}
                </Typography>
                {activo.cargado ? (
                  <Chip color="warning" size="small" label="CARGADO" />
                ) : (
                  <Chip color="success" size="small" label="DISPONIBLE" />
                )}
                <Chip
                  size="small"
                  label={fmtHNL(activo.costo)}
                  sx={{ backgroundColor: colors.blueAccent[600], color: "#fff" }}
                />
              </Box>

              <Typography sx={{ mb: 1 }}>{activo.descripcion}</Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow label="Serie" value={activo.serie} />
                  <InfoRow
                    label="Marca / Modelo"
                    value={`${activo.marca || "-"} ${activo.modelo || ""}`}
                  />
                  <InfoRow label="Color" value={activo.color} />
                  <InfoRow label="Ubicación" value={activo.ubicacion} />
                  <InfoRow label="Fecha adquisición" value={fmtFecha(activo.fechaAdquisision)} />
                  <InfoRow label="Método adquisición" value={activo.metodoAdquisicion} />
                  <InfoRow label="Documento" value={activo.documentoAdquisicion} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoRow label="Descripción detallada" value={activo.descripcionDetallada} />
                  <InfoRow label="Sistema Operativo" value={activo.sistemaOperativo} />
                  <InfoRow label="Procesador" value={activo.procesador} />
                  <InfoRow label="RAM" value={activo.ram} />
                  <InfoRow label="Disco" value={activo.discoDuro} />
                  <InfoRow label="FICHA SIAFI" value={activo.dichaSiafi} />
                </Grid>
              </Grid>

              {activo.cargado && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Información de cargado
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <InfoRow label="Acta" value={`#${activo.cargadoInfo?.Id_Acta_Enc}`} />
                    </Grid>
                    <Grid item>
                      <InfoRow label="Fecha" value={fmtFecha(activo.cargadoInfo?.FechaActa)} />
                    </Grid>
                    <Grid item xs>
                      <InfoRow
                        label="Empleado"
                        value={`${activo.cargadoInfo?.CodigoEmpleado || ""} - ${
                          activo.cargadoInfo?.Empleado || ""
                        }`}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: colors.backGround[100],
          }}
        >
          {/* Aquí puedes poner acciones como "Agregar a selección", "Abrir acta", etc. */}
          <Button onClick={handleClose} color="secondary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/** Subcomponente compacto para pares etiqueta/valor */
function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
      <Typography sx={{ minWidth: 160, color: "text.secondary" }} variant="body2">
        {label}:
      </Typography>
      <Typography variant="body2">{value || "-"}</Typography>
    </Box>
  );
}
