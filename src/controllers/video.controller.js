import { Video } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !req.files?.videoFile || !req.files?.thumbnail)
      throw new ApiError(400, "Required fields are missing");

    console.log("start");
    const uploadVideo = await uploadOnCloudinary(req.files.videoFile[0]?.path);
    const uploadthumbnail = await uploadOnCloudinary(
      req.files.thumbnail[0]?.path
    );

    const video = await Video.create({
      videoFile: uploadVideo.url,
      thumbnail: uploadthumbnail.url,
      owner: req.user._id,
      title,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "video uploaded successfully", video));
  } catch (error) {
    throw new ApiError(
      500,
      `something went wrong while uploading vide: ${error}`
    );
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const videos = Video.aggregate([
    {
      title: {
        $regex: sortType,
        $options: "i",
      },
    },
  ]);
});

export { uploadVideo, getAllVideos };
