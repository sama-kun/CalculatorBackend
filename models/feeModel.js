const mongoose = require("mongoose");

const FeeType = ["normal", "anomaly", "superordinary"];

const feeSchema = new mongoose.Schema({
  basic: {
    type: Number,
    default: 0,
  },
  first: Number,
  third: Number,
  upper: Number,
  type: {
    type: String,
    enum: FeeType, // Specify your enum values
    default: FeeType[0],
  },
  script: String,
});

const fee = mongoose.model("FeeModel", feeSchema);

module.exports = fee;
