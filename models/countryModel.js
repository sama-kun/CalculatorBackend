const mongoose = require("mongoose");

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
  fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeModel", // Referring to the FeeEntity model
  },
});

const country = mongoose.model("CountryModel", countrySchema);

module.exports = country;
