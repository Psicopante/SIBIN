import React from "react";
import { Box, Card, CardActionArea, CardContent, Typography, Grid, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme/theme";

import { MdDeviceUnknown, MdFactCheck, MdMoveToInbox } from "react-icons/md";
import Header from "../../components/Header";
import { useSelector } from "react-redux";

const menuItems = [
  {
    title: "Actas de Cargo",
    path: "/iniciarExpediente",
    icon: <MdFactCheck size={40} />,
    description: "Dar inicio del trármite de Homologación.",
    areas: [125, 126, 105],
  },
  {
    title: "Actas de Descargo",
    path: "/bandejaUac",
    icon: <MdMoveToInbox size={40} />,
    description: "Expedientes pendientes de actualización de aviso de cobro.",
    areas: [125, 126, 105],
  },
  {
    title: "Por Registro",
    path: "/bandejaUtra",
    icon: <MdMoveToInbox size={40} />,
    description: "Expedientes en la etapa de admisión.",
    areas: [107, 126, 144, 105],
  },
  {
    title: "Por Usuario",
    path: "/bandejaDiset",
    icon: <MdMoveToInbox size={40} />,
    description: "Expedientes en la etapa de revisión técnica.",
    areas: [117, 118, 119, 105],
  },
  {
    title: "Por Area",
    path: "/bandejaSecretaria",
    icon: <MdMoveToInbox size={40} />,
    description: "Expedientes en la etapa de revisión y aprobación de certificados.",
    areas: [126, 105],
  },
  {
    title: "Total Bienes",
    path: "/listadoCertificados",
    icon: <MdDeviceUnknown size={40} />,
    description: "Listado de certificados generados.",
    public: true,
  },
];

const HomeMenu = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const perfil = useSelector((state) => state.empleado.perfil);
  const CodigoArea = perfil?.perfil?.CodigoArea;

  return (
    <Box>
      <Header title="Accesos rápidos" subtitle="Menú de opciones del sistema" />

      <Grid container spacing={3}>
        {menuItems
          .filter((item) => item.public || item.areas?.includes(CodigoArea))
          .map((item) => (
            <Grid key={item.path} size={{ xs: 12, sm: 6 }}>
              <Card
                sx={{
                  display: "flex",
                  minHeight: 130,
                  maxWidth: 360,
                  minWidth: 600,
                  boxShadow: 4,
                  margin: "0 auto",
                }}
              >
                <Box
                  sx={{
                    width: "8px",
                    backgroundColor: colors.tecnico[500],
                    borderRadius: "4px 0 0 4px",
                  }}
                />
                <CardActionArea
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <Box
                    sx={{
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: colors.gov[500],
                    }}
                  >
                    {item.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default HomeMenu;
