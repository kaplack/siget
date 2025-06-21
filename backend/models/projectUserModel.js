const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const ProjectUser = sequelize.define("ProjectUser", {
  projectId: {
    type: DataTypes.INTEGER,
    references: { model: "projects", key: "id" },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: "users", key: "id" },
  },
});

module.exports = ProjectUser;
