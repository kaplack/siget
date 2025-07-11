require("./userModel");

const User = require("./userModel");
const Project = require("./projectModel");
const Activity = require("./activityModel");
const ActivityBaseline = require("./activityBaselineModel");
const ActivityTracking = require("./activityTrackingModel");

//Realcion entre Usuario y Proyecto
User.hasMany(Project, {
  foreignKey: "userId",
});
Project.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Relaciones entre Proyecto y Actividades
Project.hasMany(Activity, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});
Activity.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

// Relaciones entre Actividades y linea base
Activity.hasMany(ActivityBaseline, {
  foreignKey: "activityId",
  onDelete: "CASCADE",
  as: "baselines",
});
ActivityBaseline.belongsTo(Activity, {
  foreignKey: "activityId",
  as: "activity",
});

// Relaciones entre Actividades y seguimiento

Activity.hasMany(ActivityTracking, {
  foreignKey: "activityId",
  onDelete: "CASCADE",
  as: "trackings",
});
ActivityTracking.belongsTo(Activity, {
  foreignKey: "activityId",
  as: "activity",
});

// Puedes exportarlos si estás usando este archivo como loader
module.exports = {
  User,
  Project,
  Activity,
  ActivityBaseline,
  ActivityTracking,
};
