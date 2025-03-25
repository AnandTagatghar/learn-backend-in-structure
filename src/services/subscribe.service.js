import { Subscribe } from "../models/subscriptions.model.js";

/**
 *
 * @param {String} channelId
 * @returns
 */
const get_subscribed_channels = async (channelId) => {
  try {
    const channel = await Subscribe.find({
      subscribe: channelId,
    })
      .populate({
        path: "subscribe",
        select: "-__v -refreshToken -password -watchHistory",
      })
      .select("-__v -channel");

    if (channel.length > 0) return channel;
    else throw new Error(`No channels subscribed`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} subscriberId
 * @returns
 */
const get_user_channel_subscribers = async (subscriberId) => {
  try {
    const subscribers = await Subscribe.find({
      channel: subscriberId,
    })
      .populate({
        path: "channel",
        select: "-__v -refreshToken -password -watchHistory",
      })
      .select("-__v -subscribe");

    if (subscribers.length > 0) return subscribers;
    else throw new Error(`No subscribers`);
  } catch (error) {
    throw new Error(error);
  }
};

const toggle_subscription = async (channelId, userId) => {
  const subscribed = await Subscribe.findOneAndDelete({
    channel: userId,
    subscribe: channelId,
  })
    .populate({
      path: "subscribe",
      select: "-__v -refreshToken -password -watchHistory",
    })
    .populate({
      path: "channel",
      select: "-__v -refreshToken -password -watchHistory",
    })
    .select("-__v");

  if (subscribed) {
    return { status: "unsubscribed", return_value: subscribed };
  } else {
    const subscribe = await Subscribe.create({
      subscribe: userId,
      channel: channelId,
    });

    const return_value = await Subscribe.findById(subscribe._id)
      .populate({
        path: "subscribe",
        select: "-__v -refreshToken -password -watchHistory",
      })
      .populate({
        path: "channel",
        select: "-__v -refreshToken -password -watchHistory",
      })
      .select("-__v");

    return { status: "subscribed", return_value };
  }
};

export {
  get_subscribed_channels,
  toggle_subscription,
  get_user_channel_subscribers,
};
