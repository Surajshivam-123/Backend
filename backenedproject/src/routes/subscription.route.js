import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels} from '../controllers/subscription.controllers.js';

const router = Router();
router.use(verifyJWT);

router.route("/c/:channelId")
.patch(toggleSubscription)
.get(getSubscribedChannels)

router.route("/c/:subscriberId").get(getUserChannelSubscribers);

export default {router};


