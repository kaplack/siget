const express = require("express");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorMiddleware");
const sequelize = require("./config/sequelize");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Base route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenido al API de SIGET - OEDI" });
});

// API routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));

// Error middleware
app.use(errorHandler);

// Connect to database
sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Conectado a la base de datos SQL".green);
    require("./models"); // Registra todos los modelos
    return sequelize.sync({ alter: true }); // Puedes usar { force: true } en desarrollo si lo deseas
  })
  .then(() => {
    console.log("🗄️ Tablas sincronizadas");

    // Solo escuchar localmente
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () =>
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`.cyan)
      );
    }
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
  });

// Export for Vercel
module.exports = app;
