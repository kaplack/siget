const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const {
  importActivitiesFromExcel,
} = require("../controllers/projectImportController");

const {
  createActivity,
  updateDraftActivity,
  setBaselineForProject,
  getActivitiesByProject,
  deleteActivity,
  deleteAllActivitiesByProject,
} = require("../controllers/activityController");

const {
  addTrackingVersion,
  updateActivityProgress,
} = require("../controllers/activityTrackController");

// POST /api/activities/
// Create a new activity with initial draft version
router.post("/", protect, createActivity);

// PATCH /api/activities/draft/:activityId
// Update draft version of an activity
router.patch("/draft/:activityId", protect, updateDraftActivity);

// POST /api/activities/project/:projectId/set-baseline
// Establish baseline versions for all draft activities in a project
router.post("/project/:projectId/set-baseline", protect, setBaselineForProject);

// DELETE /api/activities/:id
// Delete activity if no versions exist
router.delete("/:id", protect, deleteActivity);

// DELETE /api/activities/project/:projectId/all
// Delete all activities for a project
router.delete("/project/:projectId/all", protect, deleteAllActivitiesByProject);

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
router.post("/:activityId/tracking", protect, addTrackingVersion);

/**********************************************/
// EXCEL IMPORT
/**********************************************/

// POST /api/activities/project/:projectId/import-excel
// Import activities from Excel file
router.post(
  "/project/:projectId/import-excel",
  protect,
  upload.single("file"),
  importActivitiesFromExcel
);

module.exports = router;
