const express = require("express");
const router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const requireLogin = require("../../middleware/requireLogin");

// @route         POST api/orders
// @description   Create order
// @access        Users
router.post(
  "/",
  [
    requireLogin,
    [
      check("cart", "Your cart is empty")
        .not()
        .isEmpty(),
      check("address", "Address is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Check if the request sent required data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // // check to see if user already has a pending order
    // let order = await Order.findOne({ user: req.user.id });
    // if (order && order.status !== "complete") {
    //   return res
    //     .status(400)
    //     .json({ msg: "You may only place one order at a time" });
    //

    try {
      const order = await new Order({
        orderDetails: req.body.cart,
        user: req.user.id,
        total: total,
        orderStatus: req.body.orderStatus
      });
      await order.save();
      res.json(order);
    } catch (err) {
      console.error(err.message);
      res.status(400).send("Server error");
    }
  }
);

// @route         GET api/orders
// @description   Get all orders
// @access        Drivers only
router.get("/", requireLogin, async (req, res) => {
  try {
    const orders = Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET api/orders/:order_id
// @description   Get an order by order ID
// @access        Driver only

// @route         GET api/orders/:user_id
// @description   Get all orders made by a user
// @access        Driver only

// @route         GET api/orders/me
// @description   Get all orders made by current user
// @access        Users

// @route         PUT api/orders/:order_id
// @description   Edit an order by id
// @access        Users

// @route         DELETE api/orders/:order_id
// @description   Delete an order by id
// @access        Users

module.exports = router;
