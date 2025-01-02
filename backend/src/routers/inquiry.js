const router = require("express").Router();
const Auth = require("../middleware/Auth");
const inquirySchema = require("../models/inquirySchema");
const { verifyEmail, isAdmin } = require("../utilityFunctions/uploadImage");

router.post("/api/inquire", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const purpose = req.body.purpose || null;
        const inquiry = new inquirySchema({
            user_id: _id,
            description: req.body.description,
            purpose: purpose,
            inquireFor: req.body.inquireFor
        });
        await inquiry.save();
        res.json({ message: "Your inquiry has been send ! Will reply in 24 to 48 hours" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/getInquiries", Auth, async (req, res) => {
    try {
        const user = req.user;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;

        var inquiries;
        var totalInquries;
        if (user.role == "user") {
            inquiries = await inquirySchema.find({ user_id: user._id }).populate({ path: "user_id", select: "_id username" }).sort({ "_id": -1 });
        } else {
            totalInquries = await inquirySchema.countDocuments();
            inquiries = await inquirySchema.find({})
                .populate("user_id", "_id username")
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit);
        }
        res.json({ data: inquiries, totalInquries });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/replyInquiry/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        if (action && action == "delete") {
            await inquirySchema.findByIdAndDelete(id);
            return res.json({ message: "Inquiry has been deleted" });
        }
        if (isAdmin(req.user)) {
            if (action && action == "reject") {
                await inquirySchema.findByIdAndUpdate(id, { status: "rejected" });
                return res.json({ message: "Inquiry has been rejected" });
            } else if (action && action == "TagInquiry") {
                await inquirySchema.findByIdAndUpdate(id, { status: "accepted" }).populate("user_id", "_id email");
                return res.json({ message: "Inquiry has been approved" });
            } else {
                const { subject, text } = req.body;
                const data = await inquirySchema.findByIdAndUpdate(id, { status: "accepted" }).populate("user_id", "_id email");
                verifyEmail(data.user_id.email, subject, text);
                return res.json({ message: "Inquiry reply has been sent" });
            }
        } else {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;