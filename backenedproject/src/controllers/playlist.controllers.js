import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const {name, description} = req.body;
        if(!(name || description)){
            throw new ApiError(400,"Name and description are required")
        }
        const existingPlaylist = await Playlist.findOne({name});
        if(existingPlaylist){
            throw new ApiError(400,"Playlist already exist");
        }
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user?._id
            });
        if(!playlist){
            throw new ApiError(404,"Playlist not created")
        }
        return res
        .status(201)
        .json(new ApiResponse(200,playlist,"Playlist created successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const playlists = await Playlist.find({
            owner:req?.user._id
        });
        if(!playlists){
            throw new ApiError(404,"No playlists found");
        }

        return res
        .status(200)
        .json(new ApiResponse(200,playlists,"All playlist fetched successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
    
});

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params;
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400,"Not valid Id.");
        }
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            throw new ApiError(404,"Playlist not found");
        }
        return res.status(200)
        .json(new ApiResponse(200,playlist,"Playlist fetched successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params;
        if(!(playlistId && videoId)){
            throw new ApiError(400,"Playlist and video id is required");
        }
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400,"NOt valid playlistId");
        }
        if(!isValidObjectId(videoId)){
            throw new ApiError(400,"Not valid videoId");
        }
        const videoexist = await Playlist.findOne({
            _id:playlistId,
            video:{
                $in:[videoId]
            }
        });
        if(videoexist){
            throw new ApiError(400,"Video already exist in playlist");
        }
        const playlist = await Playlist.findByIdAndUpdate(playlistId,{
            $addToSet:{
                video:videoId
            }
        });
        if(!playlist){
            throw new ApiError(404,"Playlist not found");
        }
        return res.status(200)
        .json(new ApiResponse(200,playlist,"Video added to playlist successfully"));
        
    } catch (error) {
        console.log("Error:",error);
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!(playlistId || videoId)){
            throw new ApiError(400,"Playlist or video id is required");
        }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"NOt valid playlistId");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Not valid videoId");
    }
    const videoexist = await Playlist.findOne({
        _id:playlistId,
        video:{
            $in:[videoId]
        }
    });

    if(!videoexist){
        throw new ApiError(400,"Video not found in playlist");
    }
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            video:videoId
        }
    });
    return res.status(200)
    .json(new ApiResponse(200,playlist,"Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400,"Not valid playlistId");
        }
        const playlist = await Playlist.findByIdAndDelete(playlistId);
        return res
        .status(200)
        .json(new ApiResponse(200,playlist,"Playlist deleted successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params;
        const {name, description} = req.body;
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400,"Playlist id is required");
        }
        if(!(name || description)){
            throw new ApiError(400,"Name and Description is required")
        }
        const playlist = await Playlist.findByIdAndUpdate(playlistId,{
            name,
            description
        });
        return res.status(200)
        .json(new ApiResponse(200,playlist,"Playlist updated successfully"));
    } catch (error) {
        console.log("Error:",error);
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};  