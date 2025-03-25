import { Router } from "express";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getComments).post(addComment);
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

const CommentRouter = router;

export { CommentRouter };
