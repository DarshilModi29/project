const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IMAGE",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER'
    },
    ratings: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const ratingModel = mongoose.model("RATING", ratingSchema);

module.exports = ratingModel;