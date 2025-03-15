import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.headers("Authorization").replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodeToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodeToken) throw new ApiError(401, "Invalid Access Token");

    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid Access Token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
};

export { verifyJWT };
