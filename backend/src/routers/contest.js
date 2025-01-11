const router = require("express").Router();
const Auth = require("../middleware/Auth");
const contestSchema = require("../models/contestSchema");
const { isAdmin } = require("../utilityFunctions/uploadImage");
const cron = require("node-cron");

router.post("/api/create-contest", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const contest = new contestSchema({
                title: req.body.title,
                description: req.body.desc,
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
        const all_contest = await contestSchema.find({});
        res.json({ data: all_contest });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/contest/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = await contestSchema.findById(id);
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
})

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
})

cron.schedule("0 0 * * * *", async () => {
    try {
        const todayDate = new Date();
        const currentDate = new Date(todayDate.setUTCHours(0, 0, 0, 0));
        const contestToStart = await contestSchema.aggregate([
            {
                $addFields: {
                    threshold: { $multiply: ["$contest_size", 0.25] }
                },
            },
            {
                $match: {
                    start_date: currentDate,
                    status: "Not Started",
                    $expr: { $gte: ["$joined", "$threshold"] }
                },
            },
        ]);
        const contestIds = contestToStart.map((contest) => contest._id);
        if (contestIds.length > 0) {
            const result = await contestSchema.updateMany(
                { _id: { $in: contestIds } },
                { $set: { status: "Started" } }
            );
            console.log(`${result.modifiedCount} contest(s) have been started.`);
        } else {
            console.log(`No contest(s) have been started.`);
        }
    } catch (error) {
        console.log("Error in starting contests:", error);
    }
});

cron.schedule("0 0 * * * *", async () => {
    try {
        const todayDate = new Date();
        const currentDate = new Date(todayDate.setUTCHours(0, 0, 0, 0));
        const result = await contestSchema.updateMany({
            start_date: currentDate,
            status: "Started",
        }, {
            $set: { status: "Ended" }
        });
        console.log(`${result.modifiedCount} contest(s) have been ended.`);
    } catch (error) {
        console.log("Error in starting contests:", error);
    }
});

cron.schedule("0 0 * * * *", async () => {
    try {
        const todayDate = new Date();
        const currentDate = new Date(todayDate.setUTCHours(0, 0, 0, 0));
        const contestToCancel = await contestSchema.aggregate([
            {
                $addFields: {
                    threshold: { $multiply: ["$contest_size", 0.25] }
                },
            },
            {
                $match: {
                    start_date: currentDate,
                    status: "Not Started",
                    $expr: { $lt: ["$joined", "$threshold"] }
                },
            },
        ]);

        const contestIds = contestToCancel.map((contest) => contest._id);
        if (contestIds.length > 0) {
            const result = await contestSchema.updateMany(
                { _id: { $in: contestIds } },
                { $set: { status: "Canceled" } }
            );
            console.log(`${result.modifiedCount} contest(s) have been canceled.`);
        } else {
            console.log(`No contest(s) have been canceled.`);
        }
    } catch (error) {
        console.log("Error in starting contests:", error);
    }
});

module.exports = router;