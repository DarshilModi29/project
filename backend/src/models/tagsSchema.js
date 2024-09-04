const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    counts: {
        type: Number,
        default: 0
    }
});


const tagsModel = mongoose.model("TAG", tagsSchema);

module.exports = tagsModel;