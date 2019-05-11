const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const requireLogin = require("../../middleware/requireLogin");

// @route         POST api/driverInventories
// @description   Create a driverInventory
// @access        Driver only

// @route         GET api/driverInventories
// @description   Get all driverInventories
// @access        Customer-facing menu should hide quantities of product on driver.

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
