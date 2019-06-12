const express = require("express");
const router = express.Router();

// Middleware //
const { check, validationResult } = require("express-validator/check");
const requireLogin = require("../../middleware/requireLogin");
const requireDriver = require("../../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// Models //
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");

// @route         POST /orders
// @description   Create order
// @access        Users
router.post("/", requireLogin, async (req, res) => {
  try {
    // See if user has an active order
    let order = await Order.findOne({ user: req.user.id, active: true });

    if (!order) {
      const cart = await Cart.findOne({ user: req.user.id }).populate(
        "products"
      );
      const profile = await CustomerProfile.findOne({ user: req.user.id });

      const notes = req.body.notes || "";
      const { products, total } = cart;

      order = await new Order({
        user: req.user.id,
        products,
        total,
        notes,
        profile,
        active: true,
        status: "sent"
      });
      cart.products = [];
      cart.total = 0;
      await cart.save();
      await order.save();
      res.json(order);
    } else {
      res.status(400).json({ msg: "You may only place one order at a time" });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

// @route         GET /orders
// @description   Get all orders
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", ["name"])
      .populate("profile")
      .populate("products");
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/me
// @description   Get all orders made by logged in user
// @access        Users
router.get("/me", requireLogin, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products");
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
    const orders = await Order.find({ active: true })
      .populate("user", "name")
      .populate("profile");
    if (!orders) {
      return res.status(400).send("No active orders found");
    }
    res.json(orders);
  } catch (err) {
    console.log(err);
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
    const order = await Order.findById(orderId)
      .populate("user", ["name"])
      .populate("products");

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
// @description   Get all orders made by a user
// @access        Driver Only
router.get("/users/:userId", requireDriver, async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(400).json({ msg: "Invalid user ID" });
  }
  try {
    const orders = await Order.find({ user: userId }).populate("products");
    if (!orders) {
      return res.status(400).json({ msg: "No orders found for this user" });
    }
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/activeOrders/me
// @description   Get logged in user's active order
// @access        Users
router.get("/activeOrders/me", requireLogin, async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user.id,
      active: true
    })
      .populate("products")
      .populate("profile");
    if (!order) {
      return res.status(400).send("No order found");
    }
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /activeOrders/drivers/me
// @description   Get all active orders assigned to driver logged in
// @access        Drivers only
router.get("/activeOrders/driver/me", requireDriver, async (req, res) => {
  try {
    const order = await Order.find({
      driver: req.user.id,
      active: true
    })
      .populate("products")
      .populate("profile");
    if (!order) {
      return res.status(400).send("No order found");
    }
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         PUT /acceptOrder/:orderId
// @description   Asign driver to order
// @access        Private, Driver only
router.put("/acceptOrder/:orderId", requireDriver, async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ msg: "Invalid order ID" });
    }
    const order = await Order.findById(orderId);
    if (!order) res.status(400).json({ msg: "Order not found" });
    if (order.driver) {
      return res.status(400).json({ msg: "Order is already assigned" });
    }
    order.driver = req.user.id;
    order.status = "received";
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT /orders/enroute/:orderId
// @description   Change status of order to en route
// @access        Private, Driver only
router.put("/enroute/:orderId", requireDriver, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) res.status(400).json({ msg: "Order not found" });
    if (order.driver == req.user.id) {
      order.status = "En route";
    }
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT /arrived/:orderId
// @description   Change status of order to arrived
// @access        Private, Driver only
router.put("/arrived/:orderId", requireDriver, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ msg: "Order not found" });
    if (order.driver == req.user.id) {
      order.status = "arrived";
    }
    order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT /completed/:orderId
// @description   Change status of order to completed
// @access        Private, Driver only
router.put("/completed/:orderId", requireDriver, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) res.status(400).json({ msg: "Order not found" });
    if (order.driver == req.user.id) {
      order.status = "completed";
      order.active = false;
    }
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         DELETE /orders
// @description   Cancel logged in user's current order
// @access        Users
router.delete("/", requireLogin, async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.user.id, active: true });
    await order.remove();
    res.json({ msg: "Order cancelled" });
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

module.exports = router;
