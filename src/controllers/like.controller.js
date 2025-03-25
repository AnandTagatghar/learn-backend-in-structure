import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  get_liked_videos,
  toggle_comment_like,
  toggle_tweet_like,
  toggle_video_like,
} from "../services/like.service.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(404, "video id required");

    const like = await toggle_video_like(videoId, req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `toggle success: ${like.status}`,
          like.return_value
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(404, "comment id required");

    const like = await toggle_comment_like(commentId, req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `toggle success: ${like.status}`,
          like.return_value
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId) throw new ApiError(404, "tweet id required");

    const like = await toggle_tweet_like(tweetId, req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `toggle success: ${like.status}`,
          like.return_value
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const response = await get_liked_videos(req.user._id);
    res
      .status(200)
      .json(
        new ApiResponse(200, `fetched liked videos successfully`, response)
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
