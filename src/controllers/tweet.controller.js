import {
  create_tweet,
  delete_tweet,
  get_user_tweet,
  update_tweet,
} from "../services/tweet.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) throw new ApiError(404, "Content required");

    const tweet = await create_tweet(content, req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, "Tweet created successfully", tweet));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new ApiError(404, "user id missing");

    const tweets = await get_user_tweet(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Tweets fetched successfully", tweets));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) throw new ApiError(404, "tweetId missing");
    if (!content) throw new ApiError(404, "content missing");

    const response = await update_tweet(content, tweetId, req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, `update tweet success`, response));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;

    if (!tweetId) throw new ApiError(404, "tweetId missing");

    const response = await delete_tweet(tweetId, req.user._id);

    if (response)
      res.status(200).json(new ApiResponse(200, `deleted successfully`));
    else throw new ApiError(500, `Something went wrong`);
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});
export { createTweet, getUserTweets, updateTweet, deleteTweet };
