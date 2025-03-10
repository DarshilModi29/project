const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'USER',
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    },
    month: {
        type: String
    },
    payout_id: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const earningModel = mongoose.model("EARNING", earningSchema);

module.exports = earningModel;