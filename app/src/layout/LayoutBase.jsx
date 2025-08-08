import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEmpleado } from "@/state/empleadoSlice";
import api from "@/services/api";

const LayoutBase = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.empleado.perfil);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (isAuthenticated && user && !perfil) {
        try {
          const res = await api.get(`/empleado/perfil`);
          dispatch(setEmpleado(res.data));
        } catch (err) {
          console.error("Error al cargar perfil del empleado", err);
        }
      }
    };

    cargarPerfil();
  }, [isAuthenticated, user, perfil, dispatch]);

  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      <Sidebar />
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        minWidth={0} // IMPORTANTE para prevenir que Sidebar colapse layout
      >
        <Topbar />
        <Box component="main" p={2} flexGrow={1} overflow="auto" width="100%" height="100%">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutBase;
