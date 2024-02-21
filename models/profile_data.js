const mongoose = require('mongoose');

const profile_data = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
    },
    image: {
        type: String
    }
});
const profile = mongoose.model("profile", profile_data);
module.exports = profile