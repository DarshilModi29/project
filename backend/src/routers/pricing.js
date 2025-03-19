const router = require("express").Router();
const Auth = require("../middleware/Auth");
const { isAdmin } = require("../utilityFunctions/uploadImage");
const pricingModel = require("../models/pricingSchema");

router.post("/api/add-premium-pricing", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role != "sub-admin") {
            const { amount, month } = req.body;
            const newPricing = new pricingModel({
                amount: amount,
                duration_month: month
            });
            await newPricing.save();
            res.json({ message: "New Premium amount added" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

router.get("/api/show-premium-pricing", Auth, async (req, res) => {
    try {
        const data = await pricingModel.find({});
        res.json({ data: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

router.get("/api/get-premium-pricing/:id", Auth, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await pricingModel.findById(id);
        res.json({ data: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

router.put("/api/edit-premium-pricing/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const id = req.params.id;
            const { amount, month } = req.body;
            await pricingModel.findByIdAndUpdate(id, { $set: { amount: amount, duration_month: month } });
            res.json({ message: "Premium Model updated" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.delete("/api/remove-premium-pricing/:id", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user) && req.user.role !== "sub-admin") {
            const id = req.params.id;
            await pricingModel.findByIdAndDelete(id);
            res.json({ message: "Pricing Model deleted successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

module.exports = router;