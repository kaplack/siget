const express = require("express");
const router = express.Router();

const {
  createActivity,
  addActivityVersion,
  getActivitiesByProject,
} = require("../controllers/activityController");

// POST /api/activities → registrar actividad para un proyecto
router.post("/", createActivity);

// POST /api/activities/:activityId/versions → agregar versión a actividad
router.post("/:activityId/versions", addActivityVersion);

// GET /api/projects/:projectId/activities → obtener actividades + versiones
router.get("/project/:projectId", getActivitiesByProject);

module.exports = router;
