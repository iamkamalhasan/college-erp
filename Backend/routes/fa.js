import express from "express"

import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"

import { demo, getAttendance, getProfile, getRequests, postAttendance, profileRequest, updateStudentProfile, CE_FA_approvestudents, CE_FA_getenrolledstudentslist, CR_FA_approvestudents, CR_FA_getRegisteredstudentslist, postSaveReport, getClassCourses, getFinalAttendanceReport, getReportStatus, getGenerateAttendanceReport, getSubmittedAttendanceReport, getAttendanceReport, getRequestReport, postSaveAttendancePercent, getSubmitReport, cancelProfileRequest} from "../controllers/FAController.js"

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

router.get("/demo",demo)

router.get("/attendance",getAttendance)

router.post("/attendance", postAttendance)

router.get("/requestReport", getRequestReport)

router.get("/attendanceReport", getAttendanceReport)

router.post("/saveAttendancePercent", postSaveAttendancePercent)

router.get("/reportStatus", getReportStatus)

router.get("/generateAttendanceReport", getGenerateAttendanceReport)

router.get("/submittedAttendanceReport", getSubmittedAttendanceReport)

router.post("/saveReport", postSaveReport)

/////////////////////// HALLTICKET MODULE ///////////////////////

router.get("/classCourses", getClassCourses);

router.get("/finalAttendanceReport", getFinalAttendanceReport);

router.get("/submitReport", getSubmitReport);

/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route('/enrolment').post(CE_FA_getenrolledstudentslist)

router.route('/enrolment/approvestudents').post(CE_FA_approvestudents)


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

router.route('/courseregistration').post(CR_FA_getRegisteredstudentslist)

router.route('/courseregistration/approvestudents').post(CR_FA_approvestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

/////////////////////// REQUEST ///////////////////////
router.get("/requests", getRequests)

router.post("/requests/student/update", updateStudentProfile)

router.post("/profile/request", profileRequest)

router.put("/profile/request/cancel", cancelProfileRequest)



export default router