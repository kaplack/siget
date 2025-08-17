const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getAgreement,
} = require("../controllers/dashboardController");

// Route to fetch general dashboard summary
router.get("/", getDashboard);

//router.get("/agreement", getAgreement);

module.exports = router;
