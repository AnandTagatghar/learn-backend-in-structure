import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  get_subscribed_channels,
  get_user_channel_subscribers,
  toggle_subscription,
} from "../services/subscribe.service.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(404, `channel id required`);

    const channels = await get_subscribed_channels(channelId);

    res
      .status(200)
      .json(new ApiResponse(200, `fetched successfully`, channels));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const { subscriberId } = req.params;
    if (!subscriberId) throw new ApiError(404, `subscriber id required`);

    const subscribers = await get_user_channel_subscribers(subscriberId);

    res.status(200).json(new ApiResponse(200, `subscribers fetched success`, subscribers));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params;
    if (!channelId) throw new ApiError(404, `channel id required`);

    const toggle = await toggle_subscription(channelId, req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `toggle subscription: ${toggle.status}`,
          toggle.return_value
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
