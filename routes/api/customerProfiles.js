const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const CustomerProfile = require("../../models/CustomerProfile");
const requireLogin = require("../../middleware/requireLogin");
const requireDriver = require("../../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;
const config = require("config");

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
      "email",
      "avatar"
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
    const profile = await CustomerProfile.findById(req.user.id).populate(
      "user",
      ["name", "email", "avatar"]
    );
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
      _id: userId
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
  const { address, age, email, phoneNumber } = req.body;

  try {
    await CustomerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { address, age, email, phoneNumber } }
    );
    res.json(profile);
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: "No user found" });
    }
    await user.remove();
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
