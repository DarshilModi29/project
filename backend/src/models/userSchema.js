const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user"
    },
    profilePic: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isSuspend: {
        type: Boolean,
        default: false
    },
    suspendEndDate: {
        type: Date,
    },
    isBanned: {
        type: Boolean,
        default: false
    }
});

const userModel = mongoose.model("USER", userSchema);

module.exports = userModel;