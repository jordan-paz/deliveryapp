const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const DriverProfile = require("../../models/DriverProfile");
const auth = require("../../middleware/auth");
const requireRole = require("../../middleware/requireRole");

// @route         GET api/drivers
// @description   Get all drivers
// @access        Public
router.get("/", requireRole("driver"), async (req, res) => {
  try {
    const drivers = Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

module.exports = router;
