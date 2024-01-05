import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
// require("dotenv").config();

const dbUrl: string = process.env.DB_URI || "";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);

        console.log(`Database connection with ${connection.connection.host} was successfully established`);
    } catch (error: any) {
        console.error(error.message);
        // Use setTimeout inside a function to avoid immediate execution
        setTimeout(() => connectDB(), 5000);
    }
};


