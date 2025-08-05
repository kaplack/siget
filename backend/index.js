const express = require("express");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();

const { errorHandler } = require("./middleware/errorMiddleware");
const sequelize = require("./config/sequelize");

const app = express();

console.log("🚀 Iniciando el servidor...".yellow);

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
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/profiles", require("./routes/profileRoutes"));

// Error middleware
app.use(errorHandler);

// Connect to database
sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Conectado a la base de datos SQL".green);
    require("./models"); // Load all models
    return sequelize.sync({ alter: true }); // Use { force: true } only in dev if needed
  })
  .then(() => {
    console.log("🗄️ Tablas sincronizadas");

    // ✅ Start server in any environment (Render or local)
    const PORT = process.env.PORT || 5000;
    const ENV = process.env.NODE_ENV || "development";
    app.listen(PORT, () =>
      console.log(`🚀 Servidor corriendo en ${ENV} en el puerto ${PORT}`.cyan)
    );
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
  });

// Export for Vercel
module.exports = app;
