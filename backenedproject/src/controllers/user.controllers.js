import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req,res)=>{
    res.send({
        message:"ok suraj good"
    });
});


export {registerUser};
