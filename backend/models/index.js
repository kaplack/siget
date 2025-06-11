require("./userModel");

const Project = require("./projectModel");
const Activity = require("./activityModel");
const ActivityVersion = require("./activityVersionModel");

// Relaciones entre Proyecto y Actividades
Project.hasMany(Activity, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});
Activity.belongsTo(Project, {
  foreignKey: "projectId",
});

// Relaciones entre Actividades y sus Versiones
Activity.hasMany(ActivityVersion, {
  foreignKey: "activityId",
  onDelete: "CASCADE",
  as: "versions",
});
ActivityVersion.belongsTo(Activity, {
  foreignKey: "activityId",
  as: "activity",
});

// Puedes exportarlos si estás usando este archivo como loader
module.exports = {
  Project,
  Activity,
  ActivityVersion,
};
