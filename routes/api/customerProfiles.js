const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const CustomerProfile = require("../../models/CustomerProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireDriver = require("../../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         POST api/customerProfiles
// @description   Create a customer profile
// @access        Require login
router.post(
  "/",
  [
    requireLogin,
    [
      check("address", "Address is required")
        .not()
        .isEmpty(),
      check("phoneNumber", "Phone number is required")
        .not()
        .isEmpty(),
      check("age", "Age is required")
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
      const { address, phoneNumber, age } = req.body;

      const profile = await new CustomerProfile({
        user: req.user.id,
        address,
        phoneNumber,
        age
      });
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route         GET /customerProfiles
// @description   Get all customer profiles
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    const profiles = await CustomerProfile.find().populate("user", [
      "name",
      "email"
    ]);
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET /customerProfiles/me
// @description   Get profile for user logged in
// @access        User
router.get("/me", requireLogin, async (req, res) => {
  try {
    const profile = await CustomerProfile.findOne({
      user: req.user.id
    }).populate("user", ["name", "email", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "No profile for user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         GET /customerProfiles/:userId
// @description   Get one profile by user id
// @access        Driver only
router.get("/:userId", requireDriver, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }
    const profile = await CustomerProfile.findOne({
      user: userId
    }).populate("user", ["name", "email", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "No profile for user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         PUT /customerProfiles
// @description   Edit profile
// @access        User
router.put("/", requireLogin, async (req, res) => {
  const { address, age, phoneNumber } = req.body;
  try {
    await CustomerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { address, age, phoneNumber } }
    );
    res.json({ msg: "Profile updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         DELETE /customerProfiles
// @description   Delete user
// @access        Private
router.delete("/", requireLogin, async (req, res) => {
  try {
    await CustomerProfile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "Profile deleted" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
