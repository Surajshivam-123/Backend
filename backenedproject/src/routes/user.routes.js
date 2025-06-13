import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken, changeCurrentPassword,getUser,updateAccountDetails,updateAvatar,updateCover,getUserCahnnelProfile,getWatchHistory} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getUser);//no need to send data
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/update-cover-image").patch(verifyJWT,upload.single("Cover"),updateCover);
router.route("/channel/:username").get(verifyJWT,getUserCahnnelProfile);//username variable gets value using params
router.route("/watch-history").get(verifyJWT,getWatchHistory);
//https://localhost:8000/api/v1/users/register
export default  router;//if default then we can import by any name