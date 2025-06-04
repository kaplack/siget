const express = require("express");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv").config();

const { errorHandler } = require("./middleware/errorMiddleware");
const sequelize = require("./config/sequelize");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas base
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenido al API de SIGET - OEDI" });
});

// Rutas de API
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

// Middleware de errores
app.use(errorHandler);

// ▶️ Conexión y sincronización con Sequelize antes de iniciar el servidor
sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Conectado a la base de datos SQL".green);

    // Registrar modelos
    require("./models"); // Este archivo importa todos los modelos

    // 2. Forzar sincronización (solo una vez)
    //return sequelize.sync({ force: true });

    // Crear tablas si no existen
    return sequelize.sync({ alter: true }); // Usa force: true si quieres recrear tablas desde cero
  })
  .then(() => {
    console.log("🗄️ Tablas sincronizadas");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`.cyan);
    });
  })
  .catch((err) => {
    console.error("❌ Error al iniciar la aplicación:", err);
  });
