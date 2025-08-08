import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, Button } from "@mui/material";

const PrivateRoute = ({ roles = [] }) => {
  const token = useSelector((state) => state.auth.token);
  const perfil = useSelector((state) => state.empleado.perfil);
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const codigoArea = perfil?.perfil?.CodigoArea;

  if (roles.length > 0 && !roles.includes(codigoArea)) {
    return (
      <Box
        height="75vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        px={2}
        //bgcolor="#f5f5f5"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
          alt="Acceso denegado"
          width={140}
          height={140}
          style={{ marginBottom: 20, opacity: 0.8 }}
        />
        <Typography variant="h4" color="error" fontWeight="bold" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="textSecondary">
          No tienes permisos para acceder a esta sección.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3 }}
          onClick={() => (window.location.href = "/SHMG/")}
        >
          Volver al inicio
        </Button>
      </Box>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
