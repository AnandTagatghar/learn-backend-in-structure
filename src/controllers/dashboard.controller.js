import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  get_channel_stats,
  get_channel_videos,
} from "../services/dashboard.service.js";

const getChannelVideos = asyncHandler(async (req, res) => {
  try {
    const videos = await get_channel_videos(req.user._id);
    res
      .status(200)
      .json(new ApiResponse(200, `Videos fetched success`, videos));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    const response = await get_channel_stats(req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, `data fetched success`, response));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export { getChannelVideos, getChannelStats };
