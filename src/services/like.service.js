import { Like } from "../models/like.model.js";

/**
 *
 * @param {Object} obj
 * @returns
 */
const deleteLike = async (obj) => {
  const response = await Like.findOneAndDelete(obj)
    .populate({
      path: "likedBy",
      select: "-__v -password -refreshToken -watchHistory",
    })
    .populate({
      path: "video",
      select: "-__v -videoFilePublicId -thumbnailPublicId",
      populate: {
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      },
    })
    .populate({
      path: "tweet",
      select: "-__v",
      populate: {
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      },
    })
    .populate({
      path: "comment",
      select: "-__v",
      populate: [
        {
          path: "owner",
          select: "-__v -password -refreshToken -watchHistory",
        },
        {
          path: "video",
          select: "-__v -thumbnailPublicId -videoFilePublicId",
          populate: {
            path: "owner",
            select: "-__v -password -refreshToken -watchHistory",
          },
        },
      ],
    })
    .select("-__v");

  return response;
};

/**
 *
 * @param {String} ID
 * @returns
 */
const makeLikeById = async (ID) => {
  const return_value = await Like.findById(ID)
    .populate({
      path: "likedBy",
      select: "-__v -password -refreshToken -watchHistory",
    })
    .populate({
      path: "video",
      select: "-__v -videoFilePublicId -thumbnailPublicId",
      populate: {
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      },
    })
    .populate({
      path: "tweet",
      select: "-__v",
      populate: {
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      },
    })
    .populate({
      path: "comment",
      select: "-__v",
      populate: [
        {
          path: "owner",
          select: "-__v -password -refreshToken -watchHistory",
        },
        {
          path: "video",
          select: "-__v -thumbnailPublicId -videoFilePublicId",
          populate: {
            path: "owner",
            select: "-__v -password -refreshToken -watchHistory",
          },
        },
      ],
    })
    .select("-__v");

  return return_value;
};

/**
 *
 * @param {String} videoId
 * @param {String} userId
 * @returns
 */
const toggle_video_like = async (videoId, userId) => {
  try {
    const delete_like = await deleteLike({
      video: videoId,
      likedBy: userId,
    });

    if (!delete_like) {
      const add_like = await Like.create({
        video: videoId,
        likedBy: userId,
      });

      const return_value = await makeLikeById(add_like._id);

      if (return_value) return { status: "liked", return_value };
      else throw new Error(`Failed to like`);
    } else {
      return { status: "disliked", return_value: delete_like };
    }
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
const toggle_comment_like = async (commentId, userId) => {
  const dislikeComment = await deleteLike({
    comment: commentId,
    likedBy: userId,
  });

  if (!dislikeComment) {
    const add_like = await Like.create({
      comment: commentId,
      likedBy: userId,
    });

    const return_value = await makeLikeById(add_like._id);

    return { status: "like", return_value };
  } else {
    return { status: "dislike", return_value: dislikeComment };
  }
};

/**
 *
 * @param {String} tweetId
 * @param {String} userId
 * @returns
 */
const toggle_tweet_like = async (tweetId, userId) => {
  const dislikeTweet = await deleteLike({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!dislikeTweet) {
    const add_like = await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });

    const return_value = await makeLikeById(add_like._id);

    return { status: "like", return_value };
  } else {
    return { status: "dislike", return_value: dislikeTweet };
  }
};


/**
 * 
 * @param {String} userId 
 * @returns 
 */
const get_liked_videos = async (userId) => {
  try {
    const likedVideos = await Like.find({
      likedBy: userId,
      video: { $ne: null },
    })
      .populate({
        path: "video",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
        populate: {
          path: "owner",
          select: "-__v -password -refreshToken -watchHistory",
        },
      }).populate({
        path: "likedBy",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .select("-__v");

    if (likedVideos.length > 0) return likedVideos;
    else throw new Error(`No liked videos found`);
  } catch (error) {
    throw new Error(error);
  }
};

export {
  toggle_video_like,
  toggle_comment_like,
  toggle_tweet_like,
  get_liked_videos,
};
