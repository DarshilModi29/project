const mongoose = require("mongoose");
const participantSchema = mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CONTEST"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    },
    image: {
        type: String,
        default: null
    },
    votes: {
        type: Number,
        default: 0
    }
});

const participantModel = mongoose.model("PARTICIPANT", participantSchema);

module.exports = participantModel;
