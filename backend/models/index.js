// models/index.js
// Manual model loader and association definitions
const User = require("./userModel");
const Project = require("./projectModel");
const Activity = require("./activityModel");
const ActivityVersion = require("./activityVersionModel");

// User → Project relationship
User.hasMany(Project, { foreignKey: "userId", onDelete: "CASCADE" });
Project.belongsTo(User, { foreignKey: "userId", as: "user" });

// Project → Activity relationship
Project.hasMany(Activity, { foreignKey: "projectId", onDelete: "CASCADE" });
Activity.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Activity → ActivityVersion relationship
Activity.hasMany(ActivityVersion, {
  foreignKey: "activityId",
  onDelete: "CASCADE",
  as: "versions",
});
ActivityVersion.belongsTo(Activity, {
  foreignKey: "activityId",
  as: "activity",
});

module.exports = {
  User,
  Project,
  Activity,
  ActivityVersion,
};
