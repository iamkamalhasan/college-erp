import express from "express"

import { checkUser, fetchUserData, prefetchUser, savePassword, sendOTP, sendReport } from "../controllers/AuthController.js"

const router = express.Router()

router.get("/", checkUser)

router.post("/", savePassword)

router.get("/otp", sendOTP)

router.get("/user", fetchUserData)

router.get("/token", prefetchUser)

router.post("/report", sendReport)

export default router