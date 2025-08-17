const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  changeEmail,
  assignProfile,
  delUser,
  adminCreateUser,
} = require("../controllers/userController");

// middleware for authentication
const { protect } = require("../middleware/authMiddleware");

/* PUBLIC ROUTES */
router.post("/", registerUser);
router.post("/login", loginUser);

/* AUTHENTICATED ROUTES */
router.get("/me", protect, getMe);
//router.patch('/me/password', protect, changeMyPassword);
//router.patch('/me/email', protect, changeMyEmail);

/* ADMIN ROUTES */
// From here on, admin-only user management
router.use(protect /*, authorizeProfile('admin')*/);

// List and create users
router.get("/", getUsers);
router.post("/admin", /* requireOediEmail, */ adminCreateUser); // or reuse registerUser

// Read, update, delete specific user
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, delUser);

// Sensitive admin operations on specific user
router.patch("/:id/password", changePassword);
router.patch("/:id/email", /* requireOediEmail, */ changeEmail);
router.patch("/:id/profile", assignProfile);

module.exports = router;
