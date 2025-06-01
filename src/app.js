import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()


app.use(cors({origin:"*"}))
app.use(express.json({limit:"16kb"}))
app.use(urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes

import userRouter from "./routes/user.router.js"

app.use("/users",userRouter)


export {app}