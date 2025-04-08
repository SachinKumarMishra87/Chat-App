import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("MONGODB_URL:", process.env.MONGODB_URL); // Isse check karein kya value aa rahi hai

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        const connection = mongoose.connection;

        connection.on("connected", () => {
            console.log("Connected to DB");
        });

        connection.on("error", (error) => {
            console.log("Something is wrong in MongoDB", error);
        });
    } catch (error) {
        console.log("Something is wrong", error);
    }
}

export default connectDB;
