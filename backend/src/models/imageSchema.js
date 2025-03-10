const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        required: true,
    }],
    description: {
        type: String,
    },
    imageSize: {
        type: Number,
    },
    resolution: {
        type: String,
    },
    rating: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER'
    },
    downloads: {
        type: Number,
        default: 0
    },
    isHide: {
        type: Boolean,
        default: false
    },
    onlyPremium: {
        type: Boolean,
        default: false
    },
    earnings: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const imageModel = mongoose.model("IMAGE", imageSchema);

module.exports = imageModel;