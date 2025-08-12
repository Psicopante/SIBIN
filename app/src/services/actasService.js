import api from "@/services/api";
import { render } from "@react-email/render";

export const obtenerActas = async () => {
  try {
    const response = await api.get(`/actas/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las actas:", error);
    throw error;
  }
};

export const obtenerDescargos = async () => {
  try {
    const response = await api.get(`/actas/listaDescargo`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las actas:", error);
    throw error;
  }
};

export const obtenerActaPorId = async (numActa) => {
  try {
    const { data } = await api.get(`/actas/cargo/${encodeURIComponent(numActa)}`);
    return data;
  } catch (error) {
    console.error("Error al obtener el acta:", error);
    throw error;
  }
};

export const obtenerDescargoPorId = async (numActa) => {
  try {
    const { data } = await api.get(`/actas/descargo/${encodeURIComponent(numActa)}`);
    return data;
  } catch (error) {
    console.error("Error al obtener el acta:", error);
    throw error;
  }
};
