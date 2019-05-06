const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  imageURLS: [
    {
      type: String
    }
  ],
  description: {
    type: String,
    required: true
  }
});

module.exports = Product = mongoose.model("product", ProductSchema);
