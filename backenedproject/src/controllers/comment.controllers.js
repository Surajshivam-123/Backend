import {Comment} from '../models/comment.models.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'


const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query
        const comment = await Comment.find({
            video:videoId
        })
        .skip((page-1)*limit)
        .limit(limit);
        if(!comment){
            throw new ApiError(400,"No comments");
        }
        return res.status(200)
        .json(new ApiResponse(200,comment,"All comments fetched successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const addComment = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params;
        const {content} = req.body;
        if(!(videoId)){
            throw new ApiError(400,"Video id is required");
        }
        if(!(content)){
            throw new ApiError(400,"Comment content is required");
        }
        const comment = await Comment.create({
            content,
            video:videoId,
            owner:req.user._id
        });
        if(!comment){
            throw new ApiError(400,"Comment not created");
        }
        return res
        .status(201)
        .json(new ApiResponse(200,comment,"Comment add successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const updateComment = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params;
        const {content} = req.body;
        if(!(commentId)){
            throw new ApiError(400,"Comment id is required");
        }
        if(content.trim()===""){
            throw new ApiError(400,"Comment content is required");
        }
        const comment = await Comment.findByIdAndUpdate(commentId,{
            content
        });
        if(!comment){
            throw new ApiError(400,"Comment not updated");
        }
        return res
        .status(200)
        .json(new ApiResponse(200,comment,"Comment updated successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params;
        if(!commentId){
            throw new ApiError(400,"Comment id is required");
        }
        await Comment.findByIdAndDelete(commentId);
        return res
        .status(200)
        .json(new ApiResponse(200,"Comment deleted successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};