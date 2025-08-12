import api from "@/services/api";

export const obtenerActasLibres = async () => {
  try {
    const response = await api.get(`/activos/libres`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los activos libres:", error);
    throw error;
  }
};

export const buscarPorRegistro = async (registro) => {
  try {
    const response = await api.get(`/activos/${registro}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los activos libres:", error);
    throw error;
  }
};
