import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { APIError } from "./APIError.js";
//console.log(process.env.CLOUDINARY_NAME)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME ||"dyhet8o91",
  api_key: process.env.CLOUDINARY_API_KEY || "695376417368626",
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY || "6vAlnAbFKs6-0UtQPbyfR1W7XVQ", // Click 'View API Keys' above to copy your API secret
});

 const uploadOnCloudinary = async (uploadPath) => {
  try {
    if (!uploadPath) return null;

    const response = await cloudinary.uploader.upload(uploadPath, {
      resource_type: "auto",
    });

    fs.unlinkSync(uploadPath);

    return response;

  } catch (error) {
    fs.unlinkSync(uploadPath);
    return null
  }
};
 
const deleteOncloudinaryimage=async (cloudinarprevPath)=>{
  try {
    const response=await cloudinary.uploader.destroy(cloudinarprevPath)
    console.log("response",response)
    return response
  } catch (error) {
    throw new APIError(500,error?.message || "Internal server error while deleting previous Image")
  }
}

export {uploadOnCloudinary,deleteOncloudinaryimage}