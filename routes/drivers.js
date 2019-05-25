const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Driver = require("../models/Driver");
const User = require("../models/Driver");
const requireLogin = require("../middleware/requireLogin");
const requireDriver = require("../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

const isProduct = async item => {
  const product = await Product.findById(item.productId);
  if (product) {
    return true;
  }
  return false;
};

const getInvalidProducts = products => {
  let invalidProducts = products
    .filter(product => !isValidObjectId(product.productId))
    .concat(
      products
        .filter(product => isValidObjectId(product.productId))
        .filter(product => !isProduct(product))
    );
  return invalidProducts;
};

const getValidProducts = products => {
  return products
    .filter(product => isValidObjectId(product.productId))
    .filter(isProduct);
};

const productIsInInventory = (product, driver) => {
  // Get all ids of products that are in driver inventory
  const inventoryIds = driver.inventory.map(product =>
    product.productId.toString()
  );
  const productId = product.productId.toString();
  if (inventoryIds.includes(productId)) {
    return true;
  }
  return false;
};

const removeProductFromInventory = (productToRemove, driver, res) => {
  try {
    let inventory = driver.inventory;
    if (productIsInInventory(productToRemove, driver)) {
      const index = inventory
        .map(productInInventory => productInInventory.productId.toString())
        .indexOf(productToRemove.productId.toString());
      inventory[index].quantity -= productToRemove.quantity;
      if (inventory[index].quantity <= 0) {
        inventory.splice(index, 1);
      }
      console.log(productToRemove);
    }
  } catch (err) {
    console.error(err);
  }
};

const addProductToInventory = (productToAdd, driver, res) => {
  if (productIsInInventory(productToAdd, driver)) {
    const index = driver.inventory
      .map(productInInventory => productInInventory.productId.toString())
      .indexOf(productToAdd.productId);
    driver.inventory[index].quantity += productToAdd.quantity;
  } else {
    driver.inventory.push(productToAdd);
  }
};

// @route         POST api/drivers
// @description   Create a driver
// @access        Driver only
router.post("/", requireLogin, async (req, res) => {
  try {
    let driver = await Driver.findOne({ user: req.user.id });

    if (driver) {
      return res.status(400).json("Driver already exists");
    }
    driver = await new Driver({ user: req.user.id });
    await User.findOneAndUpdate({ _id: req.user.id }, { role: "driver" });
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route         GET /drivers
// @description   Get all drivers
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    // Only populate the orders that are active
    const drivers = await Driver.find()
      .populate("user", ["name", "phoneNumber"])
      .populate({
        path: "orders",
        match: { active: true }
      });
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET /drivers/me
// @description   Get driver for logged in user
// @access        Private, Driver only
router.get("/me", requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate("user", ["name", "phoneNumber"])
      .populate("orders");

    if (!driver) return res.status(400).json({ msg: "Driver not found " });
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         GET /drivers/:driverId
// @description   Get driver by driverId
// @access        Private, Driver only
router.get("/:driverId", requireDriver, async (req, res) => {
  try {
    const { driverId } = req.params;
    if (!isValidObjectId(driverId)) {
      return res.status(400).json({ msg: "Invalid ID" });
    }
    const driver = await Driver.findById(driverId)
      .populate("user", ["name", "phoneNumber"])
      .populate("orders");

    if (!driver) return res.status(400).json({ msg: "Driver not found " });
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         PUT /drivers/orders/:orderId/acceptOrder
// @description   Asign order to driver, and driver to order
// @access        Private, Driver only
router.put("/orders/:orderId/acceptOrder", requireDriver, async (req, res) => {
  try {
    const { orderId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id }).populate({
      path: "orders",
      match: { active: true }
    });
    const order = await Order.findById(orderId);

    if (!order) res.status(400).json({ msg: "Order not found" });
    if (!driver) res.status(400).json({ msg: "Driver not found" });

    if (order.driver) {
      return res.status(400).json({ msg: "Order is already assigned" });
    }

    // For each product in the order, subtract the quantity from driver's inventory
    for (let i = 0; i < order.productList.length; i++) {
      if (!productIsInInventory(order.productList[i], driver)) {
        return res.status(400).json({ msg: "Product not in driver inventory" });
      }
      removeProductFromInventory(order.productList[i], driver, res);
    }

    order.driver = req.user.id;
    order.status = "received";
    driver.orders.push(orderId);

    await order.save();
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT /drivers/orders/:orderId/status/enroute
// @description   Change status of order to en route
// @access        Private, Driver only
router.put(
  "/orders/:orderId/status/enroute",
  requireDriver,
  async (req, res) => {
    const { orderId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id }).populate({
      path: "orders",
      match: { active: true }
    });
    const order = await Order.findById(orderId);

    if (!order) res.status(400).json({ msg: "Order not found" });
    if (!driver) res.status(400).json({ msg: "Driver not found" });

    if (order.driver == driver._id) {
      order.status = "en route";
    }

    order.save();
    res.json(driver);
  }
);

// @route         PUT /drivers/orders/:orderId/status/arrived
// @description   Change status of order to arrived
// @access        Private, Driver only
router.put(
  "/orders/:orderId/status/arrived",
  requireDriver,
  async (req, res) => {
    const { orderId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id }).populate({
      path: "orders",
      match: { active: true }
    });
    const order = await Order.findById(orderId);

    if (!order) res.status(400).json({ msg: "Order not found" });
    if (!driver) res.status(400).json({ msg: "Driver not found" });

    if (order.driver == driver._id) {
      order.status = "arrived";
    }

    order.save();
    res.json(driver);
  }
);

// @route         PUT /drivers/orders/:orderId/status/completed
// @description   Change status of order to completed
// @access        Private, Driver only
router.put(
  "/orders/:orderId/status/completed",
  requireDriver,
  async (req, res) => {
    const { orderId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id }).populate({
      path: "orders",
      match: { active: true }
    });
    const order = await Order.findById(orderId);

    if (!order) res.status(400).json({ msg: "Order not found" });
    if (!driver) res.status(400).json({ msg: "Driver not found" });

    if (order.driver == driver._id) {
      order.status = "completed";
      order.active = true;
    }

    order.save();
    res.json(driver);
  }
);

// @route         PUT api/drivers/inventory/addProducts
// @description   Add products to driver inventory
// @access        Driver only
router.put(
  "/inventory/addProducts",
  [
    requireDriver,
    [
      check("productsToAdd", "No products selected")
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
      let { productsToAdd } = req.body;

      // See if user has a driver driver
      const driver = await Driver.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no driver, then return error
      if (!driver) {
        return res.status(400).json({ msg: "No driver found" });
      }

      const invalidProducts = getInvalidProducts(productsToAdd);
      productsToAdd = getValidProducts(productsToAdd);

      if (productsToAdd) {
        productsToAdd.forEach(product => {
          addProductToInventory(product, driver, res);
        });
      }
      await driver.save();
      if (invalidProducts.length > 0) {
        return res.json({ driver, invalidProducts });
      }
      res.json(driver);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         PUT api/drivers/inventory/removeProducts
// @description   Remove products from driver inventory for logged in user
// @access        Driver only
router.put(
  "/inventory/removeProducts",
  [
    requireDriver,
    [
      check("productsToRemove", "No products selected")
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
      // See if user is a driver
      const driver = await Driver.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no driver, then return error
      if (!driver) {
        return res.status(400).json({ msg: "Driver not found" });
      }

      const productsToRemove = getValidProducts(req.body.productsToRemove);
      await productsToRemove.forEach(product => {
        removeProductFromInventory(product, driver, res);
      });
      await driver.save();
      return res.json(driver);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         DELETE /drivers
// @description   Delete driver
// @access        Private, Driver only
router.delete("/", requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    await driver.remove();
    res.json({ msg: "Driver deleted" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

module.exports = router;
