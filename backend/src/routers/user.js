const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const User = require("../models/userSchema");
const { upload } = require("../middleware/Multer");
const jwt = require("jsonwebtoken");
const { uploadImage, verifyEmail, generateToken } = require("../utilityFunctions/uploadImage");
const Auth = require("../middleware/Auth");
const cron = require("node-cron");

router.post("/auth/registration", upload.single('profilePic'), async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const isExist = await User.findOne({ $or: [{ email }, { username }] });
        if (isExist) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPass = await bcryptjs.hash(password, salt);
        const timeStamp = Date.now();

        const user = new User({
            username,
            email,
            password: hashPass
        });
        if (role) {
            user.role = role;
        }

        if (req.file) {
            const dbPicPath = `images/users/${timeStamp}-${req.file.originalname}`;
            uploadImage(timeStamp, "users", req.file.originalname, req.file.buffer, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "There is problem in uploading Image" });
                }
            });

            user.profilePic = dbPicPath;
        } else {
            user.profilePic = process.env.DEFAULT_IMAGE
        }
        await user.save();

        const token = generateToken(user._id);
        const verificationUrl = `http://localhost:3000/#/verify?token=${token}`;
        verifyEmail(email, "Email verification", `Please verify your email by clicking on the following link: <a href="${verificationUrl}">verify</a>`)

        res.json({ message: "Your account has been created ! Please check your email to verify your account" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/auth/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        if (user && !user.isActive) {
            const token = generateToken(user._id);
            const verificationUrl = `http://localhost:3000/#/verify?token=${token}`;
            verifyEmail(email, "Email verification", `Please verify your email by clicking on the following link: <a href="${verificationUrl}">verify</a>`)
            return res.json({ message: "Please check your email to verify your account" });
        }

        if (user.isSuspend && new Date() >= user.suspendEndDate) {
            user.isSuspend = false;
            user.suspendEndDate = null;
            await user.save();
        }

        if (user && user.isSuspend) {
            return res.status(401).json({
                "message": `Your account is suspended untill 
                ${`${user.suspendEndDate.getDate()}/${user.suspendEndDate.getMonth() + 1}/${user.suspendEndDate.getFullYear()}`}`
            });
        }
        if (user && user.isBanned) {
            return res.status(401).json({ "message": `Your account is banned untill. You can never access this account` });
        }

        const validatePass = await bcryptjs.compare(password, user.password);
        if (!validatePass) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const payload = {
            id: user._id,
            username: user.username
        }
        let jwt_key = process.env.JWT_SECRET_KEY;
        jwt.sign(
            payload,
            jwt_key,
            { expiresIn: "730d" },
            (err, token) => {
                if (err) {
                    console.log(err.toString());
                    return res.status(500).json({ message: "Internal server error" })
                }
                return res.json({ data: user, token });
            },
        )
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const _id = decode.id;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        user.isActive = true;
        await user.save();
        res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error verifying email' });
    }
});

router.get("/api/userDetails", Auth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error verifying email' });
    }
})

cron.schedule("0 * * * * *", async () => {
    try {
        const users = await User.find({ isSuspend: true });
        users.forEach(element => {
            if (new Date() >= new Date(element.suspendEndDate)) {
                element.isSuspend = false;
                element.suspendEndDate = null;
                element.save();
            } else {
                console.log("No users are unsuspended");
            }
        });
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;