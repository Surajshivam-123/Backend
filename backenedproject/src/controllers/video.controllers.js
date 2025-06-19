import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getAllVideos = asyncHandler(async (req, res) => {
    try {
        let { page = 1, limit = 10, query="", sortBy, sortType} = req.query;
    
        page=parseInt(page);
        limit=parseInt(limit);
        if(query===''){
            throw new ApiError(400,"Query is required.")
        }
        const videoArray = await Video.find({
            $or:[
                {
                title:{
                    $regex:query,
                    $options:"i"
                    },
                },
                {
                description:{
                    $regex:query,
                    $options:"i"
                    }
                }
            ]
        })
        .sort({[sortBy]:sortType=="asc"?1:-1})
        .populate("owner","fullname")
        .skip((page-1)*limit)
        .limit(limit);
        if(!videoArray){
            throw new ApiError(404,"No videos found.")
        };

        return res
        .status(200)
        .json(
            new ApiResponse(200,videoArray,"Video fetched successfully.")
        );
    } catch (error) {
        console.log("Error:",error);
    }
});
    
const publishVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description,access} = req.body;
        if(access!="public" && access!="private"){
                throw new ApiError(400,"Access is not appropriate");
        }
        if(!(title || description)){
            throw new ApiError(400,"Title and description are required.")
        }
        const videoLocalPath = req.files?.videofile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
        if(!thumbnailLocalPath){
                throw new ApiError(400,"Thumbnail is Required.");
            }
        if(!videoLocalPath){
            throw new ApiError(400,"Video is Required.");
        }
        const videofile = await uploadOnCloudinary(videoLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!(videofile || thumbnail)){
            throw new ApiError(400,"Video and Thumbnail is not uploaded");
        }
        const video = await Video.create(
            {
                title,
                videofile:videofile.url,
                thumbnail:thumbnail.url,
                title,
                description,
                duration:videofile.duration,
                owner:req.user._id,
                access
            }
        );
        if(!video){
            throw new ApiError(400,"Video is not created");
        }
        res.status(200)
            .json(
                new ApiResponse(200,video,"Video published successfully.")
            );
    } catch (error) {
        console.log("Error:",error);
    }
   
})

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(404,"Video not found");
        }
        res.status(200)
        .json(new ApiResponse(200,video,"Video fetched successfully."));
    } catch (error) {
        console.log("ERRr:",error);
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params;
        const {title,description,access} = req.body;
        const thumbnailLocalPath = req.file?.path;
        if(!thumbnailLocalPath){
             throw new ApiError(400,"Thumbnail is required.")           
        }
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(access!="public" && access!="private"){
            throw new ApiError(400,"Access is not appropriate");
        }
        if(!(title || description)){
            throw new ApiError(400,"Title and description are required.")
        }
        const video = await Video.findByIdAndUpdate(videoId,{
            $set:{
                title,
                description,
                access,
                thumbnail:thumbnail.url
            }
        });
        if(!video){
            throw new ApiError(404,"Video not found");
        }
    
        res.status(200)
        .json(new ApiResponse(200,video,"Video details updated successfully."));
    } catch (error) {
        console.log("Error:",error);
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findByIdAndDelete(videoId);
    return res.status(200)
    .json(new ApiResponse(200,video,"Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const videofile = await Video.findById(videoId);
    if(!videofile){
        throw new ApiError(404,"Video not found");
    }
    const video = await Video.findByIdAndUpdate(videoId, {
        $set:{
            isPublished: !videofile.isPublished
        }
    });
    return res.status(200)
    .json(new ApiResponse(200,video,"Toggled public status successfully."));
});


export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};