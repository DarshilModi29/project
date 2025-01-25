const router = require("express").Router();
const Auth = require("../middleware/Auth");
const contestSchema = require("../models/contestSchema");
const participantSchema = require("../models/participantSchema");
const { isAdmin, uploadImage } = require("../utilityFunctions/uploadImage");
const cron = require("node-cron");
const { upload } = require("../middleware/Multer");
const sharp = require("sharp");
const votesSchema = require("../models/votesSchema");
const { default: mongoose } = require("mongoose");

router.post("/api/create-contest", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const totalContests = await contestSchema.countDocuments({});
            if (totalContests >= 500) {
                return res.status(507).json({ message: "Storage for creating contest is full ! Please delete some old contests to create new contests" })
            }
            const contest = new contestSchema({
                title: req.body.title,
                description: req.body.description,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                rules: req.body.rules
            });
            if (req.body.contest_size) {
                contest["contest_size"] = req.body.contest_size;
            }
            if (req.body.prize_money) {
                contest["prize_money"] = req.body.prize_money;
            }
            await contest.save();
            res.json({ message: "New contest has been created" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/all-contests", async (req, res) => {
    try {
        const all_contest = await contestSchema.find({
            $or: [
                { status: "Not Started" },
                { status: "Started" }
            ]
        }).sort({ _id: -1 });
        res.json({ data: all_contest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/finished-contests", async (req, res) => {
    try {
        const all_contest = await contestSchema.find({ status: "Ended" }).populate("winner", "username").sort({ _id: -1 });
        res.json({ data: all_contest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/contest/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await contestSchema.findById(id).populate("winner", "username");
        res.json({ data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/api/edit-contest/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        await contestSchema.findByIdAndUpdate(id, req.body);
        res.json({ message: "Contest has been updated" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/api/delete-contest/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const _id = req.params.id;
            await contestSchema.findByIdAndDelete({ _id });
            res.json({ message: "Contest has been deleted" });
        } else {
            res.status(401).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/join-contest/:id", Auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const participant = new participantSchema({
            user: userId,
            contest: id
        });
        await participant.save();
        await contestSchema.findByIdAndUpdate(id, { $inc: { joined: 1 } });
        res.json({ message: "You registerd for contest" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/check-participant", Auth, async (req, res) => {
    try {
        const data = await participantSchema.aggregate([
            {
                $lookup: {
                    from: "contests",
                    localField: "contest",
                    foreignField: "_id",
                    as: "contest"
                }
            },
            {
                $unwind: "$contest"
            },
            {
                $match: {
                    user: req.user._id,
                    "contest.status": { $nin: ["Canceled", "Ended"] }
                }
            },
            {
                $project: {
                    _id: 0,
                    contest: "$contest._id",
                }
            }
        ]);
        res.json({ data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/contest-image/:id", Auth, upload.single("contest_image"), async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const isJoined = await participantSchema.findOne({ user: userId, contest: id });
        if (isJoined) {
            if (req.file) {
                const timestamp = Date.now();
                const dbPath = `images/contest/${timestamp}-${req.file.originalname}`;
                const { width, height } = await sharp(req.file.buffer).metadata();
                if (width < 2500 && height < 2000) {
                    return res.status(401).json({ error: "Image size should be minimum 5mp" });
                }
                uploadImage(timestamp, "contest", req.file.originalname, req.file.buffer, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "There is problem in uploading Image" });
                    }
                });
                await participantSchema.updateOne({ user: userId, contest: id }, { $set: { image: dbPath } });
                res.json({ success: "Image uploaded successfully" });
            } else {
                return res.status(401).json({ message: "Please select an image" });
            }
        } else {
            return res.status(401).json({ message: "You haven't joined the contest" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/isVoted/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const data = await votesSchema.aggregate([
        {
            $lookup: {
                from: "participants",
                localField: "vote_to",
                foreignField: "_id",
                as: "participant"
            }
        },
        {
            $unwind: "$participant"
        },
        {
            $match: {
                "participant.contest": new mongoose.Types.ObjectId(id),
                "vote_by": req.user._id
            }
        }
    ]);
    const isVoted = data.length > 0 ? true : false;
    res.json({ isVoted });
})

router.post("/api/vote/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const isVoted = await votesSchema.findOne({ vote_to: id, vote_by: req.user._id });
        if (!isVoted) {
            const updatedParticipant = await participantSchema.findByIdAndUpdate(id, { $inc: { votes: 1 } });
            const votes = new votesSchema({
                vote_to: id,
                vote_by: req.user._id
            });
            await votes.save();
            if (!updatedParticipant) {
                return res.status(404).json({ message: "Participant not found" });
            }
            res.json({ message: "You voted successfully" });
        } else {
            res.json({ message: "You already voted" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/participants/:id", async (req, res) => {
    try {
        const data = await participantSchema.find({ contest: req.params.id }).populate("user", "_id, username");
        res.json({ data });
    } catch (error) {
        console.log("Error in starting contests:", error);
        res.json({ message: "Internal Server Error" });
    }
});

cron.schedule("0 0 * * * *", async () => {
    try {
        const todayDate = new Date();
        const currentDate = new Date(todayDate.setUTCHours(0, 0, 0, 0));
        const result = await contestSchema.updateMany({
            start_date: currentDate,
            status: "Not Started",
        }, {
            $set: {
                status: "Started",
            },
        });
        console.log(`${result.modifiedCount} contest(s) have been started.`);
    } catch (error) {
        res.json({ message: "Internal Server Error" });
        console.log("Error in starting contests:", error);
    }
});

cron.schedule("0 0 * * * *", async () => {
    try {
        const todayDate = new Date();
        const currentDate = new Date(todayDate.setUTCHours(0, 0, 0, 0));
        const contestToEnd = await contestSchema.findOne({
            end_date: currentDate,
            status: "Started",
        }, { _id: 1 });

        if (!contestToEnd) {
            console.log("No contest to end today.");
            return;
        }

        const contestId = contestToEnd._id;

        const mostVoted = await participantSchema.findOne({
            contest: contestId
        }).sort({ votes: -1 }).limit(1);

        const winner = mostVoted ? mostVoted.user : null;

        const result = await contestSchema.updateOne({
            _id: contestId
        }, {
            $set: { status: "Ended", winner }
        });
        console.log(`${result.modifiedCount} contest(s) have been ended.`);
    } catch (error) {
        console.log("Error in ending contests:", error);
    }
});

module.exports = router;