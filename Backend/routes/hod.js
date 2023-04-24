import express from "express"
import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"

import { getProfile, getRequests, profileRequest, updateFacultyProfile, CE_HOD_approvestudents, CE_HOD_getenrolledstudentslist, CR_HOD_approvestudents, CR_HOD_getRegisteredstudentslist, getAttendanceReport, getOpenCondonation, demo, getFreezeAndOpenCondonation, getCurrentCourses, getFinalAttendanceReport, getSubmitReport, getHallTicket, getFileSend, getStudentList, getStudentHallTicket, updateUnfreezeRequest, cancelProfileRequest, getFirstYearCurrentCourses } from "../controllers/HODController.js"

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

router.get("/demo", demo)

router.get("/attendanceReport", getAttendanceReport)

router.post("/openCondonation", getOpenCondonation)

router.get("/freezeAndOpenCondonation", getFreezeAndOpenCondonation)

router.get("/firstYearCurrentCourses", getFirstYearCurrentCourses)

router.get("/currentCourses", getCurrentCourses)

router.get("/finalAttendanceReport", getFinalAttendanceReport)

router.get("/submitReport",getSubmitReport)

router.get("/hallTicket", getHallTicket)

router.get("/studentList", getStudentList)

router.get("/studentHallTicket", getStudentHallTicket)

router.get("/filesend", getFileSend)


/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route('/enrolment').post(CE_HOD_getenrolledstudentslist)

router.route('/enrolment/approvestudents').post(CE_HOD_approvestudents)



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

router.route('/courseregistration').post(CR_HOD_getRegisteredstudentslist)

router.route('/courseregistration/approvestudents').post(CR_HOD_approvestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)


/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

router.put("/requests/attendance/unfreeze/update", updateUnfreezeRequest)

router.put("/profile/request/cancel", cancelProfileRequest)

router.get("/requests", getRequests)

router.put("/requests/update", updateFacultyProfile)

export default router