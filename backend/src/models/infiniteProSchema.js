const mongoose = require('mongoose');

const infinteProSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
    },
    email: {
        type: String,
        required: true,
    },
    phn_number: {
        type: Number,
        required: true,
    },
    upi: {
        type: String,
    },
    verification_id: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    status: {
        type: String,
        enum: ["accepted", "rejected", "progress"],
        default: "progress",
    }
}, { timestamps: true });

const infiniteProModel = mongoose.model("INFINITE_PRO", infinteProSchema);

module.exports = infiniteProModel;