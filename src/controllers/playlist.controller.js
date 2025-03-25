import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  add_video_to_playlist,
  create_playlist,
  delete_playlist_by_id,
  get_playlist_by_id,
  remove_video_from_playlist,
  update_playlist_by_id,
} from "../services/playlist.service.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistName, description } = req.body;

    if (!playlistName) throw new ApiError(404, "Playlist name required");

    const playlist = await create_playlist(
      playlistName,
      req.user._id,
      description
    );

    res
      .status(200)
      .json(new ApiResponse(200, `Playlist created successfully`, playlist));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    if (!playlistId) throw new ApiError(404, `playlist id missing`);
    if (!videoId) throw new ApiError(404, `video id missing`);

    const playlist = await add_video_to_playlist(
      videoId,
      playlistId,
      req.user._id
    );

    res.status(200).json(new ApiResponse(200, `updated playlist`, playlist));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    if (!playlistId) throw new ApiError(404, `playlist id missing`);
    if (!videoId) throw new ApiError(404, `video id missing`);

    const playlist = await remove_video_from_playlist(
      videoId,
      playlistId,
      req.user._id
    );

    res.status(200).json(new ApiResponse(200, `removed success`, playlist));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!playlistId) throw new ApiError(404, `playlist id required`);

    const playlist = await get_playlist_by_id(playlistId);

    res
      .status(200)
      .json(new ApiResponse(200, `fetched playlist success`, playlist));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const updatePlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!playlistId) throw new ApiError(404, `playlist id required`);
    if (!name) throw new ApiError(404, `playlist name required`);
    if (!description) throw new ApiError(404, `playlist description required`);

    const playlist = await update_playlist_by_id(
      playlistId,
      name,
      description,
      req.user._id
    );

    res.status(200).json(new ApiResponse(200, `update success`, playlist));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const deletePlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId) throw new ApiError(404, `playlist id required`);

    const response = await delete_playlist_by_id(playlistId, req.user._id);

    res.status(200).json(new ApiResponse(200, `delete success`, response));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  updatePlaylistById,
  deletePlaylistById,
};
