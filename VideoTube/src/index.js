import dotenv from 'dotenv'
import connectDB from './db/index.js'

dotenv.config({
    path: './env'
})

import express from "express"
const app = express()

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on Port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Fail :: ", err);
    })

















/*
// require('dotenv').config({path: ""})
import mongoose from "mongoose";
import { DB_NAME } from './constants'

//First Approach
    (async () => {
        try {
            const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on('error', (err) => {
                console.log("ERROR :: Express can't talk to DB ::", err);
                throw err
            })
            app.listen(process.env.PORT, () => {
                console.log(`App is listening on port ${process.env.PORT}`);
            })
        } catch (error) {
            console.log("ERROR:", error);
            throw error
        }
    })()
    */