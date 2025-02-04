const router = require("express").Router();
const Auth = require("../middleware/Auth");
const downloadSchema = require("../models/downloadSchema");
const imageSchema = require("../models/imageSchema");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// downloads image and insert record in donload schema and update download count of image
router.post("/api/downloadImage", Auth, async (req, res) => {
    try {
        const { filename, quality } = req.query;
        const { _id } = req.user;

        const inputPath = path.join(__dirname, '..', '..', 'images', 'new_images', filename);
        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ message: "Image Not Found" });
        }

        const image_id = await imageSchema.findOne({ url: `images/new_images/${filename}` });
        const [width, height] = quality.split("x").map(Number);
        const { format } = await sharp(inputPath).metadata();

        var buffer;

        if (req.user.isPremium) {
            buffer = await sharp(inputPath)
                .resize(width, height)
                .toBuffer();
        } else {
            const watermarkPath = path.join(__dirname, '..', '..', 'images', 'other', 'logo.png');

            const watermarkWidth = Math.max(Math.floor(width * 0.2), 50);
            const watermark = await sharp(watermarkPath)
                .resize(watermarkWidth)
                .png()
                .toBuffer();

            const background = await sharp({
                create: {
                    width: watermarkWidth + 5,
                    height: parseInt((watermarkWidth + 5) / 3),
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 0.5 }
                }
            }).png().toBuffer();

            const finalWatermark = await sharp(background)
                .composite([{ input: watermark, gravity: 'center' }])
                .toBuffer();

            buffer = await sharp(inputPath)
                .resize(width, height)
                .composite([{ input: finalWatermark, gravity: 'northeast' }])
                .toBuffer();
        }

        await Promise.all([
            new downloadSchema({
                user_id: _id,
                image_id: image_id._id,
                resolution: quality
            }).save(),
            imageSchema.findByIdAndUpdate(image_id._id, { $inc: { downloads: 1 } })
        ]);

        res.set("Content-Type", `image/${format}`);
        res.set("Content-Disposition", `attachment; filename="${filename}"`)
        res.send(buffer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/userDownload", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const downloads = await downloadSchema.aggregate([
            {
                $match: { user_id: _id }
            },
            {
                $lookup: {
                    from: "images",
                    localField: "image_id",
                    foreignField: "_id",
                    as: "image"
                }
            },
            {
                $unwind: "$image"
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
                $unwind: "$user"
            },
            {
                $group: {
                    _id: "$image._id",
                    image: { $first: "$image" },
                    user: { $first: "$user" },
                    resolution: { $first: "$resolution" }
                }
            },
            {
                $project: {
                    "image._id": 1,
                    "image.url": 1,
                    "user._id": 1,
                    "user.username": 1,
                    "resolution": 1
                }
            },
        ]);
        res.json({ data: downloads });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = router;