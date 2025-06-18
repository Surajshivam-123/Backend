import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.models.js";
import {uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
    try {
        const {content} = req.body;
        const photoLocalPath = req.file?.path;
        if(content==="" && photoLocalPath){
            throw new ApiError(400,"Content or Photo is required.")
        }
        const photo = await uploadOnCloudinary(photoLocalPath);
        const tweet = await Tweet.create({
            owner:req.user?._id,
            content,
            photo:{
                url:photo?.url,
                public_id:photo?._id
            }
        });
        if(!tweet){
            throw new ApiError(400,"Failed to create tweet");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,tweet,"Tweeted successfully.")
        )
    } catch (error) {
        console.log("Error:",error);
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
   try {
     const tweets = await Tweet.find(
        {
        owner:req.user?._id
        }
        ).sort({createdAt:-1});
     if(!tweets){
         throw new ApiError(400,"User tweets not fetched");
     }
     return res.status(200)
     .json(new ApiResponse(200,tweets,"User tweets fetched succesfully"));
   } catch (error) {
        console.log("Error:",error);
   }
});

const updateTweet = asyncHandler(async (req, res) => {
    try {
        const {content} = req.body;
        if(!content){
            throw new ApiError(400,"Content is required");
        }
        const tweetId = req.params?.tweetId;
        if(!tweetId){
            throw new ApiError(400,"Tweet id is required");
        }
        const tweet = await Tweet.findByIdAndUpdate(tweetId,{
            content
        });
        if(!tweet){
            throw new ApiError(400,"Failed to update tweet");
        }
        return res
        .status(200)
        .json(new ApiResponse(200,tweet,"tweet updated successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const tweetId = req.params?.tweetId;
        if(!tweetId){
            throw new ApiError(400,"Tweet id is required");
        }
        const tweet = await Tweet.findByIdAndDelete(tweetId);
        if(!tweet){
            throw new ApiError(400,"Tweet is not fetched");
        }
        return res
        .status(200)
        .json(new ApiResponse(200,tweet,"Tweet is deleted"));
    } catch (error) {
        console.log("Error:",error);
    }
})
export { createTweet,
         getUserTweets,
         updateTweet,
         deleteTweet
};
