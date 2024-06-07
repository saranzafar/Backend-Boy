import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}


const registerUser = AsyncHandler(async (req, res) => {
    // get user details from forentend
    // validation - not empty 
    // check if user already exist: username and email
    // check for image check for avatar
    // upload them to cloudinary, avater
    // create user object - create entery in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { userName, email, fullName, password } = req.body;

    //validation
    if ([userName, email, fullName,
        password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    //alternative
    // if (fullName == "") {
    //     throw new ApiError(400, "Full Name is required")
    // }

    // check if user already exist
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with userName or Email already exist")
    }

    //check for image check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log("req.files:", req.files.avatar[0]);
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //alternative
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is require")
    }

    // upload them to cloudinary, avater
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entery in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError("Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )

})

const loginUser = AsyncHandler(async (req, res) => {
    // req body => data
    // username and email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const { email, userName, password } = req.body;

    //validation
    if (!(email || userName)) {
        throw new ApiError(200, "username or email is required")
    }

    // finding from database 
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    // password match
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid Password")
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    // send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Loggined Successfully"
            )
        )
})

const logoutUser = AsyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }//remove field from document
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).
        clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = AsyncHandler(async (req, res) => {
    //write an artical on refresh token and access token, hashNote
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "Access Token Refreshed Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.messame || "Invalid Refresh Token")
    }

})

const changeCurrentPassword = AsyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)
    // Check Password Matches 
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, 'Password Changed Succssfully'))
})

const getCurrentUser = AsyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, { user }, 'Current User Fetched Successfully'))

})

const updateAccountDetails = AsyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All Fields are require")
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})

const updateUserAvatar = AsyncHandler(async (req, res) => {
    //delete old avatar
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, " Error While uploading Avatar")
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(200,
                user,
                "Avatar Image Updated Successfully")
        )
})

const updateUserCoverImage = AsyncHandler(async (req, res) => {
    //delete old thumbnail image
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image File is Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage) {
        throw new ApiError(400, " Error While uploading Cover Image")
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Cover Image Updated Successfully"
            ))
})

const getWatchHistory = AsyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // mongoDB return string instesd of ID so mongoose is responsible for converting that string object into ID
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",//user model refrence
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",

                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch History Fetched Successfully"
            )
        )
})

const getUserChannelProfile = AsyncHandler(async (req, res) => {
    const { username } = req.params;
    console.log("userName = ", username);
    if (!username?.trim()) {
        throw new ApiError(400, 'Username must be provided')
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",//In "User" DB, take its ID
                foreignField: "channel",// find upper ID in "Subscription" DB, channel field
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    // If the requesting user exists in "$subscribers.subscriber" then return "true" otherwise return "false"
                    then: true,
                    else: false
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                createdAt: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}   