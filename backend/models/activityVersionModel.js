// models/ActivityVersion.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

/**
 * ActivityVersion Model
 *
 * Unifies baseline and tracking records in a single table.
 * - Maintains original column names for backward compatibility.
 * - Adds `tipoVersion` to distinguish baseline vs. tracking.
 * - Includes all fields from ActivityBaseline and ActivityTracking.
 * - All fields are non-nullable with sensible defaults.
 */
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
      references: { model: "activities", key: "id" },
      comment: "Reference to parent Activity",
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      comment: "Activity title",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Parent activity ID for WBS hierarchy",
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Sort order in WBS",
    },
    nroVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Version number for baseline or tracking",
    },
    tipoVersion: {
      type: DataTypes.ENUM("base", "seguimiento"),
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Start date (planned or actual)",
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "End date (planned or actual)",
    },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "Duration in business days",
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      comment: "Person responsible for the activity",
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      comment: "Comments or notes on the activity",
    },
    predecesorId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      comment: "Comma-separated list of predecessor version IDs",
    },
    avance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Progress percentage (0–100)",
    },
    sustento: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      comment: "Justification text (only used for tracking)",
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Indicates if version is active",
    },
    medidasCorrectivas: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    tableName: "activity_versions",
    timestamps: true,
    indexes: [
      { fields: ["activityId"] },
      { fields: ["activityId", "tipoVersion", "nroVersion"] },
    ],
  }
);

module.exports = ActivityVersion;
