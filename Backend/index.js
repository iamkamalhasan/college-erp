import expressFile from "express-fileupload"
import cookies from "cookie-parser"
import compression from "compression"
import { createClient } from "redis"
import mongoose from "mongoose"
import express from "express"
import dotenv from "dotenv"
import helmet from "helmet"
import fs from "fs"

import admin from "./routes/admin.js"
import hod from "./routes/hod.js"
import pc from "./routes/pc.js"
import ttc from "./routes/ttc.js"
import fa from "./routes/fa.js"
import ci from "./routes/ci.js"
import student from "./routes/student.js"
import auth from "./routes/auth.js"

dotenv.config()
const app = express()

// Middleware
app.use(express.json())
app.use(expressFile())
app.use(compression())
app.use(cookies())
app.use(helmet())

app.use('/', (req, res, next) => {
    
    // cors
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Request Logs
    fs.appendFileSync("request.log", new Date().toUTCString() + " - " + req.method + " : " + req.path + "\n")
    console.log(new Date().toUTCString() + " - " + req.method + " : " + req.path)
    next()
})

// Routes
app.use('/api/admin', admin)
app.use('/api/hod', hod)
app.use('/api/pc', pc)
app.use('/api/ttc', ttc)
app.use('/api/fa', fa)
app.use('/api/ci', ci)
app.use('/api/student', student)
app.use('/api/auth', auth)

export const redis = createClient()
await redis.connect()

mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URI)

app.listen(process.env.PORT, () => {
    console.log(`Connected to Database. App started @ ${process.env.PORT}...`)
})