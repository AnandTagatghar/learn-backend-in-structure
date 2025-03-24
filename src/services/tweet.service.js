import mongoose from "mongoose";
import { Tweet } from "../models/tweets.model.js";

const create_tweet = async (content, userId) => {
  try {
    const tweet = await Tweet.create({
      content,
      owner: userId,
    });

    return await Tweet.findById(tweet._id)
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .select("-__v");
  } catch (error) {
    throw new Error(error);
  }
};

const get_user_tweet = async (userId) => {
  try {
    const tweets = await Tweet.find({ owner: userId })
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .select("-__v")
      .sort({ createdAt: -1 });

    if (tweets.length > 0) return tweets;
    else throw new Error("No tweets for this user");
  } catch (error) {
    throw new Error(error);
  }
};

const update_tweet = async (content, tweetId, userId) => {
  try {
    const tweet = await Tweet.findById(tweetId)
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .select("-__v");

    if (!tweet) throw new Error("Tweet not found");

    if (tweet.owner._id.toString() !== userId.toString())
      throw new Error("you are not a owner");

    tweet.content = content;

    await tweet.save();

    return tweet;
  } catch (error) {
    throw new Error(error);
  }
};

const delete_tweet = async (tweetId, userId) => {
  try {
    const tweet = await Tweet.findById(tweetId)
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .select("-__v");

    if (!tweet) throw new Error("Tweet not found");

    if (tweet.owner._id.toString() !== userId.toString())
      throw new Error("you are not a owner");

    await Tweet.findByIdAndDelete(tweetId);

    return true;
  } catch (error) {
    throw new Error(error);
  }
};

export { create_tweet, get_user_tweet, update_tweet , delete_tweet};
