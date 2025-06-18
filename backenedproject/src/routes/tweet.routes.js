import {Router} from 'express';
import { createTweet,
         getUserTweets,
         updateTweet,
         deleteTweet
} from '../controllers/tweet.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {upload} from "../middlewares/multer.middleware.js"

const tweetRouter = Router();
tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(upload.none(),createTweet);
tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(upload.none(),updateTweet).delete(deleteTweet);

export {tweetRouter};
