const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },

  date: {
    type: Date,
    default: Date.now
  },
  inventory: [
    {
      type: Schema.Types.ObjectId,
      ref: "product"
    }
  ],
  pendingOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ],
  pastOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ]
});

module.exports = DriverProfile = mongoose.model(
  "driverProfile",
  DriverProfileSchema
);
