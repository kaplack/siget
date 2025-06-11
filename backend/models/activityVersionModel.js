const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Activity = require("./activityModel");

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
        model: Activity,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    tipo: {
      type: DataTypes.ENUM("base", "seguimiento"),
      allowNull: false,
    },
    nroVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    avance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    responsable: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sustento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "activity_versions",
    timestamps: true, // createdAt, updatedAt
    indexes: [
      {
        unique: false,
        fields: ["activityId", "tipo", "nroVersion"],
      },
    ],
  }
);

module.exports = ActivityVersion;
