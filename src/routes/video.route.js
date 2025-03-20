import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideoByVideoId,
  getAllVideos,
  getVideoByVideoId,
  updateToggleService,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/upload-video").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

router.route("/get-all-videos").get(getAllVideos);

router
  .route("/video/:videoId")
  .get(getVideoByVideoId)
  .delete(deleteVideoByVideoId)
  .patch(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    updateVideo
  );

router.route("/toggle/publish/:videoId").patch(updateToggleService);

const videoRoute = router;
export { videoRoute };
