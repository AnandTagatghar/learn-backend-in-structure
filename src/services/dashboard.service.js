import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";

const get_channel_videos = async (userId) => {
  try {
    const videos = await Video.find({
      owner: userId,
    })
      .populate({
        path: "owner",
        select: "-__v -password -watchHistory -refreshToken",
      })
      .select("-__v -videoFilePublicId -thumbnailPublicId");

    if (videos.length > 0) return videos;
    else throw new Error(`No videos found`);
  } catch (error) {
    throw new Error(error);
  }
};

const get_channel_stats = async (userId) => {
  try {
    const videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          countViews: { $sum: "$views" },
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "subscribes",
          localField: "owner",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $addFields: {
          totalVideosInNumber: "$count",
          totalViewsInNumber: "$countViews",
          totalSubscribersInNumber: {
            $size: "$subscribers",
          },
          totalLikesInNumber: {
            $size: "$likes",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                password: 0,
                __v: 0,
                refreshToken: 0,
                watchHistory: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          totalVideosInNumber: 1,
          totalViewsInNumber: 1,
          totalSubscribersInNumber: 1,
          totalLikesInNumber: 1,
          _id:0
        },
      },
    ]);
    if (!videos) throw new Error("Nothing found");
    return videos;
  } catch (error) {
    throw new Error(error);
  }
};

export { get_channel_videos, get_channel_stats };
