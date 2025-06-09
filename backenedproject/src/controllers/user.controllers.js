import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//A JWT is a digitally signed token that contains user data. It helps you verify who the user is without storing session data on the server.
const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken=refreshToken;//saves the newly generated refresh token into the user document in your MongoDB database.
        await user.save({validateBeforeSave:false});// writes the updated refreshToken to the database
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong while accessing refresh and access token");
    }
}
const registerUser = asyncHandler(async (req,res)=>{
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
    console.log("Body :",req.body);
    //     Body : [Object: null prototype] {
    //   fullname: 'Shivam Kumar',
    //   username: 'sj834031',
    //   password: '12345',
    //   email: 'sj834031@'
    // }
    // Request.file: [Object: null prototype] {
    //   avatar: [
    //     {
    //       fieldname: 'avatar',
    //       originalname: 'shivaji.jpg',
    //       encoding: '7bit',
    //       mimetype: 'image/jpeg',
    //       destination: './public/temp',
    //       filename: 'shivaji.jpg',
    //       path: 'public/temp/shivaji.jpg',
    //       size: 16883
    //     }
    //   ],
    //   coverImage: [
    //     {
    //       fieldname: 'coverImage',
    //       originalname: 'shivaji.png.jpg',
    //       encoding: '7bit',
    //       mimetype: 'image/jpeg',
    //       destination: './public/temp',
    //       filename: 'shivaji.png.jpg',
    //       path: 'public/temp/shivaji.png.jpg',
    //       size: 16883
    //     }
    //   ]
    // }
    // if(fullNam.trim()){
    //     throw new ApiError(404,"fullName is required");
    // }OR
    const {fullname,email,username,password} = req.body//1
    if ([fullname,email,username,password].some((field)=>field?.trim()==="")) {//2
        throw new Error(404,"All field is required");
    }
    const existingUser = await User.findOne({
        $or:[{email},{username}]
    });
    if(existingUser){
        throw new ApiError(404,"User already exists with this email or username");//3
    }
    console.log("Request.file:",req.files);


    const avatarLocalPath = req.files?.avatar[0]?.path;//4

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.len > 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    if(!avatarLocalPath){
        throw new ApiError(404,"Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);//5
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);//5

    if(!avatar){
        throw new ApiError(404,"Avatar is required");
    }

    const user = await User.create({//6
        fullname,
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

const loginUser = asyncHandler(async (req,res)=>{
    //steps to login
//1.get user details(email or username) from frontend
//2.find user
//3.decrypt password
//4.compare password
//5.access and refresh Token
//6.send cookie
//7.send response to frontend
try {
    const {email,username,password} = req.body;//1
    if(!(email || username)){
        throw new ApiError(408,"username or email is required.");
    }
    const findUser = await User.findOne({//2
        $or:[{email},{username}]
    });
    
    if(!findUser){
        throw new ApiError(404,"User Not Found");   
    }
    const isValidPassword = await bcrypt.compare(password,findUser.password);//3 and 4
   if(!isValidPassword){
        throw new ApiError(401,"Invalid Password");
   }

   const {accessToken,refreshToken} = await generateAccessAndRefreshToken(findUser._id);//5
   //6
   const loggedInUser = await User.findById(findUser._id).select("-password -refreshToken")
   const options = {
    httpOnly: true,//only server can access this cookie
    secure:true
   }

   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")//5
   );
} catch (error) {
//     res.status(500).json(
//         new ApiResponse(error.statusCode,error.message,""));
// }
    console.log("Error:",error);
    
    }});

const logoutUser = asyncHandler(async(req,res)=>{
    //1.remove refresh token from database
    //2.remove cookie
    //3.send response to frontend
    try {
       await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:null
        }
    }//1
    ,
    {
        new:true
    }
    );
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)//2
    .clearCookie("refreshToken",options)
    .json(
         new ApiResponse(201,{},"Logout Successfully!")//3
    )
    } catch (error) {
        throw new ApiError(500,"Error while logging out");
    }
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorised request");
        }
        const decodedToken = jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid refreshToken");
        }
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh Token expired or used");
        }

        const options = {
            httpOnly:true,
            secure:true
        }

        const {accessToken,refreshToken}= await generateAccessAndRefreshToken(decodedToken._id);
        res
        .status(201)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(201,{accessToken,refreshToken},"Access Token refreshed!")
        )
    } catch (error) {
        throw new ApiError(500,"Error while refreshing access token");
    }
});
export {registerUser,loginUser,logoutUser,refreshAccessToken};
