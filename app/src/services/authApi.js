import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_LOGIN, //"http://localhost:3000/", // sin `/api` apiDECHEMP
  headers: {
    "Content-Type": "application/json",
  },
});

export default authApi;
