import { useState } from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { MdInbox, MdMoveToInbox, MdDeviceUnknown, MdFactCheck, MdDashboard } from "react-icons/md";
import { tokens } from "../theme/theme";
import { Box, useTheme, Typography, Tooltip } from "@mui/material";
import { useDispatch } from "react-redux";
import { setLogout } from "../state/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const perfil = useSelector((state) => state.empleado.perfil);
  const CodigoArea = perfil?.perfil?.CodigoArea || {};
  const esJefe = perfil?.cargo?.TipoCargo === 2;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const bandejas = [
    { path: "/dashboard", label: "Dashboard", areas: [105], icon: <MdDashboard size={20} /> },
    { path: "/bandejaUac", label: "Bandeja UAC", areas: [125, 126, 105], icon: <MdMoveToInbox /> },
  ];

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    perfil?.perfil?.Empleado || "Usuario"
  )}&background=1e40af&color=fff`;

  const sidebarStyles = {
    "& .pro-sidebar-inner": {
      background: `${colors.primary[400]} !important`,
    },
    "& .pro-icon-wrapper": {
      backgroundColor: "transparent !important",
    },
    "& .pro-inner-item": {
      padding: "5px 35px 5px 20px !important",
      color: `${colors.grey[100]} !important`, // texto base
    },
    "& .pro-inner-item:hover": {
      color: `${colors.tecnico[500]} !important`, // hover en ambos temas
    },
    "& .pro-menu-item.active": {
      color: `${colors.gov[500]} !important`, // texto activo
    },
    "& .pro-menu-label": {
      color: `${colors.grey[100]} !important`,
    },
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      sx={{
        ...sidebarStyles,
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <SidebarHeader>
          <Box
            display="flex"
            justifyContent={isCollapsed ? "center" : "space-between"}
            alignItems="center"
            p={3}
          >
            {!isCollapsed && (
              <Typography variant="h2" color={colors.grey[100]}>
                SHMG
              </Typography>
            )}
            <Box>
              <FiMenu
                onClick={toggleCollapse}
                style={{
                  color: `${colors.whiteAccent[950]}`,
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              />
            </Box>
          </Box>

          {!isCollapsed && (
            <Box mt="22" mb="10px">
              <Box display="flex" justifyContent="center">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={{ borderRadius: "50%", width: 80, height: 80 }}
                />
              </Box>
              <Box textAlign="center" p={1} mt={1}>
                <Typography variant="h1" color={colors.grey[100]} fontWeight="bold">
                  {perfil?.perfil?.Empleado?.toUpperCase()}
                </Typography>
                <Typography variant="h4" color={colors.greenAccent[500]}>
                  {perfil?.perfil?.cargo?.area?.Acronimo || ""}
                </Typography>
              </Box>
            </Box>
          )}
        </SidebarHeader>

        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<FaHome />} onClick={() => navigate("/")}>
              Inicio
            </MenuItem>

            {bandejas
              .filter((b) => b.areas.includes(CodigoArea))
              .map((b) => {
                const permitido = b.areas.includes(CodigoArea);
                return (
                  <Tooltip
                    key={b.path}
                    title={permitido ? "" : "No tiene permisos para acceder a esta bandeja"}
                    arrow
                  >
                    <span style={{ display: "block" }}>
                      <MenuItem icon={b.icon} onClick={() => navigate(b.path)} disabled={!permitido}>
                        {b.label}
                      </MenuItem>
                    </span>
                  </Tooltip>
                );
              })}
            {!isCollapsed && (
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
                Registros
              </Typography>
            )}
            <MenuItem icon={<MdFactCheck size={20} />} onClick={() => navigate("/CargoForm")}>
              Acta de Cargo
            </MenuItem>
            <MenuItem icon={<MdFactCheck size={20} />} onClick={() => navigate("/DescargoForm")}>
              Acta de descargo
            </MenuItem>

            {!isCollapsed && (
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
                Consultas
              </Typography>
            )}
            <MenuItem icon={<MdDeviceUnknown size={20} />} onClick={() => navigate("/ActasCargo")}>
              Actas de Cargo
            </MenuItem>
            <MenuItem icon={<MdDeviceUnknown size={20} />} onClick={() => navigate("/ActasDescargo")}>
              Actas de Descargo
            </MenuItem>
          </Menu>
        </SidebarContent>

        <SidebarFooter>
          <Menu iconShape="circle">
            <MenuItem
              icon={<FaSignOutAlt />}
              onClick={() => {
                dispatch(setLogout());
                navigate("/logout");
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </SidebarFooter>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
