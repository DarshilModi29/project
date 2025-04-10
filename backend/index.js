// API = https://api.unsplash.com/search/photos?page=1&query=dog&client_id=lLALUHmWRqKXBHP6gjIpcnX5MNPTxFNUuRTzI658ARE

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
require("./db/index");
const userRouter = require("./src/routers/user");
const imageRouter = require("./src/routers/uploadImage");
const downloadRouter = require("./src/routers/download");
const savedImageRouter = require("./src/routers/saveImage");
const ratingsRouter = require("./src/routers/ratings");
const inquiryRouter = require("./src/routers/inquiry");
const tagsRouter = require("./src/routers/tags");
const dashboardRouter = require("./src/routers/admin/dashboard");
const contestRouter = require("./src/routers/contest");
const paymentRouter = require("./src/routers/payment");
const infiniteProRouter = require("./src/routers/infinitePro");
const earningsRouter = require("./src/routers/earnings");
const pricingsRouter = require("./src/routers/pricing");

const app = express();
const port = process.env.PORT || 8000

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // replace with your frontend
    credentials: true
}));
app.use('/images', express.static('images'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 5 * 60 * 1000 }
}));

app.use(userRouter);
app.use(imageRouter);
app.use(downloadRouter);
app.use(savedImageRouter);
app.use(ratingsRouter);
app.use(inquiryRouter);
app.use(tagsRouter);
app.use(dashboardRouter);
app.use(contestRouter);
app.use(paymentRouter);
app.use(infiniteProRouter);
app.use(earningsRouter);
app.use(pricingsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})