const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  address: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  cart: [
    {
      productID: {
        type: Schema.Types.ObjectId,
        ref: "product"
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  currentOrder: {
    type: Schema.Types.ObjectId,
    ref: "order"
  },
  pastOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order"
    }
  ]
});

module.exports = CustomerProfile = mongoose.model(
  "customerProfile",
  CustomerProfileSchema
);
