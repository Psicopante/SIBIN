import {
  Box,
  IconButton,
  useTheme,
  Badge,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Popover,
  Button,
} from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "@/theme/theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLogout } from "@/state/authSlice";
import { clearEmpleado } from "@/state/empleadoSlice";
import { persistor } from "@/state/store";
import TopbarSearchActivo from "@/components/TopbarSearchActivo";
// import UserWidget from "@/components/UserWidget"; // ajusta si aún lo usas

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.empleado.perfil);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const [notifications] = useState([]);

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleOpenUser = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUser = () => {
    setAnchorElUser(null);
  };

  const logOut = () => {
    handleCloseUser();
    dispatch(setLogout());
    dispatch(clearEmpleado());
    persistor.purge();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
        Sistema de Bienes Nacionales (SIBIN)
      </Typography>
      <Box />

      <Box display="flex" gap={1}>
        <TopbarSearchActivo />
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>

        <IconButton onClick={handleOpenNotifications}>
          <Badge
            badgeContent={notifications.length}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.7rem",
                minWidth: "16px",
                height: "16px",
              },
            }}
          >
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
          PaperProps={{
            style: { maxHeight: 200, width: "250px" },
          }}
        >
          {notifications.length > 0 ? (
            <List>
              {notifications.map((notification, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={notification} />
                </ListItem>
              ))}
            </List>
          ) : (
            <MenuItem onClick={handleCloseNotifications}>
              <Typography>No hay notificaciones</Typography>
            </MenuItem>
          )}
        </Menu>

        {/* <IconButton>
          <SettingsOutlinedIcon />
        </IconButton> */}

        <Box display="flex" alignItems="center">
          <IconButton aria-describedby="user-popover" onClick={handleOpenUser}>
            <PersonOutlinedIcon />
          </IconButton>

          <Popover
            id="user-popover"
            open={Boolean(anchorElUser)}
            anchorEl={anchorElUser}
            onClose={handleCloseUser}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                p: 2,
                borderRadius: "10px",
                boxShadow: 3,
                maxWidth: 400,
              },
            }}
          >
            {/* Aquí puedes reemplazar con un pequeño resumen del usuario */}
            {perfil ? (
              <>
                <Typography fontWeight="bold" align="center">
                  CCHH: {perfil.perfil.CodigoCCHH}
                </Typography>
                <Typography variant="body2" align="center">
                  {perfil.perfil.Empleado}
                </Typography>
              </>
            ) : (
              <Typography align="center">Cargando datos del perfil...</Typography>
            )}

            <Box mt={2} borderTop={`1px solid ${theme.palette.divider}`} />

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="error"
                startIcon={<PersonOutlinedIcon />}
                onClick={logOut}
                sx={{ width: "100%" }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Popover>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
