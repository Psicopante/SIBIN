import { createSlice } from "@reduxjs/toolkit";

// Estado inicial: se guarda en localStorage para persistencia
const initialState = {
  themeMode: localStorage.getItem("themeMode") || "dark",
};

const themeSlice = createSlice({
  name: "themeMode",
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", state.themeMode);
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      localStorage.setItem("themeMode", action.payload);
    },
  },
});

export const { toggleThemeMode, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
