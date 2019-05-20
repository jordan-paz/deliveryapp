// @route         GET api/drivers/orders/:driverId
// @description   Get all orders (past and present) assigned to driver
// @access        Driver Only
router.get("/:driverId", requireDriver, async (req, res) => {
  const { driverId } = req.params;
  if (!isValidObjectId(driverId)) {
    return res.status(400).json({ msg: "Invalid driver ID" });
  }
  try {
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /orders/activeOrders/me
// @description   Get all active orders for user logged in driver
// @access        Drivers only
router.get("/activeOrders/me", requireDriver, async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         GET /drivers/activeOrders/:driverId
// @description   Get all active orders assigned to driver
// @access        Drivers only
router.get("/activeOrders/:driverId", requireDriver, async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(400).send("Server error");
  }
});

// @route         PUT api/drivers/orders/acceptOrder
// @description   Add order to driver profile
// @access        Private, Driver only
router.put(
  "/orders/acceptOrder/:order_id",
  requireRole("driver"),
  async (req, res) => {
    try {
      const driver = await DriverProfile.findOne({ user: req.user.id });
      const order = await Order.findById(req.params.order_id);
      let activeOrders = driver.activeOrders;

      if (order) {
        order.assignedDriver = req.user.id;
        activeOrders.push(req.params.order_id);
        await order.save();
        await driver.save();
        return res.json(driver);
      }
      return res.status(400).json({ msg: "Order not found" });
    } catch (err) {
      return res.status(400).json({ msg: "Server error" });
    }
  }
);

// @route         PUT api/drivers/orders/:status
// @description   Change status of order (accepted, en-route, arrived, completed)
// @access        Private, Driver only
