const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const requireLogin = require("../../middleware/requireLogin");
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
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const { name, email, password, role } = req.body;

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

module.exports = router;
