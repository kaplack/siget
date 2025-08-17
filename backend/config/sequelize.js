// backend/config/sequelize.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

const loggingEnabled = process.env.SEQUELIZE_LOGGING === "true";
const sslRequired = process.env.DB_SSL === "true";

if (process.env.NODE_ENV === "production") {
  // ✅ Conexión para producción (Vercel + Neon)
  sequelize = new Sequelize(process.env.POSTGRES_URI, {
    dialect: "postgres",
    protocol: "postgres",
    logging: loggingEnabled,
    dialectOptions: sslRequired
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  });
} else {
  // ✅ Conexión local (desarrollo con variables separadas)
  sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PW,
    {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

module.exports = sequelize;
