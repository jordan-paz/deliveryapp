const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Product = require("../../models/Product");
const auth = require("../../middleware/auth");

// @route         GET api/products
// @description   Get all products
// @access        Public
router.get("/", async (req, res) => {
  try {
    const products = Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

module.exports = router;
