const express = require("express");
const router = express.Router();
const {
  createProject,
  getUserProjects,
  getProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");

//app.use("/api/projects", require("./routes/projectRoutes"));
router.post("/", protect, createProject);
router.get("/user", protect, getUserProjects);
router.get("/project/:id", protect, getProject);

// router.post("/login", loginUser);
// router.get("/me", protect, getMe);

module.exports = router;
