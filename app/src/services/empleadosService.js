import api from "@/services/api";

export const listaEmpleados = async () => {
  try {
    const response = await api.get(`/empleado/select`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el listado de empleados:", error);
    throw error;
  }
};

export const listaAreas = async () => {
  try {
    const response = await api.get(`/empleado/areas`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el listado de areas:", error);
    throw error;
  }
};

export const listarUbicaciones = async (codigoArea) => {
  try {
    const response = await api.get(`/empleado/ubicaciones/${codigoArea}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el listado de areas:", error);
    throw error;
  }
};
