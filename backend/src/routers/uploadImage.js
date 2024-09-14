const router = require("express").Router();
const { upload } = require("../middleware/Multer");
const imageSchema = require("../models/imageSchema");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Auth = require("../middleware/Auth");
const mongoose = require("mongoose");
const { uploadImage } = require("../utilityFunctions/uploadImage");
const savedImageModel = require("../models/saveImageSchema");
const downloadModel = require("../models/downloadSchema");
const ratingModel = require("../models/ratingsSchema");
const tagsSchema = require("../models/tagsSchema");
var oldTags;

// Uploads images
router.post("/api/uploadImage", Auth, upload.single("images"), async (req, res) => {
    try {
        if (req.file) {
            const imageUploader = req.user;
            const { tags, description } = req.body;
            const imageTags = JSON.parse(tags);
            var tagsArr = [];
            imageTags.map((tag) => {
                tagsArr.push(tag.value);
            });
            if (tagsArr.length > 0) {
                await Promise.all(
                    tagsArr.map(tag =>
                        tagsSchema.updateOne({ slug: tag }, { $inc: { counts: 1 } })
                    ));
            }
            const timestamp = Date.now();
            const dbPath = `images/new_images/${timestamp}-${req.file.originalname}`;
            const { width, height } = await sharp(req.file.buffer).metadata();
            if (width < 2500 && height < 2000) {
                return res.status(401).json({ message: "Image size should be minimum 5mp" });
            }
            uploadImage(timestamp, "new_images", req.file.originalname, req.file.buffer, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "There is problem in uploading Image" });
                }
            });
            const image = new imageSchema({
                user: imageUploader._id,
                tags: tagsArr,
                description,
                url: dbPath,
                imageSize: (req.file.size / (1024 * 1024)).toFixed(2),
                resolution: `${width}x${height}`
            });
            await image.save();
            res.json({ message: "Image has been Uploaded" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// fetches images uploaded by user
router.get("/api/userImage", Auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const images = await imageSchema.find({ user: _id }).populate("user", "_id username");
        res.json({ data: images });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/image/:id", Auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const imageData = await imageSchema.findById({ _id });
        oldTags = imageData.tags;
        res.json({ data: imageData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// fetches all images
router.get("/api/allImages", Auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;

        const images = await imageSchema.find({})
            .populate({ path: "user", select: '_id username' })
            .sort({ "_id": -1 })
            .skip(skip)
            .limit(limit);
        const totalImages = await imageSchema.countDocuments();

        if (images.length > 0) {
            res.json({ data: images, totalImages });
        } else {
            res.json({ message: "No Images Found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/images", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset);
        const limit = parseInt(req.query.limit);

        const images = await imageSchema.find({})
            .populate({ path: "user", select: '_id username' })
            .sort({ "_id": -1 })
            .skip(offset)
            .limit(limit);
        const totalImages = await imageSchema.countDocuments();

        if (images.length > 0) {
            res.json({ data: images, totalImages });
        } else {
            res.json({ message: "No Images Found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/api/updateImage/:id", Auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const { tags, description } = req.body;
        const tagsArr = [];
        tags.map((tag) => {
            tagsArr.push(tag.value);
        });
        await imageSchema.findByIdAndUpdate({ _id }, {
            tags: tagsArr,
            description
        });
        oldTags.forEach(async (tag) => {
            if (!tagsArr.includes(tag)) {
                await tagsSchema.updateOne({ slug: tag }, { $inc: { counts: -1 } });
            }
        });

        tagsArr.forEach(async (tag) => {
            if (!oldTags.includes(tag)) {
                await tagsSchema.updateOne({ slug: tag }, { $inc: { counts: 1 } });
            }
        });
        res.json({ message: "Image Updated Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// delete an image
router.delete("/api/deleteImage/:id", Auth, async (req, res) => {
    try {
        const _id = new mongoose.Types.ObjectId(req.params.id);
        const imageData = await imageSchema.findOne(_id);
        if (!imageData) {
            return res.status(404).json({ message: "Image Not Found" });
        }
        let image = imageData.url;
        await Promise.all([
            imageSchema.findByIdAndDelete(_id),
            savedImageModel.deleteMany({ image: _id }),
            downloadModel.deleteMany({ image: _id }),
            ratingModel.deleteMany({ image: _id })
        ])
        if (res.statusCode == 200) {
            if (fs.existsSync(image)) {
                await fs.promises.unlink(image);
            }
            res.json({ "message": "Image Deleted Successfully!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

router.get("/api/searchImage/:search", async (req, res) => {
    try {
        const { search } = req.params;
        const images = await imageSchema.find({ tags: { $in: [search] } });
        res.json({ data: images });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }

})

// fetches most rated images
router.get("/api/mostRatedImages", async (req, res) => {
    try {
        const images = await imageSchema.find().sort({ rating: -1 }).populate({ path: "user", select: '_id username' }).limit(10);
        res.json({ data: images });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
});

// fetches most downloads images
router.get("/api/mostDownloadedImages", async (req, res) => {
    try {
        const images = await imageSchema.find().sort({ downloads: -1 }).populate({ path: "user", select: '_id username' }).limit(10);
        res.json({ data: images });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": "Internal Server Error" });
    }
})

module.exports = router;