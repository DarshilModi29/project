const mongoose = require("mongoose");
const premiumSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId
    },
    paymentId: {
        type: String
    },
    orderId: {
        type: String
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    method: {
        type: String,
    },
    purchasedAt: {
        type: Date,
    },
    expired: {
        type: Date,
    }
})

const premiumModel = mongoose.model("PREMIUM_USER", premiumSchema);
module.exports = premiumModel;