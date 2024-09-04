const router = require("express").Router();
const Auth = require("../middleware/Auth");
const ratingModel = require("../models/ratingsSchema");
const { updateAverageRatings } = require("../utilityFunctions/uploadImage");
const imageSchema = require("../models/imageSchema");

// set rating for particular image
router.post("/api/set_ratings/:id", Auth, async (req, res) => {
    try {
        const { ratings } = req.body;
        const { id } = req.params;
        const { _id } = req.user;

        const isRated = await ratingModel.findOne({ $and: [{ image: id }, { user: _id }] })
        if (isRated) {
            return res.status(400).json({ message: "You have already rated this image" });
        }

        const newRating = new ratingModel({
            ratings,
            image: id,
            user: _id
        });
        await newRating.save();
        await updateAverageRatings(id, ratingModel, imageSchema);
        res.json({ "message": "Your ratings has been submitted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

router.get("/api/isRated/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;
        const isRated = await ratingModel.findOne({ $and: [{ image: id }, { user: _id }] });
        if (isRated) {
            res.json({ data: isRated });
        } else {
            res.json({ data: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
})

module.exports = router;