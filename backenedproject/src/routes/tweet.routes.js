import {Router} from 'express';
import { createTweet,
         getUserTweets,
         updateTweet,
         deleteTweet
} from '../controllers/tweet.controllers.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
const tweetRouter = Router();
tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(createTweet);
tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export {tweetRouter};
