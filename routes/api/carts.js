const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Product = require("../../models/Product");
const User = require("../../models/User");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

const productIsInCart = (cart, productId) => {
  return cart.some(product => product.productId === productId);
};

const getProductIndex = (cart, productId) => {
  const index = cart
    .map(product => product.productId.toString())
    .indexOf(productId);
  if (index === -1) {
    return res.status(400).json({ msg: "Item is not in cart" });
  }
  return index;
};

const removeItemFromCart = (cart, productId, quantityToRemove) => {
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ msg: "Invalid Product Id" });
  }
  const itemIndex = getProductIndex(cart, productId);
  if (cart.products[itemIndex].quantity <= quantityToRemove) {
    cart.products.splice(itemIndex, 1);
  } else {
    cart.products[itemIndex].quantity -= quantityToRemove;
  }
};

const addItemToCart = async (cart, productId, quantity, res) => {
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ msg: "Invalid Product Id" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(400).json({ msg: "Product not found" });
  }

  const productIsInCart = productIsInCart(cart, productId);

  if (productIsInCart) {
    const itemIndex = getProductIndex(cart, products);
    cart.products[itemIndex].quantity += quantity;
  } else {
    cart.products.unshift({ productId, quantity });
  }
};

// @route         POST api/carts/
// @description   Create a cart/ add item to cart
// @access        Users
router.post(
  "/",
  [
    requireLogin,
    [
      check("productId", "Please choose a product")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get quantity and productId from client
    const { quantity, productId } = req.body;

    try {
      // See if user has a cart
      let user = await User.findOne({ _id: req.user.id });
      let cart = user.cart;
      if (!cart) {
        // User doesn't have a cart, so make a new cart for user
        user.cart = [];
      }
      addItemToCart(user.cart, productId, quantity);
      await user.save();
      res.json(user.cart);
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
    const user = await User.findOne({ _id: req.user.id });
    const cart = user.cart;
    // If user has a cart, return it
    if (!cart) {
      return res.status(400).json({ msg: "No cart found for this user" });
    }
    return res.json(cart);
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

// @route         PUT api/carts/removeItem/:productId/:quantity?
// @description   remove item from cart
// @access        Users
router.put(
  "/removeItem/:productId/:quantity?",
  requireLogin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    const quantity = req.params.quantity || 1;

    try {
      const user = User.findById(req.user.id);
      const cart = user.cart;
      if (cart) {
        const inCart = productIsInCart(cart, productId);
        if (inCart) {
          removeItemFromCart(cart, productId, quantity);
          user.save();
          return res.json(user.cart);
        } else {
          return res.status(400).json({ msg: "Item not in cart" });
        }
      }
      return res.status(400).json({ msg: "No cart for this user" });
    } catch (err) {
      return res.status(500).send("Server Error");
    }
  }
);

// @route         DELETE api/carts
// @description   Delete user's cart
// @access        Users
router.delete("/", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const cart = user.cart;
    if (!cart) {
      return res.status(400).json({ msg: "No cart found for this user" });
    }
    user.cart = [];
    await user.save();
    res.json({ msg: "Cart removed" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
