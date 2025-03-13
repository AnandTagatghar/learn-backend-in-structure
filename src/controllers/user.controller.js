import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError";
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

  if (!req.file?.avatar) throw new ApiError(400, "Avatar is required");

  let avatar = await uploadOnCloudinary(req.file.avatar[0]?.path);
  let coverImage = await uploadOnCloudinary(req.file.coverImage[0]?.path);

  let userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(403, "User already exists");
  }

  let user = await User.insertOne(
    {
      fullName,
      email,
      password,
      username,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    },
    (err, res) => {
      if (err)
        throw new ApiError(500, "something went wrong while registeration");

      return res;
    }
  );

  user = user.map((field) => field != "password" || field != "refreshToken");
  console.log(user);

  res.status(200).json(new ApiResponse(200, "user created successfully", user));
});

export { registerUser };
