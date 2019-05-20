const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireLogin = require("../middleware/requireLogin");
const requireDriver = require("../middleware/requireDriver");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;
const config = require("config");

// @route         POST /users
// @description   Register user
// @access        Public
router.post(
  "/",
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or mare characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const { name, email, password, role } = req.body;

      try {
        // See if user exists
        let user = await User.findOne({ email });
        if (user) {
          res.status(400).json({ msg: "User already exists" });
        }

        // Create user
        user = new User({
          name,
          email,
          password,
          role
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to db
        await user.save();

        // Return jsonwebtoken
        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error");
      }
    } else {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);

// @route         GET /users
// @description   Get all users
// @access        Driver only
router.get("/", requireDriver, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Server error");
  }
});

// @route         GET /users/user/:userId
// @description   Get one user by id
// @access        Driver only
router.get("/user/:userId", requireDriver, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }
    const user = await User.findOne({
      _id: userId
    }).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         GET /users/user
// @description   Get user who is logged in
// @access        User
router.get("/user", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         PUT /users
// @description   Edit logged in user
// @access        User
router.put("/", requireLogin, async (req, res) => {
  const { address, age, email, avatar, phoneNumber } = req.body;

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (address) user.profile.address = address;
    if (phoneNumber) user.profile.phoneNumber = phoneNumber;
    if (age) user.profile.age = age;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         DELETE /users
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
