import { Router } from "express";
import {toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos} from '../controllers//like.controllers.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likeRouter = Router();
likeRouter.use(verifyJWT);

likeRouter.route("/v/:videoId").patch(toggleVideoLike);
likeRouter.route("/c/:commentId").patch(toggleCommentLike);
likeRouter.route("/t/:tweetId").patch(toggleTweetLike);
likeRouter.route("/video").get(getLikedVideos);

export {likeRouter};