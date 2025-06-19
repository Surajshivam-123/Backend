import {asyncHandler} from '../utils/asyncHandler.js'
import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Subscription} from "../models/subscription.models.js"
import {User} from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
   try {
     const {channelId} = req.params;
     if(!channel){
         throw new ApiError(404, "Channel not found");
     }
     const videos = await Video.find({
         owner:channelId
     });
     let totalviews = 0;
     for(let video in videos){
         totalviews += video.views;
     }
     const channel = await User.aggregate([
     {
         $match:{
             _id:channelId
         }
     },{
         $lookup:{
             from:"videos",
             localfield:"_id",
             foreignField:"owner",
             as:"videos"
         }
     },{
         $addFields:{
             totalVideoviews:{totalviews},
             totalVideos:{
                 $size:"$videos"
             }
         }
     }]);
 
     if(!channel){
         throw new ApiError(404, "Channel not found");
     }
     const likedby = await Like.aggregate([
         {
             $match:{
                 owner:channelId
             }
         },{
             $group:{
                 _id:null,
                 totalLikes:{
                     $sum:1
                 }
             }
         }
         ,{
             $project:{
                 _id:0,
                 totalLikes:1
             }
         }
     ]);
     if(!likedby){
         throw new ApiError(404, "likedby not found");
     }
 
     return res.status(200).
     json(new ApiResponse(200,{channel,likedby},"channel stats fetched successfully"));
   } catch (error) {
    console.log("Errror",error);
   }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params;
        const videos = await Video.find({
            owner:channelId
        });
        if(videos){
            throw new ApiError(400,"No videos uploaded");
        }
        return res
        .status(200)
        .json(new ApiResponse(200,videos,"All videos uploaded by the channel fetched successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

export {
    getChannelStats, 
    getChannelVideos
    }