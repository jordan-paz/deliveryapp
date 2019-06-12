const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: "CustomerProfile"
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product"
    }
  ],
  total: {
    type: Number
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: "User"
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

module.exports = Order = mongoose.model("Order", OrderSchema);
