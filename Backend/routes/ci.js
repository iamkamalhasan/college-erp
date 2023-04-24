import express from "express"
import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"


import { cancelProfileRequest, cancelSwapRequest, cancelUnfreezeRequest, createInternal, demo, dropPeriod, generateExcelTemplate, getAttendance, getAttendancePercent, getCO, getClasses, getCondonationApplication, getCourses, getCoursesHandled, getEnrolledStudents,  getFacultyCourses, getHandlingCourses, getInternal, getMasterAttendance, getProfile, getStaffTimetable, getStudentTimetable, getSubmittedAttendance, handleUpload, postAttendance, postExtraPeriod, postSaveAttendance, postSaveCondonationApplication, postSubmitCondonationApplication, profileRequest, swapRequest, unfreezeRequest, updateSwapRequest, uploadInternal } from "../controllers/CIController.js"

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

router.get("/masterAttendance", getMasterAttendance);

router.get("/attendance", getAttendance);

router.post("/attendance", postAttendance);

router.get("/dropPeriod", dropPeriod);

router.get("/courses", getCourses);

router.get("/submittedAttendance", getSubmittedAttendance);

router.get("/attendancePercent", getAttendancePercent);

router.post("/saveAttendance", postSaveAttendance);

router.get("/staffTimetable", getStaffTimetable);

router.get("/classes", getClasses);

router.get("/studentTimetable", getStudentTimetable);  

router.post("/extraPeriod",postExtraPeriod)

router.get("/demo", demo);

/////////////////////// HALLTICKET MODULE ///////////////////////

router.get("/coursesHandled", getCoursesHandled);

router.get("/condonationApplication", getCondonationApplication);

router.post("/saveCondonationApplication", postSaveCondonationApplication);

router.post("/submitCondonationApplication", postSubmitCondonationApplication);

/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////
router.get("/co", getCO)

router.get("/co/courses", getFacultyCourses)

/////////////////////// INTERNALS MODULE ///////////////////////
router.get("/internals/theory",getHandlingCourses);
router.get("/internals/theory/course",getEnrolledStudents);
router.post("/internals/xltemplate",generateExcelTemplate);
router.post("/internals/uploadmarks",handleUpload);

router.post("/internals/theory/create", createInternal)

router.post("/internals/theory/upload", uploadInternal)

router.get("/internals/theory/course/get", getInternal)

/////////////////////// FEEDBACK MODULE ///////////////////////


/////////////////////// PROFILE ///////////////////////
router.get("/profile", getProfile)


/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

router.put("/profile/request/cancel", cancelProfileRequest)

router.post("/request/period/swap", swapRequest)

router.put("/request/period/swap/update", updateSwapRequest)

router.post("/request/attendance/unfreeze", unfreezeRequest)

router.put("/request/period/swap/cancel", cancelSwapRequest)

router.put("/request/attendance/unfreeze/cancel", cancelUnfreezeRequest)

export default router