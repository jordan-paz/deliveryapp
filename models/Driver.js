const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  date: {
    type: Date,
    default: Date.now
  },
  driverStatus: {
    type: String
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
  currentOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ],
  completedOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ]
});

module.exports = Driver = mongoose.model("driverProfile", DriverSchema);
