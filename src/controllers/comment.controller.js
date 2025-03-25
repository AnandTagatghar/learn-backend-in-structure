import {
  add_comment,
  delete_comment,
  get_comments,
  update_comment,
} from "../services/comment.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(404, `video id required`);

    const comments = await get_comments(videoId);

    res
      .status(200)
      .json(new ApiResponse(200, `comments fetched successfully`, comments));
  } catch (error) {
    throw new Error(500, error.message || `Something went wrong`);
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) throw new ApiError(404, `video id required`);
    if (!content) throw new ApiError(404, `comment required`);

    const comment = await add_comment(videoId, req.user._id, content);

    res
      .status(200)
      .json(new ApiResponse(200, `Comment added success`, comment));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) throw new ApiError(404, `Comment id requried`);

    const deleted_comment = await delete_comment(commentId, req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(200, `comment deleted successfully`, deleted_comment)
      );
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!commentId) throw new ApiError(404, `Comment id requried`);
    if (!content) throw new ApiError(404, `Content is required`);

    const updatedComment = await update_comment(
      commentId,
      req.user._id,
      content
    );

    res
      .status(200)
      .json(new ApiResponse(200, `updated comment success`, updatedComment));
  } catch (error) {
    throw new ApiError(500, error.message || `Something went wrong`);
  }
});

export { addComment, getComments, deleteComment, updateComment };
