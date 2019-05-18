const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const DriverProfile = require("../../models/DriverProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST api/driverprofiles
// @description   Create a driverprofile
// @access        Private
router.post("/", requireLogin, async (req, res) => {
  const { inventory, currentOrder, pastOrders, driverStatus } = req.body;

  // Build profile object
  const profileFields = { user: req.user.id };
  if (inventory) {
    profileFields.inventory = inventory;
  } else {
    profileFields.inventory = [];
  }
  if (currentOrder) profileFields.currentOrder = currentOrder;
  if (pastOrders) profileFields.pastOrders = pastOrders;
  if (driverStatus) profileFields.driverStatus = driverStatus;

  try {
    let driverProfile = await DriverProfile.findOne({ user: req.user.id });

    if (driverProfile) {
      // Update
      driverProfile = await DriverProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.json(driverProfile);
    }

    // Create
    driverProfile = new DriverProfile(profileFields);

    await User.findOneAndUpdate({ role: "driver" });
    await driverProfile.save();
    res.json(driverProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route         GET api/driverProfiles
// @description   Get all driver profiles
// @access        Public
router.get("/", [requireLogin, requireRole("driver")], async (req, res) => {
  try {
    const drivers = await DriverProfile.find().populate("user", [
      "name",
      "phoneNumber",
      "avatar"
    ]);
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET api/driverProfiles/:user_id
// @description   Get driver profile by user id
// @access        Private, Driver only
router.get("/:user_id", requireRole("driver"), async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found " });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route         PUT api/driverProfiles/addProducts
// @description   Add products to driver inventory
// @access        Driver only
router.put(
  "/addProducts",
  [
    requireRole("driver"),
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
      // See if user has a driver profile
      const profile = await DriverProfile.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no profile, then return error
      if (!profile) {
        return res
          .status(400)
          .json({ msg: "User does not have a driver profile" });
      }

      let inventory = profile.inventory;
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
        await profile.save();
        return res.json({
          msg: "Could not find products",
          invalidItems,
          profile
        });
      }
      await profile.save();
      return res.json(profile);
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         PUT api/driverProfiles/removeProducts
// @description   Remove products from driver inventory
// @access        Driver only
router.put(
  "/removeProducts",
  [
    requireRole("driver"),
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
      // See if user has a driver profile
      const profile = await DriverProfile.findOne({
        user: req.user.id
      }).populate("user", "name");

      // If no profile, then return error
      if (!profile) {
        return res
          .status(400)
          .json({ msg: "User does not have a driver profile" });
      }

      let inventory = profile.inventory;
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
      await profile.save();
      return res.json(profile);
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         PUT api/driverProfiles/orders/acceptOrder
// @description   Add order to driver profile
// @access        Private, Driver only
router.put(
  "/orders/acceptOrder/:order_id",
  requireRole("driver"),
  async (req, res) => {
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
  }
);

// @route         DELETE api/driverProfile
// @description   Delete driver profile and user associated
// @access        Private, Driver only

module.exports = router;
