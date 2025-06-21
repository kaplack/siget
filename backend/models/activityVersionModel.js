// models/ActivityVersion.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ActivityVersion = sequelize.define(
  "ActivityVersion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "activities",
        key: "id",
      },
    },
    nroVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("borrador", "base", "seguimiento"),
      allowNull: false,
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // puede ser null si es raíz
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    predecesorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sustento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "activity_versions",
    timestamps: true,
  }
);

module.exports = ActivityVersion;
