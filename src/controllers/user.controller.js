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
      "something went wrong while generating access token and refresh token" +
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

export { registerUser, loginUser };
