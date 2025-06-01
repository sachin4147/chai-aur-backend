import mongoose from "mongoose";
import { DATABASE_NAME } from "../constant.js";


const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DATABASE_NAME}`)

        console.log("MOGODB CONNECTED SUCCESSFULLY: ",`${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("MONGO CONNECTION FAILED: ",error)
        process.exit(1)
    }
}

export default connectDB