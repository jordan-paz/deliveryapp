const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Order = require("../../models/Order");
const auth = require("../../middleware/auth");

// @route         GET api/orders
// @description   Get all orders
// @access        Private
router.get("/", auth, async (req, res) => {
  try {
    const orders = Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

module.exports = router;
