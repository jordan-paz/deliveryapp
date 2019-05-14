const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const DriverProfile = require("../../models/DriverProfile");
const Product = require("../../models/Product");
const requireRole = require("../../middleware/requireRole");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

// @route         PUT api/driverInventories/addProduct
// @description   Add to driver inventory
// @access        Driver only
router.put(
  "/addProduct",
  [
    requireRole("driver"),
    [
      check("items", "No items selected")
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

      const hasValidObjectId = item => {
        return isValidObjectId(item.productId);
      };

      let validItems = req.body.items.filter(hasValidObjectId);


      // Filter out all items whose ids dont match a product
      let validProducts = await validItems.map(item => {
        const product = Product.findById(item.productId);
        if (product) return product;
        console.log("invalid");
        invalidIds.push(id);
      });

      if (validProducts) {
        const inventoryIds = inventory.forEach(item => item.productId);

        // For each product, if the product already exists in driver inventory then add the quantity to existing product.
        validProducts.forEach(item => {
          if (inventoryIds.contains(item.productId)) {
            inventory[index].quantity += item.quantity;
          } else {
            inventory.push(item);
          }
        });

        profile.inventory = inventory;
        await profile.save();
        return res.json(profile);
      }
      return res.json({
        msg: "Could not find products with ids: " + invalidIds
      });
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         GET api/driverInventories
// @description   Get all driverInventories
// @access        Customer-facing menu should hide quantities of product on driver.

// @route         GET api/driverInventories/:driver_id
// @description   Get a driver inventory by id
// @access        Driver only

// @route         PUT api/driverInventoies/:driver_id
// @description   Edit a driverInventory by driver id
// @access        Driver only

// @route         DELETE api/driverInventoies/:driver_id
// @description   Delete a driverInventory by driver id
// @access        Driver only

module.exports = router;
