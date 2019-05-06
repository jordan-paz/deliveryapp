const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageURLs: [
    {
      type: String
    }
  ],
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  }
});

module.exports = Product = mongoose.model("product", ProductSchema);
