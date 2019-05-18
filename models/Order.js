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
        required: true
      }
    }
  ],
  total: {
    type: Number,
    required: true
  },
  assignedDriver: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  orderStatus: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
});

module.exports = Order = mongoose.model("order", OrderSchema);
