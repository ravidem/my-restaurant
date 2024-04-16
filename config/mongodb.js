const mongoose = require("mongoose");
const mongodbUrl = process.env.MONGODB_URL

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongodbUrl);
        console.log("mongoDB connection successfully");
    } catch (err) {
        console.error(err, "error");
    }
};

connectToDatabase();