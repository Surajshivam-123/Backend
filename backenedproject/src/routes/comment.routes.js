import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/comment.controllers.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router();
commentRouter.use(verifyJWT);

commentRouter.route("/:videoId").get(getVideoComments)
                        .post(addComment);

commentRouter.route("/:commentId").patch(updateComment)
                            .delete(deleteComment);

export  {commentRouter};