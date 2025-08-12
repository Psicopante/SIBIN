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
