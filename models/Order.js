const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  productList: [
    {
      product: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Product"
      },
      quantity: {
        type: Number,
        default: 1,
        required: true
      }
    }
  ],
  total: {
    type: Number
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: "Driver"
  },
  active: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    default: "sent",
    required: true
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Order = mongoose.model("order", OrderSchema);
