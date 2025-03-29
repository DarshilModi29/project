const router = require("express").Router();
const Auth = require("../middleware/Auth");
const contestSchema = require("../models/contestSchema");
const participantSchema = require("../models/participantSchema");
const { isAdmin, uploadImage } = require("../utilityFunctions/uploadImage");
const cron = require("node-cron");
const { upload } = require("../middleware/Multer");
const sharp = require("sharp");
const votesSchema = require("../models/votesSchema");
const premiumSchema = require("../models/premiumSchema");
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
            if (req.body.for_premium_users) {
                contest["forPremiumUsers"] = req.body.for_premium_users;
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
        const isParticipant = await participantSchema.findOne({ contest: id, user: userId });
        const { forPremiumUsers } = await contestSchema.findById(id, { forPremiumUsers: 1 });
        if (isParticipant) {
            return res.status(400).json({ status: "joined", message: "You are laready a participant" });
        }
        if (forPremiumUsers) {
            const isPremiumUser = await premiumSchema.findOne({ user: userId, status: "active" });
            if (isPremiumUser) {
                const participant = new participantSchema({
                    user: userId,
                    contest: id
                });
                await Promise.all([
                    participant.save(),
                    contestSchema.findByIdAndUpdate(id, { $inc: { joined: 1 } })
                ]);
            } else {
                return res.status(401).json({ status: false, message: "Please buy Infinite+ premium to join this contest" })
            }
        } else {
            const participant = new participantSchema({
                user: userId,
                contest: id
            });
            await Promise.all([
                await participant.save(),
                await contestSchema.findByIdAndUpdate(id, { $inc: { joined: 1 } })
            ]);
        }
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
                    image: "$image"
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
        const { contestId } = req.body;
        const isVoted = await votesSchema.findOne({ contest: contestId, vote_to: id, vote_by: req.user._id });
        if (!isVoted) {
            const updatedParticipant = await participantSchema.findByIdAndUpdate(id, { $inc: { votes: 1 } });
            const votes = new votesSchema({
                contest: contestId,
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

cron.schedule("0 * * * * *", async () => {
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

router.get("/api/user-contests", Auth, async (req, res) => {
    try {
        const user_id = req.user._id;
        const contests = await participantSchema.find({ user: user_id }, { contest: 1, _id: 0 });

        const user_contests = (await Promise.all(
            contests.map(async (contest) => {
                const contest_id = contest.contest;
                // Use findOne instead of find to get a single document
                return await contestSchema.findOne({ _id: contest_id, status: "Ended" }).populate("winner");
            })
        )).filter(contest => contest !== null); // Filter out null results

        res.json({ data: user_contests });
    } catch (error) {
        console.log("Error in fetching user contests:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

cron.schedule("0 * * * * *", async () => {
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
        const participants = await participantSchema.find({ contest: contestId }).sort({ votes: -1 });
        if (!participants.length) {
            console.log("No participants in the contest.");
            return;
        }

        const topVoteCount = participants[0].votes;
        const topParticipants = participants.filter(p => p.votes === topVoteCount);
        var contestWinner;

        if (topVoteCount == 0) {
            contestWinner = null;
        }
        else if (topParticipants.length == 1) {
            contestWinner = topParticipants[0].user;
        } else {
            var last_votes = await Promise.all(
                topParticipants.map(async (participant) => {
                    const votes = await votesSchema.find({ contest: contestId, vote_to: participant._id }).sort({ _id: -1 });
                    return votes[0] || null;
                })
            );
            last_votes.sort((a, b) => a.vote_time - b.vote_time);
            const winner = topParticipants.find((participant) =>
                participant._id.equals(last_votes[0].vote_to)
            );

            contestWinner = winner ? winner.user : null;
        }
        const result = await contestSchema.updateOne({
            _id: contestId
        }, {
            $set: { status: "Ended", winner: contestWinner }
        });
        console.log(`${result.modifiedCount} contest(s) have been ended.`);
    } catch (error) {
        console.log("Error in ending contests:", error);
    }
});

module.exports = router;