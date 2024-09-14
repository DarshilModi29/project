const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Function to upload an image
function uploadImage(timestamp, folder, fileName, buffer, callback) {
    const imageFolder = path.join(__dirname, '..', '..', 'images', folder);
    const imagePath = path.join(imageFolder, `${timestamp}-${fileName}`);

    fs.mkdir(imageFolder, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating directory:', err);
            if (callback) callback(err);
            return;
        }

        fs.writeFile(imagePath, buffer, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                if (callback) callback(err);
                return;
            }

            if (callback) callback(null);
        });
    });
}

const verifyEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            },
            from: process.env.USER
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: text
        });
        console.log("Email send succesfully");
    } catch (error) {
        console.log(error);
    }
}

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });
}

const updateAverageRatings = async (imageId, ratingModel, imageSchema) => {
    const ratings = await ratingModel.aggregate([
        { $match: { image: new mongoose.Types.ObjectId(imageId) } },
        { $group: { _id: "$image", averageRating: { $avg: "$ratings" } } }
    ]);

    const averageRating = ratings.length > 0 ? ratings[0].averageRating : 0;
    await imageSchema.findByIdAndUpdate(imageId, { rating: averageRating });
}

const filterTag = (tag) => {
    const filteredTag = tag.toLowerCase();
    const resultTag = filteredTag.replace(/ +/g, "_");
    return resultTag;
}

const isAdmin = (user) => {
    return user.role !== "user";
}

const getFirstWeekDate = (currentDate) => {
    const currentDay = new Date(currentDate).getDay();
    const diff = currentDay === 0 ? 6 : currentDay - 1;
    const firstWeekDate = new Date(currentDate);
    firstWeekDate.setDate(firstWeekDate.getDate() - diff);
    return firstWeekDate;
}

const getLastWeekDate = (currentDate) => {
    const lastWeekDate = new Date(currentDate);
    const firstWeekDate = new Date(getFirstWeekDate(currentDate));
    lastWeekDate.setDate(firstWeekDate.getDate() + 6);
    return lastWeekDate;
}

module.exports = {
    uploadImage,
    verifyEmail,
    generateToken,
    updateAverageRatings,
    filterTag,
    isAdmin,
    getFirstWeekDate,
    getLastWeekDate
};
