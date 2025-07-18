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

    nombre: { type: DataTypes.STRING, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
    nroVersion: { type: DataTypes.INTEGER, allowNull: false },

    fechaInicio: { type: DataTypes.DATEONLY },
    fechaFin: { type: DataTypes.DATEONLY },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    responsable: { type: DataTypes.STRING },
    comentario: { type: DataTypes.TEXT },
    predecesorId: { type: DataTypes.STRING },
    avance: { type: DataTypes.INTEGER, defaultValue: 0 },

    sustento: { type: DataTypes.STRING },
    vigente: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "activity_trackings",
    timestamps: true,
  }
);

module.exports = ActivityTracking;
