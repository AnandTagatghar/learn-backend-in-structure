import { Playlist } from "../models/playlist.model.js";
/**
 *
 * @param {String} playlistName
 * @param {String} userId
 * @param {String} description
 */
const create_playlist = async (playlistName, userId, description) => {
  try {
    const playlist = await Playlist.create({
      name: playlistName,
      owner: userId,
      description: description,
    });

    delete playlist.__v;

    if (playlist) return playlist;
    else throw new Error("No Playlist found");
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} videoId
 * @param {String} playlistId
 * @param {String} userId
 * @returns
 */
const add_video_to_playlist = async (videoId, playlistId, userId) => {
  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) throw new Error("Play list not found");

    if (playlist.owner.toString() !== userId.toString())
      throw new Error(`You are not a owner`);

    const updated_playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: videoId,
        },
      },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "videos",
        populate: {
          path: "owner",
          select: "-__v -password -refreshToken -watchHistory",
        },
        select: "-__v",
      })
      .sort({
        createdAt: -1,
      });

    if (updated_playlist) return updated_playlist;
    else throw new Error("No Playlist found");
  } catch (error) {
    throw new Error(error);
  }
};

const remove_video_from_playlist = async (videoId, playlistId, userId) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      { _id: playlistId, owner: userId },
      {
        $pull: { videos: videoId },
      },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "-__v -password -watchHistory -refreshToken",
      })
      .populate({
        path: "videos",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
        populate: {
          path: "owner",
          select: "-__v -password -watchHistory -refreshToken",
        },
      })
      .select("-__v");
    return playlist;
  } catch (error) {
    throw new Error(error);
  }
};

export { create_playlist, add_video_to_playlist, remove_video_from_playlist };
