import express, { json, urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({// app.use is use espacially for credentials or for middlewares
    origin: process.env.CORS_ORIGIN, // replace * with specific domain if needed
    credentials: true
}))
// for parsing application data into json Formate.
app.use(json({ limit: "16kb" }))
//for parsing the text in URL, extended:true means to accept object inside object.
app.use(urlencoded({ extended: true, limit: "16kb" }))
// for serving static files like css and images.
app.use(express.static("public"))
//for accessing user-browser cookies from server
app.use(cookieParser())


// importing routes
import userRoutes from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// routes declaration 
app.use('/api/v1/users', userRoutes)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register


export { app }