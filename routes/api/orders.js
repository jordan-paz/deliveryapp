const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const requireLogin = require("../../middleware/requireLogin");

// @route         GET api/orders
// @description   Get all orders
// @access        Users
router.get("/", requireLogin, async (req, res) => {
  try {
    const orders = Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         POST api/orders
// @description   Create order
// @access        Users
router.post(
  "/",
  [
    requireLogin,
    [
      check("productsOrdered", "Select a product")
        .not()
        .isEmpty(),
      check("address", "Address is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // check to see if user already has a pending order
      let order = await Order.findOne({ user: req.user.id });
      if (order && order.status !== "complete") {
        return res
          .status(400)
          .json({ msg: "You may only place one order at a time" });
      }
      const productsOrdered = await Product.find({
        _id: { $in: req.body.productsOrdered.productID }
      });

      let total = 0;
      for (let i = 0; i < productsOrdered.length; i++) {
        total +=
          productsOrdered[i].price * req.body.productsOrdered[i].quantity;
      }

      // create a new order
      order = await new Order({
        productsOrdered: await productsOrdered,
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

module.exports = router;
