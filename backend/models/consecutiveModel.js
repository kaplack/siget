// models/consecutiveModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Consecutive = sequelize.define(
  "Consecutive",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // 'CO' (colaboración) or 'DE' (delegación)
    tipo: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    // Keep nullable for future scopes (e.g., by model or direction)
    modeloConvenio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    lastValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "consecutives",
    timestamps: false,
    indexes: [
      {
        // Unique scope; currently we will use only 'tipo'
        unique: true,
        fields: ["tipo", "modeloConvenio", "direccion"],
        name: "uniq_consecutives_scope",
      },
    ],
  }
);

module.exports = Consecutive;
