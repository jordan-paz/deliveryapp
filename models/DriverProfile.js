const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  driverStatus: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  phoneNumber: {
    type: String,
    require: true
  },
  inventory: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "product",
        required: true
      },
      amountAvailable: {
        type: Number,
        required: true
      }
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
