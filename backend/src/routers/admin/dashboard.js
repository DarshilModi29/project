const router = require("express").Router();
const Auth = require("../../middleware/Auth");
const { upload } = require("../../middleware/Multer");
const downloadSchema = require("../../models/downloadSchema");
const imageSchema = require("../../models/imageSchema");
const userSchema = require("../../models/userSchema");
const bcryptjs = require("bcryptjs");
const fs = require("fs");
const { isAdmin, uploadImage, generateToken, verifyEmail, getFirstWeekDate, getLastWeekDate } = require("../../utilityFunctions/uploadImage");

router.get("/api/cardDetails", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const cardDeatils = await Promise.all([
                userSchema.countDocuments({ role: "user" }),
                imageSchema.countDocuments({}),
                downloadSchema.countDocuments({})
            ]);
            res.json({ data: cardDeatils });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/chartData", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const currentDate = new Date();
            const firstWeekDate = getFirstWeekDate(currentDate);
            const lastWeekDate = getLastWeekDate(currentDate);
            const images = await imageSchema.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: firstWeekDate,
                            $lte: lastWeekDate
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
            res.json({ data: images, start: firstWeekDate, end: lastWeekDate });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/api/todayImages", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const skip = (page - 1) * limit;

            const startDay = new Date().setHours(0, 0, 0, 0);
            const endDay = new Date().setHours(23, 59, 59, 999);
            const todayImages = await imageSchema.find({ createdAt: { $gte: startDay, $lt: endDay } })
                .populate({ path: "user", select: "_id username" })
                .skip(skip)
                .limit(limit);
            const totalImages = await imageSchema.countDocuments({ createdAt: { $gte: startDay, $lt: endDay } });
            res.json({ data: todayImages, totalImages });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/allUsers", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const skip = (page - 1) * limit;

            const users = await userSchema.find({ role: "user" }, "-password -role").skip(skip).limit(limit);
            const totalUsers = await userSchema.countDocuments({ role: "user" });
            res.json({ data: users, totalUsers });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/suspendUser/:userId", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const { userId } = req.params;
            var { days } = req.body;
            days = parseInt(days, 10);

            const suspensionDate = new Date();
            suspensionDate.setDate(suspensionDate.getDate() + days);

            await userSchema.findByIdAndUpdate(userId, {
                isSuspend: true,
                suspendEndDate: suspensionDate
            });
            res.json({ message: `User suspended successfully`, });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.put("/api/removeSuspension/:userId", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const { userId } = req.params;

            await userSchema.findByIdAndUpdate(userId, {
                isSuspend: false,
                suspendEndDate: null
            });
            res.json({ message: "User Suspension has been removed", });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/userBan/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role != "sub-admin") {
            const { id } = req.params;
            const { action } = req.body;
            if (action == "ban") {
                await userSchema.findByIdAndUpdate(id, { isBanned: true });
                res.json({ message: "User banned successfully" });
            } else {
                await userSchema.findByIdAndUpdate(id, { isBanned: false });
                res.json({ message: "User unbanned successfully" });
            }
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/imageHide/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const { id } = req.params;
            const { action } = req.body;

            if (action == "hide") {
                await imageSchema.findByIdAndUpdate(id, { isHide: true });
                res.json({ message: "Image hided successfully" });
            } else {
                await imageSchema.findByIdAndUpdate(id, { isHide: false });
                res.json({ message: "Image unhidden successfully" });
            }
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/add-sub-admin", Auth, upload.single('profilePic'), async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const { email, username, password } = req.body;
            const isExist = await userSchema.findOne({
                $and: [
                    { $or: [{ email }, { username }] },
                    { role: "sub-admin" }
                ]
            });
            if (isExist) {
                return res.status(400).json({ message: "Email or Username already exists for sub admin" });
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPass = await bcryptjs.hash(password, salt);
            const timeStamp = Date.now();

            const user = new userSchema({
                username,
                email,
                password: hashPass,
                role: "sub-admin"
            });
            if (req.file) {
                const dbPath = `images/users/${timeStamp}-${req.file.originalname}`;
                uploadImage(timeStamp, "users", req.file.originalname, req.file.buffer, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "There is problem in uploading Image" });
                    }
                });
                user.profilePic = dbPath;
            }
            await user.save();
            const token = generateToken(user._id);
            const verificationUrl = `http://localhost:5000/verify/${token}`;
            verifyEmail(email, "Email verification", `Please verify your email by clicking on the following link: ${verificationUrl}`);
            res.json({ message: "Sub Admin has been created ! Please tell your sub admin to verify email" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/api/sub-admins", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const skip = (page - 1) * limit;

            const subAdmins = await userSchema.find({ role: "sub-admin" }, '-password -role').skip(skip).limit(limit);
            const totalSubAdmins = await userSchema.countDocuments({ role: "sub-admin" });
            res.json({ data: subAdmins, totalSubAdmins });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/api/remove-sub-admin/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const { id } = req.params;
            const data = await userSchema.findByIdAndDelete(id);
            if (res.statusCode == 200) {
                if (fs.existsSync(data.profilePic)) {
                    await fs.promises.unlink(data.profilePic);
                }
            }
            res.json({ message: "Sub Admin has been removed" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;