import { asyncHandeler } from "../utils/asyncHandlers.js";


const registerHandler=asyncHandeler(async(req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})

export{registerHandler}