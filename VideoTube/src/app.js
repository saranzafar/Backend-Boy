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

// routes declaration 
app.use('/api/v1/users', userRoutes)

export { app }