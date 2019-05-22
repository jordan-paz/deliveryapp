const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const Driver = require("../models/Driver");
const User = require("../models/Driver");
const requireLogin = require("../middleware/requireLogin");
const requireDriver = require("../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

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

// @route         GET api/drivers/:driverId
// @description   Get driver by driverId
// @access        Private, Driver only
router.get("/:user_id", requireDriver, async (req, res) => {
  try {
    const driver = await Driver.findById(driverId).populate("user", [
      "name",
      "avatar"
    ]);

    if (!driver) return res.status(400).json({ msg: "Driver not found " });
    res.json(driver);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "driver not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route         GET api/drivers/me
// @description   Get driver for logged in user
// @access        Private, Driver only

// @route         DELETE api/drivers
// @description   Delete driver
// @access        Private, Driver only

// INVENTORY ROUTES //

// @route         PUT api/drivers/inventory/addProducts
// @description   Add products to driver inventory, by driver id
// @access        Driver only
router.put(
  "/inventory/addProducts",
  [
    requireDriver,
    [
      check("items", "No item selected")
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
      // See if user has a driver driver
      const driver = await Driver.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no driver, then return error
      if (!driver) {
        return res
          .status(400)
          .json({ msg: "User does not have a driver driver" });
      }

      let inventory = driver.inventory;
      // Get all ids of products that are in driver inventory
      const inventoryIds = inventory.map(product =>
        product.productId.toString()
      );
      const { items } = req.body;

      const invalidItems = items.filter(
        item => !isValidObjectId(item.productId)
      );
      const validItems = items.filter(item => isValidObjectId(item.productId));

      const isProduct = async item => {
        const product = await Product.findById(item.productId);
        if (product) {
          return true;
        }
        return false;
      };

      if (validItems) {
        const validProducts = validItems.filter(isProduct);
        validProducts.forEach(product => {
          let productId = product.productId.toString();

          if (inventoryIds.includes(productId)) {
            const index = inventoryIds.indexOf(productId);
            inventory[index].quantity += product.quantity;
          } else {
            inventory.push(product);
          }
        });
      }
      if (invalidItems.length > 0) {
        await driver.save();
        return res.json({
          msg: "Could not find products",
          invalidItems,
          driver
        });
      }
      await driver.save();
      return res.json(driver);
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         PUT api/drivers/inventory/removeProducts
// @description   Remove products from driver inventory for logged in user
// @access        Driver only
router.put(
  "/removeProducts",
  [
    requireDriver,
    [
      check("items", "No item selected")
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
      // See if user has a driver driver
      const driver = await Driver.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no driver, then return error
      if (!driver) {
        return res
          .status(400)
          .json({ msg: "User does not have a driver driver" });
      }

      let inventory = driver.inventory;
      // Get all ids of products that are in driver inventory
      const getIds = inventory => {
        return inventory.map(i => i.productId.toString());
      };

      const { items } = req.body;
      items.forEach(item => {
        let productId = item.productId.toString();
        let inventoryIds = getIds(inventory);
        if (inventoryIds.includes(productId)) {
          let index = inventoryIds.indexOf(productId);
          inventory[index].quantity -= item.quantity;
          if (inventory[index].quantity <= 0) {
            inventory.splice(index, 1);
          }
        }
      });
      await driver.save();
      return res.json(driver);
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
