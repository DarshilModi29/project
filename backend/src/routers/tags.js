const router = require("express").Router();
const Auth = require("../middleware/Auth");
const tagsSchema = require("../models/tagsSchema");
const { filterTag, isAdmin } = require("../utilityFunctions/uploadImage");

router.post("/api/setTags", Auth, async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return res.status(403).json({ "message": "You have no permission for performing this action" });
        }
        const { tag_name } = req.body;
        const slug = filterTag(tag_name);
        const isExist = await tagsSchema.findOne({ name: tag_name });
        if (isExist) {
            return res.status(400).json({ message: "Tag already exist" });
        }
        const newTag = new tagsSchema({ name: tag_name, slug });
        await newTag.save();
        res.json({ message: "New tag has been added" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/api/allTags", Auth, async (req, res) => {
    try {
        if (isAdmin(req.user)) {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const skip = (page - 1) * limit;
            const totalTags = await tagsSchema.countDocuments({});
            const tags = await tagsSchema.find().skip(skip).limit(limit);
            res.json({ data: tags, totalTags });
        } else {
            return res.status(403).json({ "message": "You have no permission for performing this" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/api/tags", async (req, res) => {
    try {
        const { suggest } = req.query;
        const tags = await tagsSchema.find({ name: new RegExp(`^${suggest}`, 'i') }).limit(10);
        res.json({ data: tags });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = router;