import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { asyncHandeler } from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessandrefreshToken = async (userid) => {
  try {
    const finduser = await User.findById(userid);

    const generateAccessToken = await finduser.generateAccesstoken();
    const generateRefreshToken = await finduser.generaterefreshtoken();
    finduser.refreshToken = generateRefreshToken;
    await finduser.save({ validateBeforeSave: false });
    return { generateAccessToken, generateRefreshToken };
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

  if (!(email || username)) {
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

  const { generateAccessToken, generateRefreshToken } =
    await generateAccessandrefreshToken(user._id);

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
        { generateAccessToken, generateRefreshToken },
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

const getRefreshTokenaccess = asyncHandeler(async (req, res) => {
  try {
    const refreshToken =
      req.cookies.generateRefreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new APIError(400, "Refresh token is required");
    }
    const decodeToken = jwt.verify(refreshToken, "poiuytrewq");

    const user = await User.findById(decodeToken._id);

    if (!user) {
      throw new APIError(404, "invalid token");
    }

    if (refreshToken !== user.refreshToken) {
      throw new APIError(401, "invalid Token or token has been used already");
    }
    const { generateAccessToken, generateRefreshToken } =
      await generateAccessandrefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", generateAccessToken, options)
      .cookie("refreshToken", generateRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { generateAccessToken, generateRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new APIError(400, "Invalid refresh token");
  }
});

const ChangeCurrentpassword = asyncHandeler(async (req, res) => {
  try {
    const { oldPassword, Newpassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) throw new APIError(400, "invalid user ");

    const isValidPassword = User.isPasswordCorrect(oldPassword);

    if (!isValidPassword)
      throw new APIError(400, "Please enter correct password");

    user.password = Newpassword;

    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, "success fully chnaged the password"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Error while changing the password"
    );
  }
});

const getCurrentUser = asyncHandeler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const Updateaccountdetails = asyncHandeler(async (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!(fullName || email))
      throw new APIError(400, "fullName and email both fields are required");
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { fullName, email },
      },
      { new: true }
    ).select("-password -refreshToken");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
  } catch (error) {}
});

const UpdateAvatar = asyncHandeler(async (req, res) => {
  try {
    const { newAvatar } = req.body;
    if (!newAvatar) throw new APIError(400, "avatar field is required");

    const myavatar = await uploadOnCloudinary(newAvatar);

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { avatar: myavatar.url },
      },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar image updated successfully"));
  } catch (error) {
    throw new APIError(500, "Internal server ERROR");
  }
});
const getUserChannel = asyncHandeler(async (req, res) => {
  const username = req.params;

  if (!username) {
    throw new APIError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        usernmae: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribedCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if(!channel?.length) {
    throw new APIError(404,"channel does not exist")
  }
   return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
});

export {
  registerHandler,
  loginUser,
  logutUser,
  getRefreshTokenaccess,
  ChangeCurrentpassword,
  getCurrentUser,
  Updateaccountdetails,
  UpdateAvatar,
  getUserChannel,
};
