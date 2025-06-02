import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

export const connectDB = async () =>{
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MongoDB_URI}/${process.env.DB_NAME}`);
        console.log(connectionInstance.Connection.host);
        console.log("Connected to MongoDB");

    } catch (error) {
        console.log("MongoDB connection Error",error);
        process.exit();
    }
}
