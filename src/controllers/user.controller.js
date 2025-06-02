import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { asyncHandeler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerHandler=asyncHandeler(async(req,res)=>{
    const {fullName,email,username,password}=req.body


    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new APIError(400, "All fields are required")
    }
    
     const existedUser=await User.findOne({
        $or:[{email},{username}]
     })
       if(existedUser){
        throw new APIError(400,"User already exists")
       }

     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
        throw new APIError(400,"image is not uploaded properly")
     }
    
     const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new APIError(500,"Internal server error")
    }
    
    res.status(201).json(ApiResponse(200,createdUser,"User registred successfully"))

})

export{registerHandler}