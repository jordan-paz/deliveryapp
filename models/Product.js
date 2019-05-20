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
  imageUrls: [
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
