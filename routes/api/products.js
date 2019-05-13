const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Product = require("../../models/Product");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");

// @route         POST api/products
// @description   Create product
// @access        Public
router.post(
  "/",
  [
    requireRole("driver"),
    [
      check("name", "Please enter name of product")
        .not()
        .isEmpty(),
      check("price", "Price is required")
        .not()
        .isEmpty(),
      check("description", "Description is required")
        .not()
        .isEmpty(),
      check("stock", "Stock quantity is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() == false) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productFields = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stock: req.body.stock,
      imageURLs: req.body.imageURLs
    };

    try {
      // see if product already exists
      let product = await Product.findOne({ name: req.body.name });

      if (product) {
        return res
          .status(400)
          .json({ msg: "Product with that name already exists" });
      }

      // if it doesn't exist, then create product
      product = new Product(productFields);

      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(400).send("Server error");
    }
  }
);

// @route         GET api/products
// @description   Get all products
// @access        Users
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET api/products/:product_id
// @description   Get a product by ID
// @access        Users

// @route         PUT api/products/:product_id
// @description   Edit a product by product ID
// @access        Customer

// @route         DELETE api/products/:product_id
// @description   Delete a product by product ID
// @access        Public

module.exports = router;
