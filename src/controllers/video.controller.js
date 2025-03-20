import { Video } from "../models/videos.model.js";
import {
  deleteVideo,
  fetchVideoByVideoId,
  fetchVideos,
  toggleUpdate,
  update,
} from "../services/video.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (
      !title ||
      !description ||
      !req.files?.videoFile ||
      !req.files?.thumbnail
    )
      throw new ApiError(400, "Required fields are missing");

    const uploadVideo = await uploadOnCloudinary(req.files.videoFile[0]?.path);
    const uploadthumbnail = await uploadOnCloudinary(
      req.files.thumbnail[0]?.path
    );

    const video = await Video.create({
      videoFile: uploadVideo.url,
      videoFilePublicId: uploadVideo.public_id,
      thumbnail: uploadthumbnail.url,
      thumbnailPublicId: uploadthumbnail.public_id,
      owner: req.user._id,
      title,
      description,
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
  try {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    if (!query && !sortBy && !userId)
      throw new ApiError(400, "Bad GateWay: what to search");

    let videos = await fetchVideos(req.query);

    if (videos) {
      return res
        .status(200)
        .json(new ApiResponse(200, "videos fetched successfully", videos));
    }

    throw new ApiError(404, "No videos found");
  } catch (error) {
    throw new ApiError(500, `Something went wrong while feching ${error}`);
  }
});

const getVideoByVideoId = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(404, "UserId required");

    const video = await fetchVideoByVideoId(videoId);

    if (video) {
      return res
        .status(200)
        .json(new ApiResponse(200, "video fetched by videoId success", video));
    }
    throw new ApiError(404, "No videos found by videoId: " + videoId);
  } catch (error) {
    throw new ApiError(500, `Something went wrong while fetching ${error}`);
  }
});

const deleteVideoByVideoId = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) throw new ApiError(404, "Video ID required");

    const video = await deleteVideo(videoId, req.user._id);

    if (video == true)
      return res
        .status(200)
        .json(new ApiResponse(200, `video deletetion success`));

    throw new ApiError(500, `Something went wrong on deletion ${error}`);
  } catch (error) {
    throw new ApiError(500, `Something went wrong on deletion ${error}`);
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  try {
    if (!req.params.videoId) throw new ApiError(404, `video id required`);

    const { title, description } = req.body;

    if (
      !title &&
      !description &&
      !req.files?.videoFile &&
      !req.files?.thumbnail
    )
      throw new ApiError(404, `No fields are passed to update`);

    const updatedVideoObj = await update(
      req.params.videoId,
      req.user._id,
      req.files,
      req.body
    );

    if (updatedVideoObj)
      res
        .status(200)
        .json(new ApiResponse(200, `Video file updated`, updatedVideoObj));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const updateToggleService = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(404, `Video id required`);

    let response = await toggleUpdate(videoId, req.body, req.user._id);

    return res
      .status(200)
      .json(new ApiResponse(200, `updated published toggled`, response));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export {
  uploadVideo,
  getAllVideos,
  getVideoByVideoId,
  deleteVideoByVideoId,
  updateVideo,
  updateToggleService,
};
