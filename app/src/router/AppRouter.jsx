import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LayoutBase from "../layout/LayoutBase";
//import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login";
import PrivateRoute from "./PrivateRoute";
import HomeMenu from "../pages/home/Home";
import Actas from "../pages/consultas/Actas";
import ActaCargoPrintRoute from "../pages/consultas/components/ActaCargoPrintRoute";
// import FormularioInicioExpediente from "../pages/inicioExpediente/InicioExpediente";
// import BandejaUAC from "../pages/bandejas/BandejaUAC";
// import BandejaDISET from "../pages/bandejas/BandejaDISET";
// import BandejaDIGER from "../pages/bandejas/BandejaDIGER";
// import BandejaSecretaria from "../pages/bandejas/BandejaSecretaria";
// import BandejaUtra from "../pages/bandejas/BandejaUTRA";
// import FormularioCertificado from "../pages/certificado/Certificado";
// import ListadoCertificados from "../pages/certificado/ListarCertificados";
// import PlantillaCertificado from "../pages/certificado/PlantillaCertificado";
// import RequerimientoNuevo from "../pages/requerimientos/RequerimientoNuevo";
// import Dashboard from "../pages/dashboard/Dashboard";

const AppRouter = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      {/* Ruta de impresión sin layout pero protegida */}
      {/* <Route element={<PrivateRoute />}>
        <Route path="/certificado/imprimir/:id" element={<PlantillaCertificado />} />
      </Route> */}

      {/* Área protegida general con layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<LayoutBase />}>
          <Route index element={<HomeMenu />} />
          <Route path="/ActasCargo" element={<Actas />}></Route>

          {/* Ruta protegida solo para las areas */}
          {/* <Route path="/bandejaUac" element={<PrivateRoute roles={[125, 126, 105]} />}>
            <Route index element={<BandejaUAC />} />
          </Route> */}
        </Route>
      </Route>
      <Route path="/actas/:id/print" element={<ActaCargoPrintRoute />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
