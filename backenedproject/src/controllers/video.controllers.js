import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const uploadVideo = asyncHandler(async(req,res)=>{
    //steps to upload video on web
    //1.get video details from backend
    //2.check for thumbnail
    //3.upload them to cloudinary
    //4.create video object create entry in database
    //5.send response to frontend
    try {
        const {title,description,duration,isPublished,access} =req.body;
    
        if(([title,description].some((field=>field?.trim()===""))) && !duration){
            throw new ApiError(400,"All fields are required.")
        };
        if(access!="public" || access!="private"){
            throw new ApiError(400,"Access is not appropriate");
        }
    
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
        const videoLocalPath = req.files?.videofile[0]?.path;
    
    
        if(!thumbnailLocalPath){
            throw new ApiError(400,"Thumbnail is Required.");
        }
        if(!videoLocalPath){
            throw new ApiError(400,"Video is Required.");
        }
        if(!isPublished){
            throw new ApiError(400,"Video is not published.");
        }
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        const videofile = await uploadOnCloudinary(videoLocalPath);
        if(!thumbnail){
            throw new ApiError(400,"Error in uploading thumbnail.");
        }
        if(!videofile){
            throw new ApiError(400,"Error in uploading video file.");
        }


        const video = await Video.create({
            videofile:videofile.url,
            thumbnail:thumbnail.url,
            title,
            description,
            duration,
            access,
            owner:req.user?._id,
            views
        });
    
        res.status(200)
        .json(
            new ApiResponse(200,video,"Video uploaded successfully.")
        );
    } catch (error) {
        console.log("Error",error);
    }
});

export {
    uploadVideo
};