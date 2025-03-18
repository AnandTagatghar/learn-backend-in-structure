import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (
    [username, email, password, fullName].some(
      (field) => field == undefined || field.trim() == ""
    )
  ) {
    throw new ApiError(400, "Required fields missing");
  }

  if (!req.files?.avatar) throw new ApiError(400, "Avatar is required");

  let avatar = await uploadOnCloudinary(req.files.avatar[0]?.path);
  let coverImage = await uploadOnCloudinary(
    req.files.coverImage?.[0]?.path ?? ""
  );

  let userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(403, "User already exists");
  }

  let user = await User.create({
    fullName,
    email,
    password,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  delete user._doc.password;
  delete user._doc.refreshToken;

  res.status(200).json(new ApiResponse(200, "user created successfully", user));
});

const generateAccessAndRefreshToken = async function (userId) {
  try {
    if (!userId) return null;

    const user = await User.findById(userId);

    if (!user) throw new ApiError(404, "user not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access token and refresh token " +
        error
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email)
    throw new ApiError(404, "Required fields are missing");

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect)
    throw new ApiError(401, "Invalid username or password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  delete user._doc.password;
  delete user._doc.__v;
  delete user._doc.createdAt;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "userLoggedIn", {
        ...user._doc,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (_, res) => {
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, "user logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) throw new ApiError(401, "Unauthorized request");

  try {
    const decodeRefreshToken = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeRefreshToken._id);

    if (!user) throw new ApiError(404, "User not found");

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      decodeRefreshToken._id
    );

    user.refreshToken = refreshToken;
    await user.save();

    delete user._doc.__v;
    delete user._doc.createdAt;
    delete user._doc.refreshToken;
    delete user._doc.password;

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "refresh token success", {
          ...user._doc,
          refreshToken,
          accessToken,
        })
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword != confirmPassword)
    throw new ApiError(400, "incorrect newpassword and confirm password");

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(401, "incorret password");

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, "password updated successfully"));
});

const getCurrentUser = asyncHandler((req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, "user fetched successfully", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  try {
    const { fullName, username, email } = req.body;

    if (!fullName || !username || !email)
      throw new ApiError(404, "Required fields are missing");

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName,
          email,
          username,
        },
      },
      { new: true }
    ).select("-password -refreshToken -createdAt -__v");

    res.status(200).json(new ApiResponse(200, "details updated", user));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while updating account details: " + error
    );
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  try {
    const newAvatarPath = req.file?.path;
    if (!newAvatarPath) throw new ApiError(404, "User avatar required");

    const uploadAvatar = await uploadOnCloudinary(newAvatarPath);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: uploadAvatar.url,
      },
      { new: true }
    ).select("-password -createdAt -__v -refreshToken");

    res
      .status(200)
      .json(new ApiResponse(200, "user avatar update successful", user));
  } catch (error) {
    throw new ApiError(500, error?.message || "Error while update avatar");
  }
});

const updateCoverImage = asyncHandler(async (req, res) => {
  try {
    const newCoverImagePath = req.file?.path;

    if (!newCoverImagePath)
      throw new ApiError(404, "User cover image required");

    const uploadCoverImage = await uploadOnCloudinary(newCoverImagePath);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          coverImage: uploadCoverImage.url,
        },
      },
      { new: true }
    ).select("-password -createdAt -__v -refreshToken");

    res.status(200).json(new ApiResponse(200, "cover image updated", user));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Error while updating cover image"
    );
  }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) throw new ApiError(404, "user not found");

    const channel = await User.aggregate([
      {
        $match: { username: username.toLowerCase() },
      },
      {
        $lookup: {
          from: "subscribes",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscribes",
          localField: "_id",
          foreignField: "subscribe",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          subscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user._id, "$subscribers.subscrib"] },
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
          email: 1,
          subscribersCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
        },
      },
    ]);

    if (!channel || !channel.length)
      throw new ApiError(404, "channel does not exists");

    res
      .status(200)
      .json(
        new ApiResponse(200, "user channel fetched successfully", channel[0])
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error while getting user channel details ${error}`
    );
  }
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const history = await User.aggregate([
    {
      $match: {
        username: req.user.username.toLowerCase(),
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        updatedAt: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  console.log(history[0]);
  if (history && history[0].watchHistory && history[0].watchHistory.length == 0)
    throw new ApiError(404, "no videos found");

  res
    .status(200)
    .json(new ApiResponse(200, "videos fetch successfully", history));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
