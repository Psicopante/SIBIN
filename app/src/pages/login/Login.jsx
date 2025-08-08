import { Grid, CssBaseline, Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { tokens } from "../../theme/theme";
import { loginMembership } from "../../services/authService";
import { useDispatch } from "react-redux";
import { setLogin } from "@/state/authSlice";
import { setEmpleado } from "@/state/empleadoSlice";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await loginMembership({ username, password });

      dispatch(
        setLogin({
          user: res.user,
          token: res.token,
        })
      );

      const perfilRes = await api.get(`/empleados/perfil`);
      dispatch(setEmpleado(perfilRes.data));

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Credenciales inválidas.");
      } else {
        setError("Error de red o del servidor.");
      }
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />

      {/* Imagen institucional (lado izquierdo) */}
      <Grid
        flex={1}
        sx={{
          backgroundImage: "url(img/banner.webp)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        size={{ xs: 12, sm: 6, md: 7 }}
        component={Paper}
        elevation={6}
        square
      >
        <Box
          sx={{
            height: "100%",
            mx: 2,
            display: "flex",
            flexDirection: "column",
          }}
        ></Box>
      </Grid>

      {/* Formulario (lado derecho) */}
      <Grid size={{ xs: 12, sm: 6, md: 5 }} component={Paper} elevation={6} square>
        <Box
          sx={{
            height: "100%",
            mx: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <img
              alt="logo"
              src="https://www.conatel.gob.hn/wp-content/uploads/2022/02/cropped-image002-2-332x89.png"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%", maxWidth: 400 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="user"
              label="Usuario"
              name="user"
              autoComplete="user"
              autoFocus
              color="secondary"
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              color="secondary"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} color="secondary">
              Ingresar
            </Button>
            {success && (
              <Alert severity="success" variant="filled" sx={{ mt: 2 }}>
                Autenticación exitosa. Redirigiendo...
              </Alert>
            )}

            {error && (
              <Alert severity="error" variant="filled" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h6" color={colors.grey[300]} align="center" sx={{ mt: 4 }}>
              Comisión Nacional de Telecomunicaciones CONATEL
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
