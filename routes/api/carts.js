const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

const removeItemFromCart = async (cart, productID, quantityToRemove, res) => {
  if (!isValidObjectId(productID)) {
    return res.status(400).json({ msg: "Invalid Product Id" });
  }

  const product = await Product.findById(productID);
  if (!product) {
    return res.status(400).json({ msg: "Product not found" });
  }

  const itemIndex = cart.items
    .map(item => item.productID.toString())
    .indexOf(productID);
  if (itemIndex === -1) {
    return res.status(400).json({ msg: "Item is not in cart" });
  }
  if (cart.items[itemIndex].quantity <= quantityToRemove) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity -= quantityToRemove;
  }
  await cart.save();
  res.json(cart);
};

const addItemToCart = async (cart, productID, quantity, res) => {
  if (!isValidObjectId(productID)) {
    return res.status(400).json({ msg: "Invalid Product Id" });
  }

  const product = await Product.findById(productID);
  if (!product) {
    return res.status(400).json({ msg: "Product not found" });
  }

  const itemIndex = cart.items
    .map(item => item.productID.toString())
    .indexOf(productID);
  console.log("index: " + itemIndex);
  console.log("cart items: " + cart.items);
  if (cart.items && itemIndex !== -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.unshift({ productID, quantity });
  }
  await cart.save();
  res.json(cart);
};

// @route         POST api/carts/
// @description   Create a cart
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
      // See if user has a cart
      let cart = await Cart.findOne({ user: req.user.id });
      if (cart) {
        return res.status(400).json({ msg: "User already has a cart" });
      }
      // User doesn't have a cart, so make a new cart for user
      cart = new Cart({
        user: req.user.id
      });

      addItemToCart(cart, productID, quantity);

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

// @route         GET api/carts
// @description   Get all carts
// @access        Driver
router.get("/", [requireLogin, requireRole("driver")], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const carts = await Cart.find();
    return res.json(carts);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

// @route         GET api/carts/user/:user_id
// @description   Get a cart by user ID
// @access        Driver
router.get(
  "/user/:user_id",
  [requireLogin, requireRole("driver")],
  async (req, res) => {
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
  }
);

// @route         GET api/carts/me
// @description   Get current user's cart
// @access        User
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

// @route         PUT api/carts
// @description   Edit current user's cart
// @access        Users
router.put(
  "/",
  [
    requireLogin,
    check("changes", "No changes submitted")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemsToRemove, itemsToAdd } = req.body.changes;

    try {
    } catch (err) {
      return res.status(500).send("Server Error");
    }
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(400).json({ msg: "User does not have a cart" });
    }

    if (itemsToRemove) {
      itemsToRemove.forEach(item =>
        removeItemFromCart(cart, item.productID, item.quantity, res)
      );
    }

    if (itemsToAdd) {
      itemsToAdd.forEach(item =>
        addItemToCart(cart, item.productID, item.quantity, res)
      );
    }
  }
);

// @route         DELETE api/carts
// @description   Delete user's cart
// @access        Users
router.delete("/", requireLogin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(400).json({ msg: "No cart found for this user" });
    }
    await cart.remove();
    res.json({ msg: "Cart removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Cart not found" });
    }
  }
});

module.exports = router;
