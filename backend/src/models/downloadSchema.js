const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema({
    image_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IMAGE"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    },
    resolution: {
        type: String,
    },
    downloaded_at: {
        type: Date,
        default: new Date()
    }
});

const downloadModel = mongoose.model("DOWNLOAD", downloadSchema);

module.exports = downloadModel;