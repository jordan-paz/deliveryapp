const express = require("express");
const router = express.Router();

// Models //
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// Middleware //
const requireLogin = require("../../middleware/requireLogin");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST /api/carts/addProduct/products/:productId
// @description   Add product to cart
// @access        Users
router.post(
  "/addProduct/:productId/:quantity?",
  requireLogin,
  async (req, res) => {
    const productId = req.params.productId;
    const quantity = req.params.quantity || 1;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ msg: "Invalid product id." });
    }
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({ msg: "Product not     found" });
      }

      const cart = await Cart.findOne({ user: req.user.id });

      let { products } = cart;

      for (i = 0; i < quantity; i++) {
        products.push(product);
        cart.total += product.price;
      }
      cart.products = products;
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route         DELETE /api/carts/removeProduct/:productId/:quantity
// @description   Remove item from cart
// @access        Users
router.delete(
  "/removeProduct/:productId/:quantity?",
  requireLogin,
  async (req, res) => {
    const productId = req.params.productId;
    const quantity = req.params.quantity || 1;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ msg: "Invalid product id." });
    }
    try {
      const productToRemove = await Product.findById(productId);
      if (!productToRemove) {
        return res.status(400).json({ msg: "Product not found" });
      }

      let cart = await Cart.findOne({ user: req.user.id });
      let { products, total } = cart;

      for (i = 0; i < quantity; i++) {
        const index = products.indexOf(productToRemove._id);
        if (index !== -1) {
          total -= productToRemove.price;
          products.splice(index, 1);
        }
      }

      cart.products = products;
      cart.total = total;
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route         GET /api/carts/me
// @description   Get user's cart
// @access        Users
router.get("/me", requireLogin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("products");
    if (!cart) return res.status(400).json({ msg: "cart not found " });
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
