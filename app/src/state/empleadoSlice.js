import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  perfil: null,
};

const empleadoSlice = createSlice({
  name: "empleado",
  initialState,
  reducers: {
    setEmpleado: (state, action) => {
      state.perfil = action.payload;
    },
    clearEmpleado: (state) => {
      state.perfil = null;
    },
  },
});

export const { setEmpleado, clearEmpleado } = empleadoSlice.actions;
export default empleadoSlice.reducer;
