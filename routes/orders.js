const express = require("express");
const router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const requireLogin = require("../middleware/requireLogin");
const requireDriver = require("../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST /orders
// @description   Create order
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
    const { productId } = req.body;
    const quantity = req.body.quantity || 1;
    const notes = req.body.notes || "";

    try {
      // See if user has an active order
      let order = await Order.findOne({ user: req.user.id, active: true });
      if (!order) {
        order = await new Order({
          user: req.user.id,
          products: [{ productId, quantity }],
          active: true,
          status: "sent",
          notes: notes
        });
        await order.save();
        res.json(order);
      } else {
        res.status(400).json({ msg: "You may only place one order at a time" });
      }
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route         GET /orders
// @description   Get all orders
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/:orderId
// @description   Get one order by order ID
// @access        Drivers only
router.get("/:orderId", requireDriver, async (req, res) => {
  const { orderId } = req.params;
  if (!isValidObjectId(orderId)) {
    return res.status(400).json({ msg: "Invalid product ID" });
  }
  try {
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(400).json({ msg: "No order found" });
    }
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/users/:userId
// @description   Get all orders (past and present) made by a user
// @access        Driver Only
router.get("/users/:userId", requireDriver, async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }
  try {
    const orders = await Order.find({ user: userId }).populate("user", [
      "name",
      "profile"
    ]);
    if (!orders) {
      return res.status(400).json({ msg: "No orders found for this user" });
    }
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/drivers/:driverId
// @description   Get all orders assigned to driver
// @access        Driver Only
router.get("/:driverId", requireDriver, async (req, res) => {
  const { driverId } = req.params;
  if (!isValidObjectId(driverId)) {
    return res.status(400).json({ msg: "Invalid driver ID" });
  }
  try {
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/users/me
// @description   Get all orders made by logged in user
// @access        Users
router.get("/me", requireLogin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    if (!orders) {
      return res.status(400).send("No orders found");
    }
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/activeOrders
// @description   Get all active orders
// @access        Drivers only
router.get("/activeOrders", requireDriver, async (req, res) => {
  try {
    const orders = await Order.find({ active: true });
    if (!orders) {
      return res.status(400).send("No active orders found");
    }
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/activeOrders/users/me
// @description   Get logged in user's active order
// @access        Users
router.get("/activeOrders/me", requireLogin, async (req, res) => {
  try {
    const order = await Order.findByOne({ user: req.user.id, active: true });
    if (!order) {
      return res.status(400).send("No order found");
    }
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/activeOrders/drivers/me
// @description   Get all active orders for assigned to driver logged in
// @access        Drivers only
router.get("/activeOrders/me", requireDriver, async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         PUT /orders/acceptOrder
// @description   Asign order to driver, and driver to order
// @access        Private, Driver only
router.put("/orders/acceptOrder/:order_id", requireDriver, async (req, res) => {
  try {
    const driver = await DriverProfile.findOne({ user: req.user.id });
    const order = await Order.findById(req.params.order_id);
    let activeOrders = driver.activeOrders;

    if (order) {
      order.assignedDriver = req.user.id;
      activeOrders.push(req.params.order_id);
      await order.save();
      await driver.save();
      return res.json(driver);
    }
    return res.status(400).json({ msg: "Order not found" });
  } catch (err) {
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT /orders/:status
// @description   Change status of order (accepted, en-route, arrived, completed)
// @access        Private, Driver only

// @route         PUT /orders
// @description   Edit logged in user's current order
// @access        Users
router.put("/activeOrders/me", requireLogin, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user.id,
      active: true
    });
    if (!order) {
      return res.status(400).send("No order found");
    }
    // EDIT ORDER

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         DELETE /orders
// @description   Cancel logged in user's current order
// @access        Users
router.delete("/", requireLogin, async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.user.id, active: true });
    if (!order) {
      return res.status(400).send("No order found");
    }
    await order.remove();
    res.json({ msg: "Order cancelled" });
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

module.exports = router;
