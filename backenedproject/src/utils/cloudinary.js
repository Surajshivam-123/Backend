import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath)=>{
    try {
        if(!localfilePath)
            throw "file not found";
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localfilePath,{
            resource_type:"auto",
        });
        //file uploaded successfully
        console.log("Response",response);
    // Response {
    //   asset_id: 'f0914ca47177aa065d6b7a2621d52d33',
    //   public_id: 'tudnvxrl5emmhnsj3x1h',
    //   version: 1749412371,
    //   version_id: 'f3c3a5326c0a5b8c8f390c3695ff85d1',
    //   signature: '1394a42947ebab54326d23f7485489f06d286089',
    //   width: 739,
    //   height: 415,
    //   format: 'jpg',
    //   resource_type: 'image',
    //   created_at: '2025-06-08T19:52:51Z',
    //   tags: [],
    //   bytes: 16883,
    //   type: 'upload',
    //   etag: '137a28e656bb2240722382469d49e4be',
    //   placeholder: false,
    //   url: 'http://res.cloudinary.com/surajoncloudinary/image/upload/v1749412371/tudnvxrl5emmhnsj3x1h.jpg',
    //   secure_url: 'https://res.cloudinary.com/surajoncloudinary/image/upload/v1749412371/tudnvxrl5emmhnsj3x1h.jpg',
    //   asset_folder: '',
    //   display_name: 'tudnvxrl5emmhnsj3x1h',
    //   original_filename: 'shivaji.png',
    //   api_key: '284721684912964'
    // }
        console.log("file is uploaded successfully on cloudinary:",response.url);
        fs.unlinkSync(localfilePath);
        return response;
    } catch (error) {
        console.log("Error:",error);
        //fs.unlinkSync(localfilePath);//remove the locally saved memory as thefile operation failed
        return null;
    }
}
export {uploadOnCloudinary};