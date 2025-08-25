const router = require("express").Router();
const rzp = require("razorpay");
const crypto = require("crypto");
const Auth = require("../middleware/Auth");
const premiumSchema = require("../models/premiumSchema");
const userSchema = require("../models/userSchema");
const cron = require("node-cron");

router.post("/api/subscribe", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const isPremiumUser = await premiumSchema.findOne({ user: _id, status: 'active' });
        if (isPremiumUser) {
            return res.status(401).json({ message: "You are already a premium user" });
        }
        const razorpay = new rzp({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        });
        const { amount, currency, receipt } = req.body;

        const options = {
            amount,
            currency,
            receipt
        };
        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/api/subscribe/validate", Auth, async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount,
            duration_month
        } = req.body;
        const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");
        if (digest !== razorpay_signature) {
            return res.status(400).json({ message: "Transaction is not legit" })
        } else {
            var instance = new rzp({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_SECRET
            });
            var payDetails = await instance.payments.fetch(razorpay_payment_id);

            const todayDate = new Date();
            todayDate.setUTCHours(0, 0, 0, 0);
            const premiumDays = parseInt(duration_month) * 30;
            const expiredDate = new Date(todayDate);
            expiredDate.setUTCDate(expiredDate.getUTCDate() + premiumDays);

            const premiumData = new premiumSchema({
                user: req.user._id,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                purchasedAt: todayDate,
                amount: parseInt(amount),
                expired: expiredDate,
                method: payDetails.method
            })
            await Promise.all([
                premiumData.save(),
                userSchema.findByIdAndUpdate(req.user._id, { $set: { isPremium: true } })
            ]);
            res.json({ message: "Payment successful", expired: premiumDays });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/checkPremium", Auth, async (req, res) => {
    try {
        const isPremiumUser = await premiumSchema.findOne({ user: req.user._id, status: "active" });
        if (!isPremiumUser) {
            return res.json({ status: false });
        }
        const todayDate = new Date();
        todayDate.setUTCHours(0, 0, 0, 0);
        const expiredDays = (isPremiumUser.expired - todayDate) / (1000 * 60 * 60 * 24);
        res.json({ status: true, expiredDays });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

cron.schedule("0 0 * * * *", async () => {
    try {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const todayDate = new Date(now.getTime() + istOffset);
        todayDate.setUTCHours(0, 0, 0, 0);
        const expiredPremium = await premiumSchema.find({ expired: todayDate });
        const users = expiredPremium.map(user => user._id);
        await Promise.all([
            premiumSchema.updateMany({ expired: todayDate }, { $set: { status: "expired" } }),
            userSchema.updateMany({ _id: { $in: users } }, { $set: { isPremium: false } })
        ]);
        console.log(`${users.length} users premium expired`);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;