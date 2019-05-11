const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const DriverProfile = require("../../models/DriverProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");

// @route         POST api/driverprofile
// @description   Create a driverprofile
// @access        Private, Driver only
router.post("/", requireLogin, async (req, res) => {
  const { inventory, currentOrder, pastOrders, driverStatus } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (inventory) profileFields.inventory = inventory;
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

// @route         GET api/driverProfile
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

// @route         GET api/driverProfile/:user_id
// @description   Get driver by user id
// @access        Private, Driver only
router.get(
  "/:user_id",
  [requireLogin, requireRole("driver")],
  async (req, res) => {
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
  }
);

// @route         PUT api/driverProfile
// @description   Edit driver
// @access        Private, Driver only
router.put("/", [requireLogin, requireRole("driver")], async (req, res) => {
  try {
  } catch (err) {}
});

// @route         DELETE api/driverProfile
// @description   Delete driver profile and user associated
// @access        Private, Driver only

module.exports = router;
