const mongoose = require("mongoose");

const votesSchema = new mongoose.Schema({
    vote_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PARTICIPANT",
        required: true
    },
    vote_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    }
});

const votesModel = mongoose.model("VOTE", votesSchema);

module.exports = votesModel;