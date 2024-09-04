const jwt = require("jsonwebtoken");
const Users = require("../models/userSchema");
const mongoose = require("mongoose");

const Auth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ error: "Please Login for use this feature" });
        }
        const [bearer, token] = authorization?.split(' ');
        let verifyToken;
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ "message": "Please Login for use this feature" });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ "message": "Token Expired" });
            } else {
                return res.status(500).json({ "message": "Internal Server Error" });
            }
        }
        let userId = new mongoose.Types.ObjectId(verifyToken.id);
        const user = await Users.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ "message": "User not found" });
        }
        if (user.isSuspend && new Date() >= user.suspendEndDate) {
            user.isSuspend = false;
            user.suspendEndDate = null;
            await user.save();
        }
        if (user && !user.isActive) {
            return res.status(401).json({ "message": "Please verify your email first" });
        }
        if (user && user.isSuspend) {
            return res.status(401).json({
                "message": `Your account is suspended untill 
                ${`${user.suspendEndDate.getDate()}/${user.suspendEndDate.getMonth() + 1}/${user.suspendEndDate.getFullYear()}`}`
            });
        }
        if (user && user.isBanned) {
            return res.status(401).json({ "message": `Your account is banned untill. You can never access this account` });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error.toString());
        return res.status(500).json({ "message": "Internal Server Error" });
    }
}

module.exports = Auth;