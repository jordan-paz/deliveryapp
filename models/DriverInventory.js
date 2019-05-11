const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverInventory = new Schema({
  driver: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  products: [
    {
      productID: {
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
  ]
});

module.exports = DriverInventory = mongoose.model(
  "driverInventory",
  DriverInventory
);
