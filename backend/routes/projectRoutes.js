const express = require("express");
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");

//app.use("/api/projects", require("./routes/projectRoutes"));
router.post("/", protect, createProject);
router.get("/user", protect, getUserProjects);
router.get("/project/:id", protect, getProject);

// Update project by ID
// PUT /api/projects/project/:id
// This route is used to update an existing project
router.put("/project/:id", protect, updateProject);

// router.post("/login", loginUser);
// router.get("/me", protect, getMe);

module.exports = router;
