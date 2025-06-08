import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//steps for register
//1.get user details from frontend
//2.validation
//3.check if user already exists: username, email
//4.check for images and avatar
//5.upload them to cloudinary, avatar
//6.create user object - create entry in database
//7remove password and refresh token field from response
//8.check for user creation
//9.send response to frontend  return response
const registerUser = asyncHandler(async (req,res)=>{
    const {fullName,email,username,password} = req.body//1
    console.log("Email :",email);
    // if(fullNam.trim()){
    //     throw new ApiError(404,"fullName is required");
    // }OR
    if ([fullName,email,username,password].some((field)=>field?.trim()==="")) {//2
        throw new Error(404,"All field is required");
    }
    const existingUser = await User.findOne({
        $or:[{email},{username}]
    });
    if(existingUser){
        throw new ApiError(404,"User already exists with this email or username");//3
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;//4
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(404,"Avatar is required");
    }
    else{
        const avatar = await uploadOnCloudinary(avatarLocalPath);//5
    }
    if(coverImageLocalPath){//not necessary
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);//5
    }

    if(!avatar){
        throw new ApiError(404,"Avatar is required");
    }

    const user = await User.create({//6
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
    })
    const createdUser = await User.findById(user._id).select( "-password -refreshToken")//7

    if(!createdUser){//8
    throw new ApiError(500,"Something went wrong while regisering the user");
}
    res.status(201).json(//9
        new ApiResponse(200,createdUser,"User registered successfully")
    );
});


export {registerUser};
