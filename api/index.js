import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js"
dotenv.config();

mongoose.connect(process.env.MONGODB)
.then(() => {
    console.log("Connected");
})
.catch((error) => {
    console.log(error.message);
});

const app = express()

app.listen(3000, ()=> {
    console.log("Server is listening at 3000");
})

app.use("/api/user", userRouter);