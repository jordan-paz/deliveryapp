const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  items: [
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
  ]
});

module.exports = Cart = mongoose.model("Cart", OrderSchema);
