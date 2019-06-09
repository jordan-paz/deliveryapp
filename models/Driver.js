const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  date: {
    type: Date,
    default: Date.now
  },
  driverStatus: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
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
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ]
});

module.exports = Driver = mongoose.model("Driver", DriverSchema);
