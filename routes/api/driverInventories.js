const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const DriverProfile = require("../../models/DriverProfile");
const Product = require("../../models/Product");
const requireRole = require("../../middleware/requireRole");
const requireLogin = require("../../middleware/requireLogin");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         GET api/driverInventories/:driver_id
// @description   Get a driver inventory by id
// @access        Driver only

// @route         PUT api/driverInventoies/:driver_id
// @description   Edit a driverInventory by driver id
// @access        Driver only

// @route         DELETE api/driverInventoies/:driver_id
// @description   Delete a driverInventory by driver id
// @access        Driver only

module.exports = router;
