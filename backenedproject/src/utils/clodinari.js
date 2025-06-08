import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath)=>{
    try {
        if(!localfilepath)
            throw "file not found";
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localfilePath,{
            resource_type:"auto",
        });
        //file uploaded successfully
        console.log("file is uploaded successfully:",response);
        return response
    } catch (error) {
        console.log("Error:",error);
        fs.unlinkSync(localfilePath);//remove the locally saved memory as thefile operation failed
        return null;
    }
}
export {uploadOnCloudinary};