import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary,deleteOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
    console.log("Body :",req.body);
    //     Body : [Object: null prototype] {
    //   fullname: 'Shivam Kumar',
    //   username: 'sj834031',
    //   password: '12345',
    //   email: 'sj834031@'
    // }
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

    // if(fullNam.trim()){
    //     throw new ApiError(404,"fullName is required");
    // }OR

    const {fullname,email,username,password} = req.body//1
    if ([fullname,email,username,password].some((field)=>field?.trim()==="")) {//2
        throw new ApiError(404,"All field is required");
    }
    const existingUser = await User.findOne({
        $or:[{email},{username}]
    });
    if(existingUser){
        throw new ApiError(404,"User already exists with this email or username");//3
    }
    console.log("Request.file:",req.files);
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
        avatar:{
            url:avatar.url,
            public_id:avatar.public_id
        },
        coverImage:{
            url:coverImage?.url || "",
            public_id:coverImage?.public_id || ""
        }
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
    }).select("-password -refreshToken");
    
    
    if(!findUser){
        throw new ApiError(404,"User Not Found");   
    }
    if (req.cookies) {
        return res
        .status(200)
        .json(new ApiResponse(200, findUser, "User already logged in one device."));
    }
    const isValidPassword =await findUser.isPasswordCorrect(password);//3 and 4
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
        $unset:{
            refreshToken:1
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

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,confPassword}=req.body;
    const user = await User.findById(req.user?._id);//user in argument comes from verifyJWT middleware
    if(!(await user.isPasswordCorrect(oldPassword))){
        throw new ApiError(401,"Incorrect old password");
    }
    if(newPassword !== confPassword){
        throw new ApiError(401,"New Password is different from Confirm Password");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});//after this userSchema.pre(..) will be called in the user.models.js

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password is changed"));
});

const getUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async(req,res)=>{
    // const {fullname,email,username} = req.body;
    // const user = await User.findById(req.user?._id);
    // if(fullname){user.fullname=fullname};
    // if(email){user.email=email};
    // if(username){user.username=username};
    // return res
    // .status(200).
    // json(new ApiResponse(200,user.select("-password"),"Account Details"));

    //OR

    const {fullname,email} = req.body;
    const user = await User.findByIdAndUpdate(req.user?._id,{
                $set:{
                    fullname:fullname,
                    email
                }
                },
                {
                    new:true
                }).select("-password");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account Details Updated Successfully"));
});

const updateAvatar = asyncHandler(async(req,res)=>{
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    //OR
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Image is not uploaded");
    }
    deleteOnCloudinary(req.user?.avatar.public_id);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar:",avatar);
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading image");
    }
    const user =await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:{
                url:avatar.url,
                public_id:avatar.public_id
            }
        }
    },{
        new:true
    }).select("-password");
    
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Image uploaded successfully")
    )
    
});

const updateCover = asyncHandler(async(req,res)=>{
    // const CoverLocalPath = req.files?.coverImage[0]?.path;
    //OR
    const CoverLocalPath = req.file?.path;
    if(!CoverLocalPath){
        throw new ApiError(400,"Image is not uploaded");
    }

    deleteOnCloudinary(req.user?.coverImage.public_id);
    const Cover = await uploadOnCloudinary(CoverLocalPath);
    //console.log("Cover",Cover);
    if(!Cover){
        throw new ApiError(400,"error while uploading image");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
           coverImage:{
            url:Cover.url,
            public_id:Cover.public_id
        }
        }
    },{
        new:true
    }).select("-password");
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Image uploaded successfully")
    )
    
});

const getUserCahnnelProfile = asyncHandler(async (req,res)=>{
    try {
        const {username} = req.params;
        if(!username?.trim()){
            throw new ApiError(400,"Username is not found");
        } 
        const channel = await User.aggregate([
            {
                $match:{//entered into those documents where username is matched
                    username:username.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    local_field:"_id",
                    foreignField:"channel",
                    as:"Subscriber"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    local_field:"_id",
                    foreignField:"subscriber",
                    as:"Subscribed"
                }
            },
            {
                $addFields:{
                    SubsciberCount:{
                        $size:"$Subscriber"
                    },
                    SubscribedCount:{
                        $size:"$Subscribed"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"$subscribers.Subscriber"]},
                            then:true,
                            else:false
                        }
                    }
                }
            },
            {
                $project:{
                    fullname:1,
                    username:1,
                    email:1,
                    coverImage:1,
                    avatar:1,
                    isSubscribed:1,
                    SubscriberCount:1,
                    SubscribedCount:1
                }
            }
        ])
        if(!channel?.length){
            throw new ApiError(400,"Channel not found");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"User data fetched successfully")
        )
    } catch (error) {
        console.log("Error",error)
    }   
});

const getWatchHistory = asyncHandler(async(req,res)=>{
    try {
        const user = await User.aggregate([
            {
                $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            },
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"_id",
                    foreignField:"watchHistory",
                    as:"watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            email:1,
                                            avatar:1,
                                            coverImage:1,

                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ])
        res
        .status(200)
        .json(
            new ApiResponse(200,"WatchHistory fetched successfully")
        )
    } catch (error) {
        console.log("Error",error);
    }
});


export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUser,
    updateAccountDetails,
    updateAvatar,
    updateCover,
    getUserCahnnelProfile,
    getWatchHistory
};
