import mongoose,{Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String,//clodenary sevice
        required:true,

    },
    coverImage :{
        type:String,
    },
    watchHistory:[
        {
       type:Schema.Types.ObjectId,
       ref:"Video",
    }
    ],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    },
},
{timestamps:true});

userSchema.pre("save",async function (next){//middleware for password encryption
    if(!this.isModified("password"))//When you're storing passwords, you usually want to hash them (with bcrypt). But you should only hash it when it's newly created or changed — not every time you save the user.
        return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

// 🔑 Access Token
// What it is: A short-lived token used to access protected routes or resources (like a user’s profile or data).
// Stored in: Usually stored in memory, or as an HTTP-only cookie or in localStorage.
// Lifetime: Short (e.g., 5 to 15 minutes).
// Usage:
// Sent with every request to the server (usually in the header).
// Proves the user is logged in and has permission.
userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        fullname:this.fullname,
        username:this.username
    },process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

// 🔄 Refresh Token
// What it is: A long-lived token used to get a new access token when the old one expires.
// Stored in: Usually stored securely (e.g., HTTP-only cookies).
// Lifetime: Long (e.g., 7 days or more).
// Usage:
// When the access token expires, the client sends the refresh token to get a new access token.
// Prevents users from logging in again and again.
userSchema.methods.generateRefreshToken = function(){
     return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model('User',userSchema);  //User is the name of the collection in