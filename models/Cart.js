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
        require: true,
        ref: "product"
      },
      quantity: {
        type: Number,
        default: 1,
        required: true
      }
    }
  ]
});

module.exports = Cart = mongoose.model("Cart", OrderSchema);
