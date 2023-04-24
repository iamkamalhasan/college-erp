import express from "express"

import { addFaculty, getProfile, getRequests, updateProfile, updateFacultyProfile, CE_Admin_addstudents, CE_Admin_approvestudents, CE_Admin_getenrolledstudentslist, CE_Admin_removestudents, createCalendar, createMetadata, CR_Admin_addstudents, CR_Admin_approvestudents, CR_Admin_getRegisteredstudentslist, CR_Admin_removestudents, declareHoliday, extendSemesterDuration, getAllDates, getBatch, getBranch, getBranchCache, getCurriculum, getElectives, getFaculty, getFacultyUser, getMetadata, getRegulation, manageBatchInCalendar, manageBranch,  manageSaturday, manageUsers, Result_Admin_GetResults, Result_Admin_Upload, updateCurriculum, updateFaculty, updateMetadata, updateStudent, uploadCurriculum, uploadFaculty, uploadStudents, getStudentUsers, getStudents, getMinMaxDate, getFAMeta, getFacultyAdvisor, Result_Admin_updateStudent, CE_Admin_QuerySelection, CE_uploadEnrolmentData, manageWorkingDay, examFee_getData, examFee_downloadData, addElective, uploadElectives, updateElective, getHallTicketData, postReleaseHallTicket, examFee_updateamount, examFeePayment_getData, examFeePayment_uploadData, examFeePayment_updatePayment, getCurriculumExamFee, updateCurriculumExamFee, getAdmin, manageAdmin, manageFeedback, getFeedback, uploadFeedbackQuestions, getFeedbackMeta, postFreezeHallTicket, CE_enrolmentUpdateData } from "../controllers/AdminController.js"

import { protect } from "../middleware/verify_user.js"

const router = express.Router()

router.use(protect)

///////////////////////  CACHE ///////////////////////

// Batch cache
router.get("/batch", getBatch)

router.get("/branch/cache", getBranchCache)

router.get("/regulation", getRegulation)


///////////////////////  ADMIN MODULE ///////////////////////
router.get("/", getAdmin)

router.post("/manage", manageAdmin)

// Calendar Moduless
router.post("/calendar/create", createCalendar)

router.put("/calendar/holiday", declareHoliday)

router.put("/calendar/workingday", manageWorkingDay)

router.get("/calendar", getAllDates)

router.put("/calendar/manage/batch", manageBatchInCalendar)

router.put("/calendar/manage/saturday", manageSaturday)

router.get("/calendar/minmaxdate", getMinMaxDate)

// SemesterMetadata Module
router.post("/semestermeta/create", createMetadata)

router.get("/semestermeta", getMetadata)

router.put("/semestermeta/update", updateMetadata)

router.get("/semestermeta/fa", getFAMeta)

router.get("/semestermeta/feedback", getFeedbackMeta)

router.put("/semestermeta/extend", extendSemesterDuration)


// Branch Module
router.post("/branch/manage", manageBranch)

router.get("/branch", getBranch)

// Electives Module
router.post("/electives/add", addElective)

router.post("/electives/upload", uploadElectives)

router.put("/electives/update", updateElective)

router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////
router.get("/users/students", getStudentUsers)

router.put("/users/manage", manageUsers)

router.get("/users/faculty", getFacultyUser)



///////////////////////  STUDENTS MODULE ///////////////////////
router.get("/students", getStudents)

router.put("/student/update", updateStudent)

router.post("/students/upload", uploadStudents)


///////////////////////  FACULTY MODULE ///////////////////////
router.post("/faculty/upload", uploadFaculty)

router.put("/faculty/update", updateFaculty)

router.get("/faculty", getFaculty)

router.post("/faculty/add", addFaculty)

router.get("/faculty/fa", getFacultyAdvisor)

/////////////////////// CURRICULUM MODULE ///////////////////////
router.post("/curriculum/upload", uploadCurriculum)

router.get("/curriculum", getCurriculum)

router.put("/curriculum/update", updateCurriculum)

router.get("/curriculum/examfee", getCurriculumExamFee)

router.post("/curriculum/examfee/update", updateCurriculumExamFee)


/////////////////////// REQUEST MODULE ////////////////////////////

router.get("/requests", getRequests)

router.put("/requests/update", updateFacultyProfile)



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////

router.get("/hallTicketData", getHallTicketData)

router.post("/releaseHallTicket", postReleaseHallTicket)

router.post("/freezeHallTicket", postFreezeHallTicket)


/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route("/enrolment/getdata").post(CE_Admin_getenrolledstudentslist)

router.route("/enrolment/approve").post(CE_Admin_approvestudents)

router.route("/enrolment/addstudents").post(CE_Admin_addstudents)

router.route("/enrolment/removestudents").post(CE_Admin_removestudents)

router.route("/enrolment/query").get(CE_Admin_QuerySelection)

router.route("/enrolment/query/upload").post(CE_uploadEnrolmentData)

router.route("/enrolment/query/update").put(CE_enrolmentUpdateData)


/////////////////////// RESULT MODULE ///////////////////////

router.route("/result").get(Result_Admin_GetResults)

router.route("/result/upload").post(Result_Admin_Upload)

router.route("/result/update").put(Result_Admin_updateStudent)

/////////////////////// REGISTRATION MODULE ///////////////////////

router.route("/courseregistration/getdata").post(CR_Admin_getRegisteredstudentslist)

router.route("/courseregistration/approve").post(CR_Admin_approvestudents)

router.route("/courseregistration/addstudents").post(CR_Admin_addstudents)

router.route("/courseregistration/removestudents").post(CR_Admin_removestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////

router.route("/examfee").get(examFee_getData)

router.route("/examfee/download").get(examFee_downloadData)

router.route("/examfee/updateamount").post(examFee_updateamount)

router.route("/examfee/payment").get(examFeePayment_getData)

router.route("/examfee/payment/upload").post(examFeePayment_uploadData)

router.route("/examfees/payment/update").put(examFeePayment_updatePayment)

/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////

router.get("/feedback", getFeedback)

router.post("/feedback/manage", manageFeedback)

router.post("/feedback/questions/upload", uploadFeedbackQuestions)

/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

router.put("/profile/update", updateProfile)

export default router