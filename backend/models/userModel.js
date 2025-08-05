const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "profiles",
        key: "id",
      },
    },
  },
  {
    tableName: "users",
    timestamps: true, // o true si lo usabas antes
  }
);

module.exports = User;
