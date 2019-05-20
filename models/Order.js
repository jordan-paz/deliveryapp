const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
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
    ref: "user"
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
  }
});

module.exports = Order = mongoose.model("order", OrderSchema);
