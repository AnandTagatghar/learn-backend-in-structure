import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylistById,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylistById,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylistById)
  .delete(deletePlaylistById);

const playlistRoute = router;

export { playlistRoute };
