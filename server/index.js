import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js";
dotenv.config()
import router from "./routes/userRouter.js";
import cookieParser from "cookie-parser";
import { app,server } from "./socket/socketIndex.js";

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
const PORT = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.json({
        message: "Server is Running at " + PORT
    })
})
app.use(cookieParser() )
// API end points
app.use("/api", router)

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server is Running at ", PORT)
    })
});

