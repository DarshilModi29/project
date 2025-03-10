const Auth = require("../middleware/Auth");
const router = require("express").Router();
const { upload } = require("../middleware/Multer");
const { uploadImage, isAdmin, chunkArray } = require("../utilityFunctions/uploadImage");
const infiniteProSchema = require("../models/infiniteProSchema");
const earningSchema = require("../models/earningSchema");
const cron = require('node-cron');

router.post("/api/application-form", Auth, upload.single("file"), async (req, res) => {
    try {
        const { email, upi, state, city, phn_number } = req.body;
        const isExist = await infiniteProSchema.findOne({
            user: req.user._id,
            $or: [
                { status: "accepted" },
                { status: "progress" }
            ]
        });
        if (isExist) {
            return res.status(400).json({ message: "You've already send an application" });
        }

        if (isExist) {
            const todayDate = new Date();
            const applicationDate = new Date(isExist.createdAt);
            const diffDays = parseInt((todayDate - applicationDate) / (1000 * 60 * 60 * 24));
            if (isExist.status === "rejected" && diffDays < 15) {
                return res.status(400).json({ message: "You can't send an application again within 15 days" });
            }
        }

        const infinitePro = new infiniteProSchema({
            email,
            upi,
            state,
            city,
            phn_number,
            user: req.user._id
        });
        if (req.file) {
            const timeStamp = Date.now();
            const dbPath = `images/verification_images/${timeStamp}-${req.file.originalname}`;
            uploadImage(timeStamp, "verification_images", req.file.originalname, req.file.buffer, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "There is problem in uploading Image" });
                }
            });
            infinitePro.verification_id = dbPath;
        } else {
            return res.status(400).json({ message: "Please upload your verification id" });
        }
        await infinitePro.save();
        res.json({ message: "Your application has been sent. You will receive a reply within 48 to 72 hours." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/applications", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const applications = await infiniteProSchema.find({ status: "progress" })
                .populate("user", "username").sort({ _id: -1 });
            res.json({ data: applications });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/rejected-applications", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const rejected_applications = await infiniteProSchema.find({ status: "rejected" })
                .populate("user", "username").sort({ _id: -1 });
            res.json({ data: rejected_applications });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/accepted-applications", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const accepted_applications = await infiniteProSchema.find({ status: "accepted" })
                .populate("user", "username").sort({ _id: -1 });
            res.json({ data: accepted_applications });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/api/accept-application/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const { id } = req.params;
            await infiniteProSchema.findByIdAndUpdate(id, { $set: { status: "accepted" } });
            res.json({ message: "Application accepted successfully" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/api/reject-application/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const { id } = req.params;
            await infiniteProSchema.findByIdAndUpdate(id, { $set: { status: "rejected" } });
            res.json({ message: "Application rejected successfully" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

cron.schedule("0 0 1 * *", async () => {
    try {
        const data = await infiniteProSchema.find({ status: "accepted" });
        const dataInsertSize = 20;
        const month = new Date().toISOString().slice(0, 7);
        const chunks = chunkArray(data, dataInsertSize).flat();
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            await earningSchema.insertMany({ user_id: chunk.user, month });
            console.log(`✅ Chunk ${i + 1} inserted successfully!`);
        }
        console.log("Data inserted successfully")
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;