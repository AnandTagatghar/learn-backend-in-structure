import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login-user").post(loginUser);
router.route("/logout-user").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshToken);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/get-user").get(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router
  .route("/get-user-channel/:username")
  .get(verifyJWT, getUserChannelProfile);
router.route("/get-watch-history").get(verifyJWT, getWatchHistory);

const userRoute = router;
export { userRoute };
