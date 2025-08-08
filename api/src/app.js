import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { verificarToken } from "./middlewares/auth.middleware.js";
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
  res.json({ mensaje: "Portal de SIBIN ✅" });
});
app.use("/api", verificarToken, routes);
app.use("/auth", authRoutes);

// Escuchar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
