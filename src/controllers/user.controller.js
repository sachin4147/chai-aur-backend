import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { asyncHandeler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessandrefreshToken = async (userid) => {
  try {
    const finduser = await User.findById(userid);

    const generateAccessToken =await finduser.generateAccesstoken();
    const generateRefreshToken =await finduser.generaterefreshtoken();
    finduser.refreshToken = generateRefreshToken;
    await finduser.save({ validateBeforeSave: false });
    return  { generateAccessToken, generateRefreshToken };
  } catch (error) {
    throw new APIError(500, " something went wrong while generating token");
  }
};

const registerHandler = asyncHandeler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new APIError(400, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new APIError(400, "image is not uploaded properly");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new APIError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new APIError(500, "Internal server error");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registred successfully"));
});

const loginUser = asyncHandeler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !username) {
    throw new APIError(400, "Email and username are required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new APIError(404, "User not found");
  }
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new APIError(401, "Invalid password please enter valid credetials");
  }

  const { generateAccessToken, generateRefreshToken } =await
    generateAccessandrefreshToken(user._id);

  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("generateAccessToken", generateAccessToken)
    .cookie("generateRefreshToken", generateRefreshToken)
    .json(
      new ApiResponse(
        200,
        {  generateAccessToken, generateRefreshToken },
        "Logged In successfully"
      )
    );
});

const logutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "logged out successfully"));
});

export { 
         registerHandler, 
         loginUser, 
         logutUser 
        };
