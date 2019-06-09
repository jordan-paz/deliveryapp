const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Product = require("../../models/Product");
const requireLogin = require("../../middleware/requireLogin");
const requireDriver = require("../../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST api/products
// @description   Create product
// @access        Driver
router.post(
  "/",
  [
    requireDriver,
    [
      check("name", "Please enter name of product")
        .not()
        .isEmpty(),
      check("price", "Price is required")
        .not()
        .isEmpty(),
      check("description", "Description is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() == false) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // see if product already exists
      let product = await Product.findOne({ name: req.body.name });

      if (product) {
        return res
          .status(400)
          .json({ msg: "Product with that name already exists" });
      }

      const { name, price, description, imageURLs } = req.body;

      product = await new Product({
        name,
        price,
        description,
        imageURLs
      });

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
// @access        Public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(400).json({ msg: "No products" });
    }
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET api/products/:productId
// @description   Get a product by ID
// @access        Public
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ msg: "Invalid product ID" });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ msg: "No product found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         PUT api/products/:productId
// @description   Edit a product by product ID
// @access        Driver
router.put("/:productId", requireDriver, async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ msg: "Invalid product ID" });
  }

  try {
    let product = await Product.findById(productId);

    const { price, description, imageUrls, name } = req.body;

    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (imageUrls) product.imageUrls = imageUrls;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         DELETE api/products/:product_id
// @description   Delete a product by product ID
// @access        Driver
router.delete("/:productId", requireDriver, async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ msg: "Invalid product ID" });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ msg: "No product found" });
    }
    await product.remove();
    res.json({ msg: "Product removed" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
