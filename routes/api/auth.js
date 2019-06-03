const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const requireLogin = require("../../middleware/requireLogin");
const User = require("../../models/User");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

// @route         GET api/auth
// @description   Test Route
// @access        Public
router.get("/", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route         POST api/auth
// @description   Authenticate user & get token
// @access        Public
router.post(
  "/",
  [
    // Use { check, validationResult } from express-validator/check
    // to validate data coming to route
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const { email, password } = req.body;

      try {
        // See if user exists
        let user = await User.findOne({ email }); //<-- same as saying email: email
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

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

module.exports = router;
