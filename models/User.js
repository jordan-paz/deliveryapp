const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
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
  role: {
    type: String,
    default: "customer"
  }
});

module.exports = User = mongoose.model("user", UserSchema);
