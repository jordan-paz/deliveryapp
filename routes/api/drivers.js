const express = require("express");
const router = express.Router();
const Driver = require("../../models/Driver");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const requireLogin = require("../../middleware/requireLogin");
const requireDriver = require("../../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

const isProduct = async productId => {
  if (!isValidObjectId(productId)) {
    return false;
  }
  const product = await Product.findById(productId);
  if (product) {
    return true;
  }
  return false;
};

// @route         POST api/drivers
// @description   Create a driver
// @access        Private
router.post(
  "/",
  [
    requireLogin,
    [
      check("phoneNumber", "Phone number is required")
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
      const { phoneNumber } = req.body;
      let driver = await Driver.findOne({ user: req.user.id });
      if (driver) {
        return res.status(400).json("Driver already exists");
      }
      driver = await new Driver({ user: req.user.id, phoneNumber });
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { role: "driver" } }
      );
      await driver.save();
      res.json(driver);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route         GET /drivers
// @description   Get all drivers
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    // Only populate the orders that are active
    const drivers = await Driver.find().populate("user", ["name"]);
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
    const driver = await Driver.findOne({ user: req.user.id }).populate(
      "user",
      ["name"]
    );

    if (!driver) return res.status(400).json({ msg: "Driver not found " });
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
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
    res.status(400).send("Server error");
  }
});

// @route         PUT api/drivers/addProduct
// @description   Add product to driver inventory
// @access        Driver only
router.put("/addProduct/:productid", requireDriver, async (req, res) => {
  try {
    let { productToAdd } = req.params;
    if (!isProduct(productToAdd)) {
      return res.status(400).json({ msg: "Invalid product id" });
    }
    let driver = await Driver.findOne({ user: req.user.id });
    driver.inventory.push(productToAdd);
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

// @route         PUT api/drivers/inventory/removeProduct
// @description   Remove product from driver inventory for logged in user
// @access        Driver only
router.put("/removeProduct/:productId", requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    const removeIndex = driver.inventory
      .map(product => product.productId.toString())
      .indexOf(req.user.id);
    if (removeIndex == -1) {
      return res.status(400).json({ msg: "Product not in inventory" });
    }
    driver.inventory.splice(removeIndex, 1);
    await driver.save();
    return res.json(driver);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: "Server error" });
  }
});

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
