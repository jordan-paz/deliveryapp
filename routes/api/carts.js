const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const requireLogin = require("../../middleware/requireLogin");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST api/carts/
// @description   Create/edit cart
// @access        Users
router.post(
  "/",
  [
    requireLogin,
    [
      check("productID", "Please choose a product")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get quantity and productID from client
    const { quantity, productID } = req.body;

    try {
      // See if product exists for productID submitted

      // Check to see if the product id is a valid ObjectId
      if (!isValidObjectId(productID)) {
        return res.status(400).json({ msg: "Invalid Product Id" });
      }
      const product = await Product.findById(productID);
      if (!product) {
        return res.status(400).json({ msg: "Product not found" });
      }

      // See if user already has a cart
      let cart = await Cart.findOne({ user: req.user.id });

      // If user has a cart, add new product to it
      if (cart) {
        const cartItems = cart.items;
        cartItems.unshift({ productID, quantity });
        console.log(cart);
        await Cart.findOneAndUpdate({ items: cartItems });
        return res.json(cart);
      }

      // Cart doesn't exist so make a new cart for user
      cart = new Cart({
        user: req.user.id,
        items: [{ productID, quantity }]
      });

      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectID") {
        return res.status(400).json({ msg: "Product not found" });
      }
      return res.status(500).send("Server Error");
    }
  }
);

// @route         GET api/carts/user/:user_id
// @description   Get a cart by user ID
// @access        Driver
router.get("/user/:user_id", requireLogin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.user_id });
    // If user has a cart, return it
    if (!cart) {
      return res.status(400).json({ msg: "no cart found for this user" });
    }
    return res.json(cart);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

// @route         GET api/carts/me
// @description   Get cart for current user
// @access        Users
router.get("/me", requireLogin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    // If user has a cart, return it
    if (!cart) {
      return res.status(400).json({ msg: "no cart found for this user" });
    }
    return res.json(cart);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

// @route         PUT api/carts/user/:user_id
// @description   Edit a cart by user id
// @access        Users

// @route         DELETE api/carts/:user_id
// @description   Delete a cart by user id
// @access        Users

module.exports = router;
