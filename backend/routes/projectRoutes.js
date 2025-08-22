const express = require("express");
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  annulUserProject,
  getAllProjects,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const authorizeProfile = require("../middleware/authorizeProfile");

//app.use("/api/projects", require("./routes/projectRoutes"));
router.post("/", protect, createProject);
router.get("/user", protect, getUserProjects);
router.get("/project/:id", protect, getProject);

// Update project by ID
// PUT /api/projects/project/:id
// This route is used to update an existing project
router.put("/project/:id", protect, updateProject);

// delete project by ID
// DELETE /api/projects/delete/:id
// This route is used to delete an existing project
//router.delete("/delete/:id", protect, delUserProject);

// annul project by ID
// PATCH /api/projects/delete/:id
router.patch("/annul/:id", protect, annulUserProject);

// get all projects for admin
// GET /api/projects/delete/:id
// This route is used to get all projects to admins and supervisor
router.get("/admin/all", protect, authorizeProfile("admin"), getAllProjects);

module.exports = router;
