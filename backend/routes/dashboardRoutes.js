const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");

// Route to fetch general dashboard summary
router.get("/", getDashboard);

module.exports = router;
