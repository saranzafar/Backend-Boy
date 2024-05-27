import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { veriftJwt } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";

const router = Router()

router
.route('/register')
.post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        },
    ]),
    registerUser
)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(veriftJwt, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(veriftJwt, changeCurrentPassword)
router.route('/current-user').get(veriftJwt, getCurrentUser)
router.route('/update-account').patch(veriftJwt, updateAccountDetails)
router.route('/update-avatar').patch(veriftJwt, upload.single("avatar"), updateUserAvatar)
router.route('update-cover-image').patch(veriftJwt, upload.single("/coverImage"), updateUserCoverImage)
router.route('/history').get(veriftJwt, getWatchHistory)
router.route('/c/:username').get(veriftJwt, getUserChannelProfile)

export default router