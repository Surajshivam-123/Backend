import {Router} from 'express';
import {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from '../controllers/video.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const videoRouter=Router();
videoRouter.use(verifyJWT);//this middleware will use in every routes

videoRouter.route("/")
.get(getAllVideos)
.post(
    upload.fields([{
        name:'videofile',
        maxCount:1
    },{
        name:'thumbnail',
        maxCount:1
    }]),
    publishVideo
);

videoRouter.route("/:videoId")
        .get(getVideoById)
        .delete(deleteVideo)
        .patch(upload.single("thumbnail"),updateVideo)

videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export {videoRouter};

