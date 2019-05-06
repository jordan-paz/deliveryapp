const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const UserProfile = require("../../models/UserProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");

// @route         GET api/userProfile
// @description   Get all user profiles
// @access        Private
router.get("/", [requireLogin, requireRole("driver")], async (req, res) => {
  try {
    const users = UserProfile.find().populate("user", [
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

// @route         POST api/userProfile
// @description   Create/edit a userProfile
// @access        Private
router.post(
  "/",
  [
    requireLogin,
    [
      check("address", "Address is required")
        .not()
        .isEmpty(),
      check("age", "You must be 21 or orlder to order").isInt({ min: 21 }),
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

    const { address, age, currentOrder, pastOrders } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (address) profileFields.address = address;
    if (age) profileFields.age = age;
    if (currentOrder) profileFields.currentOrder = currentOrder;
    if (pastOrders) profileFields.pastOrders = pastOrders;

    try {
      let userProfile = await UserProfile.findOne({ user: req.user.id });

      if (userProfile) {
        // Update
        userProfile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(userProfile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

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

module.exports = router;
