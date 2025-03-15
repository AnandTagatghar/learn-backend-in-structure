import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };
