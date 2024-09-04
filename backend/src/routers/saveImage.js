const Auth = require("../middleware/Auth");
const savedImageModel = require("../models/saveImageSchema");
const router = require("express").Router();

// save image
router.post("/api/save_image/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;

        const isSaved = await savedImageModel.findOne({ $and: [{ image: id }, { user: _id }] });
        if (isSaved) {
            return res.status(400).json({ message: "Image is already saved" });
        }

        const saveImage = new savedImageModel({
            image: id,
            user: _id
        });
        await saveImage.save();
        res.json({ "message": "Image has been saved" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

// get saved image for particular user
router.get("/api/get_saved", Auth, async (req, res) => {
    try {
        const user = req.user;
        const savedImages = await savedImageModel.aggregate([
            {
                $match: {
                    user: user._id
                }
            },
            {
                $lookup: {
                    from: "images",
                    localField: "image",
                    foreignField: "_id",
                    as: "image"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "image.user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    "_id": 0,
                    "image._id": 1,
                    "image.url": 1,
                    "image.rating": 1,
                    "image.resolution": 1,
                    "image.isHide": 1,
                    "user._id": 1,
                    "user.username": 1
                }
            }
        ]);
        const transformedData = savedImages.flatMap(item =>
            item.image.map(img => ({
                _id: img._id,
                url: img.url,
                resolution: img.resolution,
                rating: img.rating,
                isHide: img.isHide,
                user: { _id: item.user[0]._id, username: item.user[0].username },
            }))
        );

        res.json({ data: transformedData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

// unsave image
router.delete("/api/unsaved/:id", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const { id } = req.params;
        const isSaved = await savedImageModel.findOne({ $and: [{ image: id }, { user: _id }] });
        if (isSaved) {
            await savedImageModel.findByIdAndDelete(isSaved._id);
            res.json({ "message": "Image has been unsaved" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

router.get("/api/checkSaved", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const savedImages = await savedImageModel.find({ user: _id }).select("image");
        const savedImagesIds = savedImages.map(image => image.image);
        res.json({ data: savedImagesIds });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
})

module.exports = router;