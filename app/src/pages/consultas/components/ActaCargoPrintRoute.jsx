// src/pages/consultas/components/ActaCargoPrintRoute.jsx
import { useParams } from "react-router-dom";
import ActaCargoPrint from "./ActaCargoPrint";
import { obtenerActaPorId } from "@/services/actasService";

export default function ActaCargoPrintRoute() {
  const { id } = useParams(); // <- viene de /actas/:id/print
  return (
    <ActaCargoPrint
      fetchActaFn={obtenerActaPorId} // tu servicio
      numeroActa={id} // <- se lo pasamos al compo
      onBack={() => window.history.back()} // opcional
      logoGobUrl="https://app-mapath.conatel.gob.hn/static/media/LogoNuevo.5292d2e850e2b2b6070a.jpg" // opcional
      logoConatelUrl="/imgs/conatel.png" // opcional
      pdfServiceUrl="http://localhost:3000/pdf" // tu micro servicio
    />
  );
}
