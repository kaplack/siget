// models/Activity.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Activity = sequelize.define(
  "Activity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects", // tabla referenciada
        key: "id",
      },
    },
  },
  {
    tableName: "activities",
    timestamps: true, // createdAt y updatedAt
  }
);

module.exports = Activity;
