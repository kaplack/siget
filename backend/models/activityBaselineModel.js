const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

/**
 * Represents a baseline version of an activity.
 */
const ActivityBaseline = sequelize.define(
  "ActivityBaseline",
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
    plazo: { type: DataTypes.INTEGER },
    responsable: { type: DataTypes.STRING },
    predecesorId: { type: DataTypes.STRING },
    comentario: { type: DataTypes.STRING },
    sustento: { type: DataTypes.STRING },
    vigente: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "activity_baselines",
    timestamps: true,
  }
);

module.exports = ActivityBaseline;
