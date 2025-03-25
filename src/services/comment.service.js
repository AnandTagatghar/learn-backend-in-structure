import { Comment } from "../models/comment.model.js";

/**
 *
 * @param {String} videoId
 * @param {String} userId
 * @param {String} content
 * @returns
 */
const add_comment = async (videoId, userId, content) => {
  try {
    const comment = await Comment.create({
      video: videoId,
      owner: userId,
      content,
    });

    const return_comment = await Comment.findById(comment._id)
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "video",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
      })
      .select("-__v");

    if (return_comment) return return_comment;
    else throw new Error(`Comment not added`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} videoId
 * @returns
 */
const get_comments = async (videoId) => {
  try {
    const comments = await Comment.find({
      video: videoId,
    })
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "video",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
      })
      .select("-__v")
      .sort({
        createdAt: -1,
      });

    if (comments.length>0) return comments;
    else throw new Error(`Comments not found`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} commentId
 * @param {String} userId
 * @returns
 */
const delete_comment = async (commentId, userId) => {
  try {
    const deleteComment = await Comment.findOneAndDelete(
      {
        _id: commentId,
        owner: userId,
      },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "video",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
      })
      .select("-__v");

    if (deleteComment) return deleteComment;
    else throw new Error(`Comment not found`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} commentId
 * @param {String} userId
 * @param {String} content
 * @returns
 */
const update_comment = async (commentId, userId, content) => {
  try {
    const updatedComment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        owner: userId,
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "video",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
      })
      .select("-__v");

    if (updatedComment) return updatedComment;
    else throw new Error(`Comment not updated`);
  } catch (error) {
    throw new Error(error);
  }
};

export { add_comment, get_comments, update_comment, delete_comment };
