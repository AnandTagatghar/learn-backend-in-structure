import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const fetchVideos = async (incoming_query) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType,
    userId,
  } = incoming_query;

  if (!query && !sortBy && !userId) return null;

  const matchStage = { isPublished: true };
  let scoreRequired = false;

  if (query || sortBy) {
    scoreRequired = true;
    matchStage.$text = { $search: query };
  }

  if (userId) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  let aggeregate_query = [
    {
      $match: matchStage,
    },

    ...(scoreRequired
      ? [
          {
            $sort: { score: { $meta: "textScore" } },
          },
        ]
      : []),
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              email: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { path: "$ownerDetails" },
    },
    {
      $project: {
        __v: 0,
        owner: 0,
      },
    },
    ...(sortType && sortType == "latest"
      ? [{ $sort: { createdAt: -1 } }]
      : sortType && sortType == "oldest"
        ? [{ $sort: { createdAt: 1 } }]
        : []),
  ];

  const videos = await Video.aggregate(aggeregate_query);

  if (videos.length > 0) return videos;
  else return null;
};

const fetchVideoByVideoId = async (videoId) => {
  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
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
              __v: 0,
              password: 0,
              watchHistory: 0,
              refreshToken: 0,
            },
          },
        ],
      },
    },
    {
      $project: {
        __v: 0,
      },
    },
    {
      $unwind: { path: "$owner" },
    },
  ]);

  if (video.length > 0) return video;
  else return null;
};

const deleteVideo = async (videoId, userId) => {
  try {
    let video = await Video.findById(videoId);

    if (!video) throw new Error("Video not available");

    if (video.owner.toString() !== userId.toString())
      throw new Error("Not a owner");

    await destroyOnCloudinary(video.videoFilePublicId);
    await destroyOnCloudinary(video.thumbnailPublicId);

    await Video.findByIdAndDelete(videoId);

    return true;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (videoId, userId, files, body) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");
    if (video.owner.toString() !== userId.toString())
      throw new Error("Not a owner");

    let updateObject = {};
    if (files.videoFile) {
      const videoMimeTypes = [
        "video/mp4",
        "video/x-msvideo",
        "video/quicktime",
        "video/x-matroska",
      ];
      if (!videoMimeTypes.includes(files.videoFile[0]?.mimetype))
        throw new Error("Invalid file type. Please upload a valid video.");

      await destroyOnCloudinary(video.videoFilePublicId);
      let response = await uploadOnCloudinary(files.videoFile[0]?.path);

      if (response) {
        updateObject.videoFile = response.url;
        updateObject.videoFilePublicId = response.public_id;
      }
    }

    if (files.thumbnail) {
      const imageMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!imageMimeTypes.includes(files.thumbnail[0].mimetype))
        throw new Error("Invalid file type. Please upload a valid image.");

      await destroyOnCloudinary(video.thumbnailPublicId);
      let response = await uploadOnCloudinary(files.thumbnail[0]?.path);
      if (response) {
        updateObject.thumbnail = response.url;
        updateObject.thumbnailPublicId = response.public_id;
      }
    }

    if (body.title) {
      updateObject.title = body.title;
    }

    if (body.description) {
      updateObject.description = body.description;
    }

    let updatedVideo = await Video.findByIdAndUpdate(videoId, updateObject, {
      new: true,
    })
      .populate({
        path: "owner",
        select: "-password -__v -watchHistory -refreshToken",
      })
      .select("-__v -videoFilePublicId -thumbnailPublicId");

    return updatedVideo;
  } catch (error) {
    throw new Error(error);
  }
};

const toggleUpdate = async (videoId, body, userId) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");

    if (video.owner.toString() !== userId.toString())
      throw new Error("You are not a owner");

    if (body.isPublished == video.isPublished)
      throw new Error(`Already ${video.isPublished}`);

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { isPublished: body.isPublished },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "-password -__v -watchHistory -refreshToken",
      })
      .select("-__v -videoFilePublicId -thumbnailPublicId");

    return updatedVideo;
  } catch (error) {
    throw new Error(error);
  }
};

export { fetchVideos, fetchVideoByVideoId, deleteVideo, update, toggleUpdate };
