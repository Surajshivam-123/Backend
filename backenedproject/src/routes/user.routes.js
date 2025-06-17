import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken, changeCurrentPassword,getUser,updateAccountDetails,updateAvatar,updateCover,getUserCahnnelProfile,getWatchHistory} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
//import {app} from "../app.js";
const userRouter = Router();

//app.use("/api/v1/users",router);//cannot be written here

userRouter.route("/register").post(
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
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword);
userRouter.route("/current-user").get(verifyJWT,getUser);//no need to send data
userRouter.route("/update-account-details").patch(verifyJWT,updateAccountDetails);
userRouter.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
userRouter.route("/update-cover-image").patch(verifyJWT,upload.single("Cover"),updateCover);
userRouter.route("/channel/:username").get(verifyJWT,getUserCahnnelProfile);//username variable gets value using params
userRouter.route("/watch-history").get(verifyJWT,getWatchHistory);
//https://localhost:8000/api/v1/users/register
export {userRouter};//if default then we can import by any name