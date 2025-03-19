const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    duration_month: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const pricingModel = mongoose.model("PRICING", pricingSchema);

module.exports = pricingModel;