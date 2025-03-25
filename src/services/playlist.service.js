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
    const playlist = await Playlist.findOneAndUpdate(
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

/**
 *
 * @param {String} playlistId
 * @returns
 */
const get_playlist_by_id = async (playlistId) => {
  try {
    const playlist = await Playlist.findById(playlistId)
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "videos",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
        populate: {
          path: "owner",
          select: "-__v -password -password -refreshToken -watchHistory",
        },
      })
      .select("-__v");

    if (playlist) return playlist;
    else throw new Error(`Playlist not available`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} playlistId
 * @param {String} name
 * @param {String} description
 * @param {String} userId
 * @returns
 */
const update_playlist_by_id = async (playlistId, name, description, userId) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: userId,
      },
      { $set: { name, description } },
      { new: true }
    )
      .populate({
        path: "owner",
        select: "-__v -password -refreshToken -watchHistory",
      })
      .populate({
        path: "videos",
        select: "-__v -videoFilePublicId -thumbnailPublicId",
        populate: {
          path: "owner",
          select: "-__v -password -password -refreshToken -watchHistory",
        },
      })
      .select("-__v");

    if (playlist) return playlist;
    else throw new Error(`Playlist not found`);
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * @param {String} playlistId
 * @param {String} userId
 * @returns
 */
const delete_playlist_by_id = async (playlistId, userId) => {
  try {
    const deleteDoc = await Playlist.findOneAndDelete(
      {
        _id: playlistId,
        owner: userId,
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
          select: "-__v -password -password -refreshToken -watchHistory",
        },
      })
      .select("-__v");

    if (deleteDoc) return deleteDoc;
    else throw new Error(`playlist not found`);
  } catch (error) {
    throw new Error(error);
  }
};

export {
  create_playlist,
  add_video_to_playlist,
  remove_video_from_playlist,
  get_playlist_by_id,
  update_playlist_by_id,
  delete_playlist_by_id,
};
