import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params;
        if(!channelId){
            throw new ApiError(200,"ChannelId not found");
        }
        if(channelId===String(req.user?._id)){
            throw new ApiError(400,"You cannot subscribe to yourself");
        }
        const existingChannel = await Subscription.findOne({
            subscriber:req.user?._id,
            channel: channelId
        });
        if(existingChannel){
            const sub = await Subscription.findByIdAndDelete(existingChannel._id);
            return res.status(200).json(
                new ApiResponse(200,sub,"Unsubscribed successfully")
            );
        }
        const newSubscription = await Subscription.create({
            subscriber:req.user?._id,
            channel:channelId
        });
        return res.status(200).json(
            new ApiResponse(200,newSubscription,"Subscribed successfully")
        );
    } catch (error) {
        console.log("Error:",error);
    }

});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const {subscriberId} = req.params;
        if(!subscriberId){
            throw new ApiError(200,"subscriberId not found");
        }
        const subscriber = await Subscription.find({
                channel:subscriberId
        });
        return res
        .status(200)
        .json(
            new ApiResponse(200,subscriber,"Subsciber of user fetched successfully")
        );
    } catch (error) {
        console.log("Error:",error);
    }

});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) {
            throw new ApiError(200, "channelId not found");
        }
        const channels = await Subscription.find({
                subscriber:channelId
        });
    
        return res
        .status(200)
        .json(
            new ApiResponse(200,channels,"Channel list fetched successfully")
        );
    } catch (error) {
        console.log("Error",error);
    }
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}