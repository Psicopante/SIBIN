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

export const buscarPorRegistro = async (registro, { empleado } = {}) => {
  try {
    const { data } = await api.get(`/activos/${registro}`, {
      // si viene empleado, lo manda como ?empleado=270
      params: empleado != null ? { empleado: Number(empleado) } : undefined,
    });
    return data;
  } catch (error) {
    console.error("Error al buscar activo por registro:", error);
    throw error;
  }
};
