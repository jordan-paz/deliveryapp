const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const config = require("config");

// @route         POST api/users
// @description   Register user
// @access        Public
router.post(
  "/",
  [
    // Use { check, validationResult } from express-validator/check
    // to validate data coming to route
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or mare characters"
    ).isLength({ min: 6 }),
    check("address", "Address is required")
      .not()
      .isEmpty(),
    check("phoneNumber", "Phone number is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const { name, email, password, address, phoneNumber } = req.body;

      try {
        // See if user exists
        let user = await User.findOne({ email }); //<-- same as saying email: email
        if (user) {
          res.status(400).json({ errors: [{ msg: "User already exists" }] });
        }

        // Create user
        user = new User({
          name,
          email,
          password,
          phoneNumber,
          address
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

// @route         GET api/users
// @description   Get all users
// @access        Private
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route         GET api/users/me
// @description   Get current user
// @access        Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    if (!user) {
      return res.status(400).json({ msg: "Couldn't find user" });
    }
  } catch (err) {
    console.errror(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
