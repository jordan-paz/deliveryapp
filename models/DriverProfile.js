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
      productId: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "product"
      },
      quantity: {
        type: Number,
        default: 0,
        required: true
      }
    }
  ],
  activeOrders: [
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
