import {Like} from '../models/like.models.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js'

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params;
        if(!videoId){
            throw new ApiError(400,"VideoId is required");
        }
        const liked = await Like.findOne({
            likedby:req.user?._id,
            video:videoId
        });
        if(liked){
            await Like.findByIdAndDelete(liked._id);
            return res.status(200).json(new ApiResponse(200,liked,"Like removed on video"));
        }
        const like = await Like.create({
            likedby:req.user?._id,
            video:videoId
        });
        return res.status(200).json(new ApiResponse(200,like,"Like add on video"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params
        if(!commentId){
            throw new ApiError(400,"CommentId is required");
        }
        const liked = await Like.findOne({
            likedby:req.user?._id,
            comment:commentId
        });
        if(liked){
            await Like.findByIdAndDelete(liked._id);
            return res.status(200).json(new ApiResponse(200,liked,"Like removed on comment"));
        }
        const like = await Like.create({
            likedby:req.user?._id,
            comment:commentId
        });
        return res.status(200).json(new ApiResponse(200,like,"Like add on comment"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params
        if(!tweetId){
            throw new ApiError(400,"tweetId is required");
        }
        const liked = await Like.findOne({
            likedby:req.user?._id,
            tweet:tweetId
        });
        if(liked){
            await Like.findByIdAndDelete(liked._id);
            return res.status(200).json(new ApiResponse(200,liked,"Like removed on tweet"));
        }
        const like = await Like.create({
            likedby:req.user?._id,
            tweet:tweetId
        });
        return res.status(200).json(new ApiResponse(200,like,"Like add on tweet"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const likedVideos = await Like.find({
            likedby:req.user?._id,
            video: { 
                $exists: true
             } 
        });
        if(!likedVideos){
            throw new ApiError(404,"No liked videos found");
        }
        return res.status(200).json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};  