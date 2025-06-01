import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"



dotenv.config({
    path:"./.env" 
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`SERVER is connected to port ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("MOGO DB CONNECTON failed!!: ",error)
})