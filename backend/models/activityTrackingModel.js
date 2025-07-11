const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

/**
 * Represents a tracking version of an activity (for monitoring progress).
 */
const ActivityTracking = sequelize.define(
  "ActivityTracking",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "activities", key: "id" },
    },
    nroVersion: { type: DataTypes.INTEGER, allowNull: false },
    vigente: { type: DataTypes.BOOLEAN, defaultValue: false },
    nombre: { type: DataTypes.STRING, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
    fechaInicio: { type: DataTypes.DATEONLY },
    fechaFin: { type: DataTypes.DATEONLY },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    avance: { type: DataTypes.INTEGER, defaultValue: 0 },
    responsable: { type: DataTypes.STRING },
    predecesorId: { type: DataTypes.STRING },
    comentario: { type: DataTypes.TEXT },
    sustento: { type: DataTypes.STRING },
  },
  {
    tableName: "activity_trackings",
    timestamps: true,
  }
);

module.exports = ActivityTracking;
