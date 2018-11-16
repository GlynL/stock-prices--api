const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  }
});

const stockSchema = new mongoose.Schema({
  stock: {
    type: String,
    unique: true,
    required: true
  },
  likes: [likeSchema]
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
