import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels} from '../controllers/subscription.controllers.js';

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/c/:channelId")
.patch(toggleSubscription)
.get(getSubscribedChannels)

subscriptionRouter.route("/s/:subscriberId").get(getUserChannelSubscribers);

export {subscriptionRouter};


