import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    console.log("email: ", email);
    console.log("password: ", password);

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
    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with userName or Email already exist")
    }

    //check for image check for avatar
    const avatarLocalPath = req.field?.avatar[0]?.path;
    const coverImagrLocalPath = req.field?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is require")
    }

    // upload them to cloudinary, avater
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImagrLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is require")
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
        throw new Error("Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, "User registered successfully", createdUser)
    )

})

export { registerUser }