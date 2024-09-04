const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    },
    inquireFor: {
        type: String,
        enum: ["Image", "Tag"],
    },
    description: {
        type: String,
    },
    purpose: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

const inquiryModel = mongoose.model("INQUIRY", inquirySchema);

module.exports = inquiryModel;