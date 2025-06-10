import jwt from "jsonwebtoken";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;


    if (!(authHeader || authHeader.startsWith("Bearer "))) {
      throw new APIError(401, "Unauthorized: No token provided");
    }

    const token = authHeader.replace("Bearer ", "").trim();

  
    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY || "qwertyuiop");

    if (!decodedToken) {
      throw new APIError(401, "Unauthorized: Invalid token");
    }

   
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new APIError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
   
    next(new APIError(401, "Authentication failed", error));
  }
};
