const mongoose = require("mongoose");

const db = process.env.DB_URL

mongoose.connect(db).then(() => {
    console.log("Connected to mongodb");
})
    .catch((e) => console.log(e))