const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CONTEST",
        required: true
    },
    vote_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PARTICIPANT",
        required: true
    },
    vote_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },
    vote_time: {
        type: Date,
        default: Date.now
    }
});

const votesModel = mongoose.model("VOTE", votesSchema);

module.exports = votesModel;