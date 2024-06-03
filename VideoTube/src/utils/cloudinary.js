import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    console.log("inside 1");
    try {
        console.log("inside 2");
        if (!localFilePath) return null
        //upload file on cloudnary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"//detect file type automatically
        })
        console.log("File uploaded Successfully", response.url);

        // unlink the file 
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the local saved temperory file as upload opertion got failed
        return null
    }
}

export { uploadOnCloudinary }