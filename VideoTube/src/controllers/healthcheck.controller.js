import { json } from "express"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { AsyncHandler } from "../utils/asyncHandler.js"


const healthcheck = AsyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    return res.status(200, json(
        new ApiResponse(200, "Everything is OK.", {})
    ));
})

export {
    healthcheck
}
