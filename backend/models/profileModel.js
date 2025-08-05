const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

// Define the Profile model
const Profile = sequelize.define(
  "Profile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "profiles",
    timestamps: true,
  }
);

module.exports = Profile;
