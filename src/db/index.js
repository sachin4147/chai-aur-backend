import mongoose from "mongoose";
import { DATABASE_NAME,AGGREGATE_DATA } from "../constant.js";


const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${AGGREGATE_DATA}`)

        console.log("MOGODB CONNECTED SUCCESSFULLY: ",`${connectionInstance.connection}`)

    } catch (error) {
        console.log("MONGO CONNECTION FAILED: ",error)
        process.exit(1)
    }
}

export default connectDB