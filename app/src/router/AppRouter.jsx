import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LayoutBase from "../layout/LayoutBase";
//import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login";
import PrivateRoute from "./PrivateRoute";
import HomeMenu from "../pages/home/Home";
import Actas from "../pages/consultas/Actas";
import ActasDescargo from "../pages/consultas/ActasDescargo";
import ActaCargoPrintRoute from "../pages/consultas/components/ActaCargoPrintRoute";
import ActaDescargoPrintRoute from "../pages/consultas/components/ActaDescargoPrintRoute";
import ActaCargoForm from "../pages/registros/ActaCargoForm";
import ActaDescargo from "../pages/registros/ActaDescargoForm";

const AppRouter = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

      {/* Área protegida general con layout */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<LayoutBase />}>
          <Route index element={<HomeMenu />} />
          <Route path="/ActasCargo" element={<Actas />} />
          <Route path="/ActasDescargo" element={<ActasDescargo />} />
          <Route path="/CargoForm" element={<ActaCargoForm />} />
          <Route path="/DescargoForm" element={<ActaDescargo />} />

          {/* Ruta protegida solo para las areas */}
          {/* <Route path="/bandejaUac" element={<PrivateRoute roles={[125, 126, 105]} />}>
            <Route index element={<BandejaUAC />} />
          </Route> */}
        </Route>
      </Route>
      <Route path="/actas/:id/print" element={<ActaCargoPrintRoute />} />
      <Route path="/descargos/:id/print" element={<ActaDescargoPrintRoute />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
