import React, { useEffect, useState } from "react";
import { Box, Card, CircularProgress, Typography, Alert, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme/theme";
import Header from "../../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import { obtenerActas } from "@/services/actasService";
import { dataGridStyles } from "../../styles/stylesGrids";
import { FaEye, FaPrint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const Actas = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarBandeja = async () => {
      try {
        const data = await obtenerActas();
        // Asignar id incremental por posición (1, 2, 3, ...)
        const dataConId = data.map((item, index) => ({
          ...item,
          id: index + 1,
          fechaFormateada: dayjs.utc(item.fecha).format("DD MMM YYYY"),
        }));

        setExpedientes(dataConId);
      } catch (err) {
        console.error("Error al cargar bandeja UAC:", err);
        setError("No se pudo cargar la bandeja de UAC.");
      } finally {
        setLoading(false);
      }
    };

    cargarBandeja();
  }, []);
  const columnas = [
    { field: "id", headerName: "Id", flex: 1, align: "center", headerAlign: "center" },
    { field: "numeroActa", headerName: "Acta", flex: 1, align: "center", headerAlign: "center" },
    { field: "empleado", headerName: "Empleado", flex: 2, align: "center", headerAlign: "center" },
    { field: "categoria", headerName: "Categoria", flex: 1, align: "center", headerAlign: "center" },
    {
      field: "fechaFormateada",
      headerName: "Fecha",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Detalle",
      headerName: "Detalle",
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Ver detalle">
          <IconButton
            onClick={() => console.log("Ver detalle de:", params.row)}
            sx={{
              color: colors.gov[600], // color del ícono
              "&:hover": {
                backgroundColor: colors.gov[100], // fondo al hacer hover
              },
            }}
          >
            <FaEye size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      field: "Imprimir",
      headerName: "Imprimir",
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Imprimir acta">
          <IconButton
            onClick={() => navigate(`/actas/${params.row.numeroActa}/print`)}
            sx={{
              color: colors.greenAccent[600],
              "&:hover": { backgroundColor: colors.greenAccent[100] },
            }}
          >
            <FaPrint size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="Actas de cargo" subtitle="Actas de cargo de los empleados." />
      <Card sx={{ p: 2, mt: 1, backgroundColor: colors.backGround[100] }}>
        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress color="secondary" />
            <Typography mt={2}>Cargando expedientes...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box height="69vh" mt={2}>
            <DataGrid
              rows={expedientes}
              columns={columnas}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              sx={dataGridStyles(colors)}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Actas;
