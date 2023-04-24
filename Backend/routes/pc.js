import express from "express"
import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"

import { getProfile, profileRequest, CE_PC_approvestudents, CE_PC_getenrolledstudentslist, CR_PC_approvestudents, CR_PC_getRegisteredstudentslist, cancelProfileRequest } from "../controllers/PCController.js"

import { protect } from "../middleware/verify_user.js"

const router = express.Router()

router.use(protect)

///////////////////////  CACHE ///////////////////////

// Batch cache
router.get("/batch", getBatch)

router.get("/branch/cache", getBranchCache)

router.get("/regulation", getRegulation)


///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)


/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route('/enrolment').post(CE_PC_getenrolledstudentslist)

router.route('/enrolment/approvestudents').post(CE_PC_approvestudents)


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

router.route('/courseregistration').post(CR_PC_getRegisteredstudentslist)

router.route('/courseregistration/approvestudents').post(CR_PC_approvestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)


/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

router.put("/profile/request/cancel", cancelProfileRequest)

export default router