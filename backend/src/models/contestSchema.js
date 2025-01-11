const mongoose = require("mongoose");
const contestSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    contest_size: {
        type: Number,
        default: 100,
    },
    prize_money: {
        type: Number,
        default: 0
    },
    rules: {
        type: String
    },
    joined: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Not Started", "Started", "Ended", "Canceled"],
        default: "Not Started"
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        default: null
    }
});

const contestModel = mongoose.model("CONTEST", contestSchema);

module.exports = contestModel;