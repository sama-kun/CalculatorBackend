const mongoose = require("mongoose");
const FeeType = [
  "normal",
  "anomaly",
  "superordinary",
  "second",
  "ordinary",
  "free",
];

// Define the schema for Country
const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  basic: {
    type: Number,
    default: 0,
  },
  first: Number,
  second: Number,
  third: Number,
  upper: Number,
  type: {
    type: String,
    enum: FeeType, // Specify your enum values
    default: FeeType[0],
  },
  renewalFirst: Number,
  renewalSecond: Number,
  renewalThird: Number,
  renewalUpper: Number,
  renewalType: {
    type: String,
    enum: FeeType, // Specify your enum values
    default: FeeType[0],
  },
});

const country = mongoose.model("countries", countrySchema);

module.exports = country;
