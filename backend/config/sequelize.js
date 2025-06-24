require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.NODE_ENV === "production") {
  // ✅ Conexión para producción (Vercel + Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // necesario para Neon
      },
    },
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
      logging: true,
    }
  );
}

module.exports = sequelize;
