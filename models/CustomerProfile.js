const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = CustomerProfile = mongoose.model(
  "CustomerProfile",
  CustomerProfileSchema
);
