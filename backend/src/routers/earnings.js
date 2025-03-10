const router = require("express").Router();
const cron = require("node-cron");
const Earnings = require("../models/earningSchema");
const Photographers = require("../models/infiniteProSchema");

cron.schedule("0 0 4 * *", async () => {
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth() == 0 ? 12 : String(currentDate.getMonth()).padStart(2, "0");
        const year = currentDate.getMonth() == 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
        const monthAndYear = `${year}-${month}`;

        const earnings = await Earnings.find({ status: "unpaid", month: monthAndYear });
        if (!earnings.length) {
            console.log("No pending earnings for this month.");
            return;
        }

        for (const earning of earnings) {
            const { user_id } = earning;

            const photographer = await Photographers.findOne({ user: user_id, status: "accepted" }).populate("user", "username email");
            if (!photographer) {
                console.log(`Photographer not found for user_id: ${user_id}`);
                continue;
            }
            const payout_id = `pay-${Date.now()}`
            await Earnings.updateOne({ user_id, month: monthAndYear }, { $set: { status: "paid", payout_id } });
            console.log(`Payment Successful for ${photographer.user.username}`);
        }
    } catch (error) {
        console.log("Error in Cron Job:", error.message);
    }
});

module.exports = router;
