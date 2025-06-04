require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PW,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    port: process.env.POSTGRES_PORT,
    logging: false, // puedes poner true si quieres ver las consultas SQL
  }
);

module.exports = sequelize;
