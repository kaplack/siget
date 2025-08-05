const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

// Route to fetch general dashboard summary

router.get("/", protect, getProfiles);
router.post("/new", protect, createProfile);

router.get("/:id", protect, getProfileById);
router.put("/:id", protect, updateProfile);
router.delete("/:id", protect, deleteProfile);

module.exports = router;
