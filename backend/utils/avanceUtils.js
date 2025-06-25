// utils/avanceUtils.js

const { ActivityVersion, Activity, Project } = require("../models");

/**
 * Recursively updates the progress of all parent activities
 */
async function updateParentProgress(activityVersionId) {
  // Get the updated activity version
  const activity = await ActivityVersion.findByPk(activityVersionId);
  if (!activity || !activity.parentId) return;

  // Get all siblings of this activity
  const siblings = await ActivityVersion.findAll({
    where: {
      parentId: activity.parentId,
      tipo: activity.tipo,
      nroVersion: activity.nroVersion,
    },
  });

  // Calculate weighted average
  const totalPlazo = siblings.reduce((sum, act) => sum + (act.plazo || 0), 0);
  const weightedSum = siblings.reduce((sum, act) => {
    return sum + (act.plazo || 0) * (act.avance || 0);
  }, 0);

  const parentProgress =
    totalPlazo > 0 ? Math.round(weightedSum / totalPlazo) : 0;

  // Update parent activity
  await ActivityVersion.update(
    { avance: parentProgress },
    { where: { id: activity.parentId } }
  );

  // Recurse upward
  await updateParentProgress(activity.parentId);
}

/**
 * Updates the global project progress based on root activities
 */
async function updateProjectProgress(activityVersion) {
  const activity = await Activity.findByPk(activityVersion.activityId);
  if (!activity) return;

  const rootActivities = await ActivityVersion.findAll({
    where: {
      tipo: activityVersion.tipo,
      nroVersion: activityVersion.nroVersion,
      parentId: null,
    },
    include: [
      {
        model: Activity,
        as: "activity",
        where: {
          projectId: activity.projectId,
        },
      },
    ],
  });

  const totalPlazo = rootActivities.reduce(
    (sum, act) => sum + (act.plazo || 0),
    0
  );
  const weightedSum = rootActivities.reduce((sum, act) => {
    return sum + (act.plazo || 0) * (act.avance || 0);
  }, 0);

  const projectProgress =
    totalPlazo > 0 ? Math.round(weightedSum / totalPlazo) : 0;

  await Project.update(
    { avance: projectProgress },
    { where: { id: activity.projectId } }
  );
}

module.exports = {
  updateParentProgress,
  updateProjectProgress,
};
