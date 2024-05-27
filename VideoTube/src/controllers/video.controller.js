import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = AsyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

//completed & tested
const publishAVideo = AsyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title || description)) {
        throw new ApiError(405, "Please Provide title and description")
    }

    //taking videoFile and thumbnail from public directory
    const videoLocalPath = req.files?.videoFile[0]?.path;
    // console.log("video = ", videoLocalPath);
    if (!videoLocalPath) {
        throw new ApiError(400, "video is require")
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is require")
    }

    //uploading video and thumbnail to cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await uploadOnCloudinary(videoLocalPath)

    // console.log("video = ", typeof video.url);
    // console.log("video = ", video.duration);
    // console.log("thumbnail = ", thumbnail.url);

    // create video object - create entery in DB
    const videoObj = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        isPublished: true
    })


    return res.status(201).json(
        new ApiResponse(200, "Video Uploaded Successfully", videoObj)
    )
})

//completed & tested
const getVideoById = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log("videoId =", videoId);

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Please provide video ID");
    }

    // Find the video by ID
    const fetchedVideo = await Video.findById(videoId);
    if (!fetchedVideo) {
        return res.status(404).json(new ApiResponse(404, {}, 'Video not found'));
    }

    // Return the fetched video
    return res.status(200).json(new ApiResponse(200, fetchedVideo, "Video Fetched Successfully"));
});


const updateVideo = AsyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

//completed
const deleteVideo = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Please provide video ID");
    }

    // Ensure you are using the correct model
    const deletedVideo = await Video.deleteOne({ _id: videoId });

    if (deletedVideo.deletedCount === 0) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video Deleted Successfully"));
});


//completed
const togglePublishStatus = AsyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is missing")
    }

    const newVideoStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            }
        },
        { new: true }
    )

    return res.status(200)
        .json(
            200,
            newVideoStatus,
            "Publish Status Updated Successfully"
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}