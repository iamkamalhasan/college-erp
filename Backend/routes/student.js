import express from "express"
import { getBranchCache, getCurriculum, getElectives } from "../controllers/AdminController.js"

import { demo, getMasterTimetable, getTimetable, getProfile, profileRequest, CE_Student_checkforenrolment, CE_Student_getenrolmentdata, CE_Student_saveenrolmentdata, Result_Student_Result, CR_Student_checkforregistration, CR_Student_getregisterdata, CR_Student_saveCourseRegisteration, getExamEligibiltyStatus, ExamFeePayment_GetData, ExamFeePayment_saveData, cancelProfileRequest, getFeedback, postFeedback, getApplyForCondonation, getEnrolledCourseData, getSavePaymentId } from "../controllers/StudentController.js"

import { protect } from "../middleware/verify_user.js"

const router = express.Router()

router.use(protect)

///////////////////////  CACHE ///////////////////////
router.get("/branch/cache", getBranchCache)


///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

router.get("/demo", demo)

router.get("/timetable", getTimetable)

router.get("/masterTimetable", getMasterTimetable)


/////////////////////// HALLTICKET MODULE ///////////////////////

router.get("/examEligibilityStatus",getExamEligibiltyStatus)

router.get("/applyForCondonation", getApplyForCondonation)

router.get("/enrolledCourseData", getEnrolledCourseData)

router.get("/savePaymentId", getSavePaymentId)

/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route("/enrolment").get(CE_Student_checkforenrolment)

router.route("/enrolment/getdata").get(CE_Student_getenrolmentdata)

router.route("/enrolment/savedata").post(CE_Student_saveenrolmentdata)

// router.route("/dummy").get(dummy)


/////////////////////// RESULT MODULE ///////////////////////

router.route("/result").get(Result_Student_Result)


/////////////////////// REGISTRATION MODULE ///////////////////////

router.route("/courseregistration").get(CR_Student_checkforregistration)

router.route("/courseregistration/getdata").get(CR_Student_getregisterdata)

router.route("/courseregistration/savedata").post(CR_Student_saveCourseRegisteration)



/////////////////////// EXAM FEE MODULE ///////////////////////

router.route("/examfee/payment").get(ExamFeePayment_GetData)

router.route("/examfee/payment/save").post(ExamFeePayment_saveData)

/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////
router.get("/feedback", getFeedback)

router.post("/feedback/post", postFeedback)



/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

router.put("/profile/request/cancel", cancelProfileRequest)

router.get("/")

/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

export default router