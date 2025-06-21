const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createActivity,
  updateDraftActivity,
  setBaselineForProject,
  getActivitiesByProject,
  deleteActivity,
} = require("../controllers/activityController");

const {
  addTrackingVersion,
} = require("../controllers/activityTrackController");

// POST /api/activities/
// Create a new activity with initial draft version
router.post("/", protect, createActivity);

// PATCH /api/activities/draft/:activityId
// Update draft version of an activity
router.patch("/draft/:activityId", updateDraftActivity);

// POST /api/activities/project/:projectId/set-baseline
// Establish baseline versions for all draft activities in a project
router.post("/project/:projectId/set-baseline", setBaselineForProject);

// DELETE /api/activities/:id
// Delete activity if no versions exist
router.delete("/:id", deleteActivity);

/**********************************************/
// FLEXIBLE FUNCTION
/**********************************************/

// GET /api/activities/project/:projectId/:tipoVersion?
// Retrieve all activities with current version base or seguimiento for a project
router.get(
  "/project/:projectId/:tipoVersion?",
  protect,
  getActivitiesByProject
);

/**********************************************/
// TRCKING ACTIVITIES
/**********************************************/

// POST /api/activities/:activityId/tracking
// Add a new tracking version for an activity
router.post("/:activityId/tracking", addTrackingVersion);

module.exports = router;
