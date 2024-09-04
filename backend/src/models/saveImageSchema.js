const mongoose = require("mongoose");

const savedImage = new mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IMAGE"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER'
    },
}, { timestamps: true });

const savedImageModel = mongoose.model("SAVED_IMAGE", savedImage);

module.exports = savedImageModel;