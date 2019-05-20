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
  profile: {
    address: {
      type: String
    },
    phoneNumber: {
      type: String
    },
    age: {
      type: Number
    },
    points: {
      type: Number
    }
  },
  role: {
    type: String,
    default: "customer"
  },
  currentOrder: {
    type: Schema.Types.ObjectId,
    ref: "order"
  }
});

module.exports = User = mongoose.model("user", UserSchema);
