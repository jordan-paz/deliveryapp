const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const CustomerProfile = require("../../models/CustomerProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireRole = require("../../middleware/requireRole");

// @route         POST api/customerProfile
// @description   Create/edit a customerProfile
// @access        Private
router.post(
  "/",
  [
    requireLogin,
    [
      check("address", "Address is required")
        .not()
        .isEmpty(),
      check("age", "You must be 21 to use deliveryapp").isInt({ min: 21 }),
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
    const { address, age, phoneNumber } = req.body;
    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (address) profileFields.address = address;
    if (age) profileFields.age = age;
    if (phoneNumber) profileFields.phoneNumber = phoneNumber;

    try {
      let profile = await CustomerProfile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await CustomerProfile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).populate("user", ["name", "avatar", "email"]);

        return res.json({ profile, msg: "Profile updated" });
      }

      // Create
      profile = new CustomerProfile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route         GET api/customerProfile
// @description   Get all customer profiles
// @access        Private
router.get("/", [requireLogin, requireRole("driver")], async (req, res) => {
  try {
    const profiles = CustomerProfile.find().populate("user", [
      "name",
      "phoneNumber",
      "avatar"
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET api/customeProfile/:user_id
// @description   Get customer profile by id
// @access        Private
router.get("/:user_id", requireLogin, async (req, res) => {
  try {
    const profile = await CustomerProfile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route         PUT api/customerProfile/:user_id
// @description   Edit customerProfile
// @access        Private
router.put("/", [requireLogin], async (req, res) => {
  try {
  } catch (err) {}
});

// @route         DELETE api/customerProfile/
// @description   Delete customerProfile & user
// @access        Private
router.delete("/", requireLogin, async (req, res) => {
  try {
    const profile = await CustomerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ msg: "No profile found for this user" });
    }
    await profile.remove();
    res.json({ msg: "Profile removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
  }
});

module.exports = router;
