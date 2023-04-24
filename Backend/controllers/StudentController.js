import mongoose from "mongoose"

import { AttendanceModel } from "../models/AttendanceModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { ElectiveMetadataModel } from "../models/ElectiveMetadataModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { ExamPaymentModel } from "../models/ExamPaymentModel.js";
import { ExternalsModel } from "../models/ExternalsModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { FeedbackModel } from "../models/FeedbackModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { RequestsModel } from "../models/RequestsModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { StudentDetailsModel } from "../models/StudentDetailsModel.js";
import { StudentsModel } from "../models/StudentsModel.js";
import { ValueAddedCourseModel } from "../models/ValueAddedCourseModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

export const demo = async (req, res) => {

    try {
        // let attd = {
        //     ci:false, fa:true, hod:true
        // }
        // let update = { 
        //     save:0, startDate:null, endDate:null
        // }
        // await EnrollmentModel.updateMany({}, {hallTicketRelease:false})
        // await StudentsModel.updateMany({}, {hallTicketRelease:false})
        // await CourseDetailsModel.updateMany({}, {"freezeAttendance":update, attendanceApproval:attd, "hodFreeze.attendance":false})
        res.status(200).json(await StudentsModel.find({}))
    } catch (err) { res.status(400).send("Failed: " + err.message); }
}

//Completed
export const getTimetable = async (req, res) => {

    try {

        let { studentId, semester } = req.query

        //Fetch all enrolled course of this semester
        
        let data = await EnrollmentModel.find({studentId:studentId, semester:semester}, {courseId:1}).populate("courseId", {schedule:1, newSchedule:1, courseCode:1, courseId:1, facultyId:1})
        await CurriculumModel.populate(data, {path:"courseId.courseId", select:{title:1}})
        await FacultyModel.populate(data, {path:"courseId.facultyId", select:{title:1, firstName:1, lastName:1}})

        data = data.map(course => course.toObject())
        console.log("data loaded =", data)
        //Iterate over each Course
        for(let course of data){

            //Send newSchedule if any...
            if (course.courseId.newSchedule != null) {

                course.effectiveDate = course.courseId.newSchedule.effectiveDate
                course.schedule = course.courseId.newSchedule.schedule

            } else {
                course.schedule = course.courseId.schedule
            }

            delete course.courseId.newSchedule

            //Regularize data for front-end
            course.facultyName = course.courseId.facultyId.title + " " + course.courseId.facultyId.firstName + " " + course.courseId.facultyId.lastName
            delete course.courseId.facultyId
            course.courseCode = course.courseId.courseCode
            course.courseName = course.courseId.courseId.title

            delete course.courseId
            console.log("course = ", course)
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}


//Completed
export const getMasterTimetable = async (req, res) => {

    try {

        let { studentId, semester } = req.query

        //Fetch all courses of this semester
        let data = await EnrollmentModel.find({ studentId: studentId, semester: semester }, { courseId: 1 }).populate("courseCode", { title: 1, courseCode: 1 })
        data = data.map(course => course.toObject())
        let result = []

        //Iterate over each course
        for (let course of data) {

            //Get All Periods of the course from mastertimetable

            let periods  = await MasterTimetableModel.find({courseId:course.courseId}, {_id:1, date:1, period:1, marked:1, dayOrder:1}).sort({date:1, period:1})
            periods = periods.map( period => period.toObject() )
            
            //Iterate over each period
            for(let period of periods){
                console.log(period.date, period.period, period.dayOrder)

                //Check if attendance marked
                if (period.marked == true) {

                    let attendance = await AttendanceModel.find({ studentId: studentId, masterTimetableId: period._id }, { present: 1, onduty: 1 })
                    period.present = attendance[0].present
                    period.onduty = attendance[0].onduty

                }

                //Regularize data for front-end
                period.courseName = course.courseCode.title
                period.courseCode = course.courseCode.courseCode

                result.push({ ...period })
            }

        }
        console.log("Data Sent")
        res.status(200).json(result)

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}

/////////////////////// HALLTICKET MODULE ///////////////////////

export const getExamEligibiltyStatus = async (req,res) => {

    try {
        
        let { studentId, semester } = req.query
        
        let data = await EnrollmentModel.find( { studentId:studentId, semester: semester }, {attendancePercentage:1, condonation:1, examEligibility:1 } ).populate("courseId", {courseCode:1}).populate("courseCode", {title:1})
        data = data.map(item => item.toObject())

        let feeFlag = false
        console.log(data)

        let masterFlag = true
        for(let course of data){
            course.courseName = course.courseCode.title
            course.courseCode = course.courseId.courseCode
            course.attendance = course.attendancePercentage
            course.condonationStatus = course.condonation.status
            if(course.condonationStatus=='approved')
                feeFlag = true
            if(course.examEligibility!=1) {
                masterFlag=false
            }
            delete course.attendancePercentage
            delete course.condonation
            delete course.courseId
            delete course.examEligibility
        }

        let result = { 
            data, masterFlag, feeFlag
        }

        res.status(200).json(result)
        
    } catch (err) { res.status(400).send("Failed: " + err.message); }

}

export const getApplyForCondonation = async (req,res) => {

    try {
        
        let { enrollmentId } = req.query

        res.status(200).send(await EnrollmentModel.updateOne( { _id: enrollmentId }, { "condonation.status" : "applied" }))

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}

export const getSavePaymentId = async (req,res) => {

    try {

        let { enrollmentIds, paymentId } = req.query

        
        res.status(200).send(await EnrollmentModel.updateMany({_id:{$in:enrollmentIds}}, {"condonation.paymentId":paymentId} )
        )

    } catch (err) { res.status(400).send("Failed: " + err.meesage); }

}

export const getEnrolledCourseData = async (req,res) => {

    try {

        let { studentId, semester } = req.query

        let courses = await EnrollmentModel.find( { studentId:studentId, semester:semester }, { courseId:1, condonation:1, examEligibility:1, type:1, courseType:1 } ).populate("courseId", {courseCode:1, courseId:1}).populate("courseId.courseId", { title:1 })
        await CurriculumModel.populate(courses, {path:"courseId.courseId", select:{title:1}})
        courses = courses.map(course => course.toObject())

        for(let course of courses) {
            course.courseCode = course.courseId.courseCode
            course.name = course.courseId.courseId.title
            course.eligible = ( ( course.condonation.status == "Not Required" || course.condonation.status == "Approved" ) && course.examEligibility == 1 ) ? true : false
            delete course.condonation
            delete course.courseId
            delete course.examEligibility
            delete course._id
        }

        let student = await StudentsModel.find( { _id:studentId }, { register:1, firstName:1, lastName:1, hallTicketRelease:1, branch:1, batch:1, section:1, currentSemester:1 } )
        student = student.map(item => item.toObject())

        let result = {
            register: student[0].register,
            name : student[0].firstName + " " + student[0].lastName,
            branch: student[0].branch,
            batch: student[0].batch,
            semester: student[0].currentSemester,
            section: student[0].section,
            hallTicketRelease: student[0].hallTicketRelease,
            courses: courses
        }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}

/////////////////////// ENROLLMENT MODULE ///////////////////////


// check for enrolment status
export const CE_Student_checkforenrolment = async(req, res) => {
    try{
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})
       if(!studentinfo){
        console.log("The student" + studentmail + " is not available in students collection")
       }
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        if(enrollmentstatus){
            if(enrollmentstatus.enrollment.status){
                res.status(200).json({success:true, msg:"Enrollment is enabled"})
            }else{
                res.status(200).json({success:false, msg:"Enrollment is not enabled"})
            }
        }
        
    }catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


// fetch data to feed the enrollment page 
export const CE_Student_getenrolmentdata = async(req, res) => {
    try{
        let allowedpeelectives=[], allowedoeelectives=[], addonallowed=false, addontype=[], oecourses=[], pecourses=[],electivesallowed=false,mandatorycourses = [],previouslyenrolledelectives=[],previouslyenrolledeladdon=[], ispreviouslyenrolledelectives=false, ispreviouslyenrolledforaddon=false
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})
        
        // Check for the existance of student details
        if(!studentinfo){
            console.log("The student" + studentmail + " is not available in students collection")
        }

        // check whether the semester is created in semester metadata model
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
    
        // if not create do nothing
        if(enrollmentstatus){

            // check whether the enrollment is enabled
            if(enrollmentstatus.enrollment.status){
                
            // fetch all the mandatory courses from the curriculum model
            const mandatorycoursesindb = await CurriculumModel.find({semester:studentinfo.currentSemester,branch:studentinfo.branch})
            
            // 
            for(let each of mandatorycoursesindb){
                const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id})
                
                const obj = {
                    courseCode:each.courseCode,
                    title:each.title
                }

                if(foundinenrollment && !foundinenrollment.enrolled && foundinenrollment.semester == studentinfo.currentSemester){
                    obj.previouslyenrolled = true
                }
                mandatorycourses.push(obj)
            }
            
            // check whether electives are allowed for the student's current semester
            const allowedelectivecourses = await ElectiveMetadataModel.findOne({regulation:studentinfo.regulation,branch:studentinfo.branch,semester:studentinfo.currentSemester})

            // if allowed what are those
            if(allowedelectivecourses){
                electivesallowed = true 
                for(let each of allowedelectivecourses.oe){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCategory:each}).populate("courseCode")
                    
                    // if not found in enrollment means - The students was never enrolled for this course
                    if(!foundinenrollment){
                        allowedoeelectives.push(each)
                    }

                    // means - The student enrolled to this course in this semester only
                    // so allow him to update
                    if(foundinenrollment && !foundinenrollment.enrolled && foundinenrollment.semester == studentinfo.currentSemester){
                        allowedoeelectives.push(each)
                        const obj = {
                            courseType:each,
                            courseCode:foundinenrollment.courseCode.courseCode,
                            title:foundinenrollment.courseCode.title,
                            previouslyenrolledforthiselective:true
                        }
                        ispreviouslyenrolledelectives = true
                        previouslyenrolledelectives.push(obj)
                    }
                }

                for(let each of allowedelectivecourses.pe){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCategory:each}).populate("courseCode")
                    if(!foundinenrollment){
                        allowedpeelectives.push(each)
                    }
                    if(foundinenrollment && foundinenrollment.semester == studentinfo.currentSemester && !foundinenrollment.enrolled){
                        
                        allowedpeelectives.push(each)
                        const obj = {
                            courseType:each,
                            courseCode:foundinenrollment.courseCode.courseCode,
                            title:foundinenrollment.courseCode.title,
                            previouslyenrolledforthiselective:true
                        }
                        ispreviouslyenrolledelectives = true
                        previouslyenrolledelectives.push(obj)
                    }
                }

                const getpecourses = await CurriculumModel.find({branch:studentinfo.branch,category:"PE"})
                for(let each of getpecourses){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id}).populate("courseCode")
                    if(foundinenrollment && foundinenrollment.semester!=studentinfo.currentSemester){
                        // this elective is already enrolled by the student
                        continue
                    }
                    pecourses.push(each)
                }

                const getoecourses = await CurriculumModel.find({category:"OE"})
                for(let each of getoecourses){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id}).populate("courseCode")
                    if(foundinenrollment && foundinenrollment.semester!=studentinfo.currentSemester){
                        // this elective is already enrolled by the student
                        continue
                    }
                    oecourses.push(each)
                }
            }
                
            // check whether addon is enavbled while creating a semester
            const semesterdataforaddon = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
            if(semesterdataforaddon){

                addonallowed = semesterdataforaddon.addOnEligible
                
                // if addon is enabled
                if(addonallowed){

                    // ELECTIVE TYPES - (Those can only be choosen as Addon's)
                    //  check other semester elective types
                    // because current semester electives can't be choosen as addon
                    // because the student must be choosen addon as any one of these types
                    const electivedata = await ElectiveMetadataModel.find({regulation:studentinfo.regulation,semester:{$nin:[studentinfo.currentSemester]}})
                    
                    // So traverse through for each object(i.e each semester data)
                    for(let each of electivedata){

                        // check OPEN elective type
                        for(let eachoe of each.oe){
                            // because in some semester there will be no field created
                            if(eachoe==undefined){
                                continue
                            }
                            const isfoundinEnrollment = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCategory:eachoe,semester:{$nin:[studentinfo.currentSemester]}})
                            if(isfoundinEnrollment){
                                // This course Category was already studied by student may be as addon
                                // does not allow in add on type
                                continue
                            }
                            addontype.push(eachoe)
                        }

                        for(let eachpe of each.pe){
                            if(eachpe==undefined){
                                continue
                            }
                            const isfoundinEnrollment = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCategory:eachpe,semester:{$nin:[studentinfo.currentSemester]}})
                            if(isfoundinEnrollment){
                                // This course Category was already studied by student
                                // does not allow in add on type
                                continue
                            }
                            addontype.push(eachpe)
                        }
                    }

                    // ADDON saved in this current semester enrollment
                    for(let each of electivedata){
                        // Addon as OPEN Elective
                        for(let eachoe of each.oe){
                            const foundinEnrollment = await EnrollmentModel.find({studentId:studentinfo._id,courseCategory:eachoe,semester:studentinfo.currentSemester}).populate("courseCode")
                            for(let isfoundinEnrollment of  foundinEnrollment){
                                const obj = {
                                    courseType:isfoundinEnrollment.courseCategory,
                                    courseCode:isfoundinEnrollment.courseCode.courseCode,
                                    title:isfoundinEnrollment.courseCode.title,
                                    previouslyenrolledforthisaddon:true
                                }
                                ispreviouslyenrolledforaddon = true
                                previouslyenrolledeladdon.push(obj)
                            }
                        }  

                        // Addon as PROFESSIONAL Elective
                        for(let eachpe of each.pe){
                            const foundinEnrollment = await EnrollmentModel.find({studentId:studentinfo._id,courseCategory:eachpe,semester:studentinfo.currentSemester}).populate("courseCode")
                            for(let isfoundinEnrollment of  foundinEnrollment){
                                const obj = {
                                    courseType:isfoundinEnrollment.courseCategory,
                                    courseCode:isfoundinEnrollment.courseCode.courseCode,
                                    title:isfoundinEnrollment.courseCode.title,
                                    previouslyenrolledforthisaddon:true
                                }
                                ispreviouslyenrolledforaddon = true
                                previouslyenrolledeladdon.push(obj)
                                
                            }
                        }  
                    }   
                }        
            }     
            res.status(200).json({success:true, msg:"Enrollment details are fetched",Semester:studentinfo.currentSemester, ispreviouslyenrolledelectives, previouslyenrolledelectives,electivesallowed:electivesallowed,oeallowed:allowedoeelectives,peallowed:allowedpeelectives,addonallowed,ispreviouslyenrolledforaddon, previouslyenrolledeladdon, addontype:addontype,courses:{mandatorycourses,pecourses,oecourses}})      
        }
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled, Can't send courses"})
        }
    }catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error.message})
    }
}


// save the user enrolled course to the database
export const CE_Student_saveenrolmentdata = async(req, res) => {
    try{
   
        const coursesenrolled = {
            courseCode : req.body.courses
        }
        const electives = req.body.electives
              
        const enrollmentdata = {
            enrolled : false,
            approval : 0
        }
        
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})
        
        EnrollmentModel.deleteMany({studentId:studentinfo._id,approval:0,enrolled:false})
        
        enrollmentdata.studentId = studentinfo._id
        enrollmentdata.batch = studentinfo.batch
        enrollmentdata.regulation = studentinfo.regulation
        enrollmentdata.semType= studentinfo.currentSemester%2==0 ? "even" : "odd"
        enrollmentdata.semester = studentinfo.currentSemester
        enrollmentdata.branch = studentinfo.branch
        enrollmentdata.section = studentinfo.section
        enrollmentdata.type = "normal"
          
        if(electives!=null){
            for(let eachcourse of electives){
                const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse.courseCode})
                enrollmentdata.courseCode = courseincurriculummodel._id
                enrollmentdata.courseCategory = courseincurriculummodel.category
                enrollmentdata.courseType = courseincurriculummodel.type
            
                if(courseincurriculummodel){
                    const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                    await newenrollmentdata.save()   
                }
                else{
                    console.log("courseCode - " + courseincurriculummodel.courseCode + " is found in the database")
                }
            }
        }

        coursesenrolled.courseCode.forEach(savetodb);
        async function savetodb(eachcourse) {
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
            enrollmentdata.courseCode = courseincurriculummodel._id   
            enrollmentdata.courseCategory = courseincurriculummodel.category
            enrollmentdata.courseType = courseincurriculummodel.type
            if(courseincurriculummodel){
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                await newenrollmentdata.save()   
            }
        }
        res.status(200).json({success:true, message:"Enrollment details were saved to database"})
     
    }catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error.message});
    }
}



/////////////////////// RESULT MODULE ///////////////////////
export const Result_Student_Result =async(req, res) =>{
    try{
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})
        const externalsData = await ExternalsModel.find({studentId:studentinfo._id}).populate("studentId courseId")
        let results =[]
        for(let d of externalsData){
            const enrollmentdata = await EnrollmentModel.findOne({studentId:d.studentId._id, courseCode:d.courseId._id},{semester:1}).catch(err=>console.log(err))
            results.push({
                _id:d._id,
                studentId: d.studentId._id,
                courseId:d.courseId._id,
                regulation:d.studentId.regulation || "NA",
                batch : d.studentId.batch || "NA",
                branch : d.studentId.branch || "NA",
                Name: d.studentId.firstName || "NA",
                RegisterNumber: d.studentId.register || "NA",
                studentType:d.studentId.type || "NA",
                semester:enrollmentdata.semester,
                courseCode: d.courseId.courseCode || "NA",
                courseTitle:d.courseId.title || "NA",
                courseCategory:d.courseId.category || "NA",
                attempt:d.attempt || "NA",
                result:d.result || "NA",
                gradePoints:d.gradePoints || "NA",
                letterGrade:d.letterGrade || "NA"
            })
        }
    res.status(200).json({success:true, message:"Result is fetched successfully", results})    
    }
    catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error.message});
    }
}


/////////////////////// REGISTRATION MODULE ///////////////////////

// check for Registration status
export const CR_Student_checkforregistration = async(req, res) => {
    try{
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})
        const registrationstatus = await SemesterMetadataModel.findOne({sem:studentinfo.currentSemester, batch:studentinfo.batch})
        if(registrationstatus){
            if(registrationstatus.courseRegistration.status){
                res.status(200).json({success:true, msg:"Registration is enabled"})
            }else{
                res.status(200).json({success:false, msg:"Registration is not enabled"})
            }
        }else{
            res.status(200).json({success:false, message:"Unable to find the status in semester metadata collection"})
            
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

//fetch data and feed to registartion
export const CR_Student_getregisterdata = async(req, res) => {

try{
    const user = req.user
    if(!user){
        res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
    }
    const studentinfo = await StudentsModel.findOne({email:user.email})

    const registerstatus = await SemesterMetadataModel.findOne({sem:studentinfo.currentSemester,batch:studentinfo.batch})
    let enrolledCourses = [], RACourses =[], SACourses = [], internship = [], activityPoints =[], DroppedCourses = [] , allowApplyForIntern = false, allowApplyForActPoints = false, registeredforinternship=false, registeredforactivitypoints=false
    
    if(registerstatus.courseRegistration.status){
        
        const db_enrolledCourses = await EnrollmentModel.find({studentId:studentinfo._id, type:"normal", enrolled:true, approval:{ $in: [3,4,10] } }).populate("courseCode", {courseCode:1,title:1,_id:0})
       
        for(let eachdoc of db_enrolledCourses){
            let obj  = {
                courseCategory:eachdoc.category,
                courseCode:eachdoc.courseCode.courseCode,
                courseTitle:eachdoc.courseCode.title,
                approval:eachdoc.approval
            }
            enrolledCourses.push(obj)
        }

        // Re - Appear Courses
        const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_RACourses){
            const enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:eachdoc.courseId._id,type:"RA"})
            if(enrollmentdata){
                
                if(enrollmentdata.approval==13 || enrollmentdata.approval==14){
                    enrollmentdata.approval=4
                    // await enrollmentdata.save()
                }
                const obj = {
                    courseCategory:eachdoc.category,
                    courseCode:eachdoc.courseId.courseCode,
                    title:eachdoc.courseId.title,
                    approval:enrollmentdata.approval
                }
                RACourses.push(obj)
            }
        }

        // Re - Registration courses
        const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_SACourses){
            const enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:eachdoc.courseId._id,type:"SA"})
            if(enrollmentdata){
                if(enrollmentdata.approval==13 || enrollmentdata.approval==14){
                    enrollmentdata.approval=4
                }
                const obj = {
                    courseCategory:eachdoc.category,
                    courseCode:eachdoc.courseId.courseCode,
                    title:eachdoc.courseId.title,
                    approval:enrollmentdata.approval
                }
                SACourses.push(obj)
            }else{
                console.log("The SA Course " + eachdoc + " was not marked as SA in enrollment collection")
            }
        }

        // Dropped Courses courses
        const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_DroppedCourses){
            if(eachdoc.approval==13 || eachdoc.approval==14){
                eachdoc.approval=4
            }
            const obj = {
                courseCategory:eachdoc.category,
                courseCode:eachdoc.courseCode.courseCode,
                title:eachdoc.courseCode.title,
                approval:eachdoc.approval
            }
            DroppedCourses.push(obj)
        }
        
        
        
        // fetch internship details
        // check whether the coursecode for internship is available in curriculum
        const courseDataforInternship = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
        
        if(courseDataforInternship){
            const createEnrollmentModel = {
                type:"internship",
                studentId:studentinfo._id,
                regulation:studentinfo.regulation,
                batch:studentinfo.batch,
                courseCode:courseDataforInternship._id,
                courseCategory:courseDataforInternship.category,
                branch:studentinfo.branch,
                semester:studentinfo.currentSemester,
                enrolled:true,
                approval:4
            }
            
            if(studentinfo.currentSemester%2==0){
                createEnrollmentModel.semType="even"
            }else{
                createEnrollmentModel.semType="odd"
            }

            // since no collection will be created for new users
            // check whether details are available in enrollment collection
            const checkindbforenrollmen = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseDataforInternship._id})
                
                // update to new
                if(checkindbforenrollmen){
                    
                    if(checkindbforenrollmen.approval!=10){
                        registeredforinternship=false
                    }
                    if(checkindbforenrollmen.approval==10 && checkindbforenrollmen.semester==studentinfo.currentSemester){
                        registeredforinternship=true
                    }
                    
                }
                else{
                    // create a new row in enrollment collection
                    const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                    await newenrollmentModel.save()
                    console.log("new enrollment collection for internship is created")
                }
                
                // create a new value added collection
                const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
                if(!db_internship){
                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"internship",
                    value:0
                }

                const result = new ValueAddedCourseModel(studentData)
                const getvalue = await result.save()
                console.log("new value added collection for internship is created")
                internship.push(getvalue.value)
                allowApplyForIntern = true
                
            // for an existing user send the available info
            }else{
    
                if(db_internship.value>6){
                    internship.push(db_internship.value)
                    allowApplyForIntern = false
                }else{
                    internship.push(db_internship.value)
                    allowApplyForIntern = true
                }
            }
        }else{
            console.log("The courseCode for internship is not available in curriculum")
        }
        

        // fetch activity points details
        const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})

        // since no collection will be created for new users
        
        // check whether the coursecode for activity points is available in curriculum
        const courseData = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
        
        if(courseData){
            const createEnrollmentModel = {
                type:"activityPoints",
                studentId:studentinfo._id,
                regulation:studentinfo.regulation,
                batch:studentinfo.batch,
                courseCode:courseData._id,
                courseCategory:courseDataforInternship.category,
                branch:studentinfo.branch,
                semester:studentinfo.currentSemester,
                enrolled:true,
                approval:4
            }
            
            if(studentinfo.currentSemester%2==0){
                createEnrollmentModel.semType="even"
            }else{
                createEnrollmentModel.semType="odd"
            }
            
            // check whether details are available in enrollment collection
            const checkindb = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseData._id})
            
            if(checkindb){

                if(checkindb.approval!=10){
                    registeredforactivitypoints = false
                }
                if(checkindb.approval==10 && checkindb.semester == studentinfo.currentSemester){
                    registeredforactivitypoints = true
                }

            }else{
                const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                await newenrollmentModel.save()
                console.log("New enrollment collection for Activity points has been added to db")
            }
            
            if(!db_activityPoints){
                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"activityPoints",
                    value:0
                }
                const result = new ValueAddedCourseModel(studentData)
                const getpoints = await result.save()
                
                console.log("New Value added for Activity points has been added to db")
                
                activityPoints.push(getpoints.value)
                allowApplyForActPoints = true
            }else{
                activityPoints.push(db_activityPoints.value)
                
                if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                    allowApplyForActPoints = true
                }
                if(studentinfo.type == "lateral" && db_activityPoints.value<75){
                    allowApplyForActPoints = true
                }
            }
        }else{
            console.log("The course code for activty points is not available for this students regulation")
        }

        res.status(200).json({success:true, msg:"Registration details are fetched",enrolledCourses, RACourses, SACourses, DroppedCourses, allowApplyForIntern, registeredforinternship, internship, registeredforactivitypoints, allowApplyForActPoints ,activityPoints})
        
    }else{
        res.status(200).json({success:false, msg:"Registration is not enabled, Can't send courses"})
    }

    }catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}


//save registration data to database
export const CR_Student_saveCourseRegisteration = async(req, res) => {
    try{
        let invalidCourse = [], invalidracourse=[], invalidsacourse=[],invalidDroppedcourse=[], invalidDroppingcourse=[]
        let message,messageforenrolledcourses,messageforracourses,messageforsacourses,messagefordroppededcourses,messagefordroppingcourses,success=false,messageforinternship, messageforactivitypoints, registeredForInternship, registeredForActivityPoints
        
        const coursesenrolled = {
            courseCode : req.body.enrolledCourses
        }

        const RACourses = {
            reappearCourse : req.body.RACourses
        }

        const SACourses = {
            reRegistrationCourse : req.body.SACourses
        }

        const DroppedCourses = {
            droppedCourse : req.body.droppedCourses
        }

        const DroppingCourses = {
            droppingCourse : req.body.droppingCourses
        }
       
        
        const intern = req.body.internship
        const actPoints = req.body.ActivityPoints
        
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        const studentinfo = await StudentsModel.findOne({email:user.email})

        for(let eachcourse of coursesenrolled.courseCode){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
        
            if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(!enrollmentdata || enrollmentdata.enrolled==false){
                    success = false
                    invalidCourse.push(eachcourse)
                    messageforenrolledcourses = "You have not enrolled for these courses or these courses "+ eachcourse + " may not be approved"
                }
                else{
                    success = true
                    messageforenrolledcourses = "Registration details (for enrolled Courses) "+ eachcourse + " were saved to database"
                    enrollmentdata.approval = 10
                    enrollmentdata.courseType = courseincurriculummodel.type
                    await enrollmentdata.save()
                }
            }
            else{
                invalidCourse.push(eachcourse)
                success = false
                messageforenrolledcourses = "These Course Code " +eachcourse+ " were not found in the database(Curriculum)"
            }
        }

        for(let eachracourse of RACourses.reappearCourse){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachracourse})
        
            if(courseincurriculummodel){
                const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                if(!db_RACourses){
                    success=false,
                    messageforracourses="This course code " +eachracourse+ " was not present in arrear collection for this student " + studentinfo.register
                    invalidracourse.push(eachracourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    if(!enrollmentdata){
                        success=false,
                        messageforracourses="It looks like you have not enrolled for this RA course" + eachracourse
                        invalidracourse.push(eachracourse)
                    }else{
                        success = true
                        messageforracourses = "Registration details (For RA Course) "+ eachracourse+ " were saved to database"
                        console.log(messageforracourses)
                        enrollmentdata.type="RA"
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                        enrollmentdata.courseType = courseincurriculummodel.type
                       await enrollmentdata.save()
                    }
                }
               
            }
            else{
                invalidCourse.push(eachracourse)
                success = false
                messageforracourses = "These Course Codes were not found in the database(Curriculum)"
            }

        }
        
        for(let eachsacourse of SACourses.reRegistrationCourse){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachsacourse})
        
            if(courseincurriculummodel){
                const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                if(!db_SACourses){
                    success=false,
                    messageforsacourses="This course code " +eachsacourse+ " was not present in arrear collection for this student "+studentinfo.register
                    invalidsacourse.push(eachsacourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    if(!enrollmentdata){
                        success=false,
                        messageforsacourses="It looks like you have not enrolled for this SA course "+eachsacourse
                        invalidsacourse.push(eachsacourse)
                    }else{
                        enrollmentdata.type="SA"
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                        enrollmentdata.courseType = courseincurriculummodel.type
                        await enrollmentdata.save()
                        success = true
                        messageforsacourses = "Registration details  (for SA Course) "+eachsacourse+ " were saved to database"
                    }
                } 
            }
            else{
                invalidsacourse.push(eachsacourse)
                success = false
                messageforsacourses = "These Course Code "+eachsacourse +" were not found in the database(Curriculum)"
            }
        }

        for(let eachdroppingcourse of DroppingCourses.droppingCourse){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachdroppingcourse})
        
            if(courseincurriculummodel){
                const db_DroppingCourses = await EnrollmentModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id}).populate("courseCode", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_DroppingCourses){
                    success=false,
                    messagefordroppingcourses="The dropping course code" +eachdroppingcourse+ " was not present in enrollment collection for the student" + studentinfo.register
                    console.log(messagefordroppingcourses)
                    invalidDroppingcourse.push(eachdroppingcourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messagefordroppingcourses="It looks like you have not enrolled for this course"
                        console.log(messagefordroppingcourses)
                        invalidDroppingcourse.push(eachdroppingcourse)
                    }else{
                        success = true
                        messagefordroppingcourses = "Registration details (for Dropping Course)"+ eachdroppingcourse+ " were saved to database"
                        console.log(messagefordroppingcourses)
                        enrollmentdata.type="dropped"
                        enrollmentdata.courseType = courseincurriculummodel.type
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 4
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalidDroppingcourse.push(eachdroppingcourse)
                success = false
                messagefordroppingcourses = "These Course Code" + eachdroppingcourse+ " were not found in the database(Curriculum)"
                console.log(messagefordroppingcourses)
            }

        }

        for(let eachdroppedcourse of DroppedCourses.droppedCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachdroppedcourse})
        
            if(courseincurriculummodel){
                const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_DroppedCourses){
                    success=false,
                    messagefordroppededcourses="The dropped course code" +eachdroppedcourse+ " was not present in enrollment collection for the student" + studentinfo.register
                    invalidDroppedcourse.push(eachdroppedcourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messagefordroppededcourses="It looks like you have not enrolled for this course"
                        console.log(messagefordroppededcourses)
                        invalidDroppedcourse.push(eachdroppedcourse)
                    }else{
                        success = true
                        messagefordroppededcourses = "Registration details (for Dropped Course) were saved to database"
                        console.log(messagefordroppededcourses)
                            
                        enrollmentdata.type="dropped"
                        enrollmentdata.courseType = courseincurriculummodel.type
                        
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalidDroppedcourse.push(eachdroppedcourse)
                success = false
                messagefordroppededcourses = "These Course Codes were not found in the database(Curriculum)"
                console.log(messagefordroppededcourses)
            }

        }



        if(intern){
            const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
            
            let flag=false
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_internship.value<6){
                // allowApplyForActPoints = true
                flag = true
                // message = "student registered for internship"
            }

            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                            success = true
                            registeredForInternship = true
                            messageforinternship = "Registration details (for Internship) were saved to database"
                            console.log(messageforinternship)
                            enrollmentdata.semester = studentinfo.currentSemester
                            if(studentinfo.currentSemester%2==0){
                                enrollmentdata.semType="even"
                            }else{
                                enrollmentdata.semType="odd"
                            }
                            enrollmentdata.approval = 10
                            enrollmentdata.courseType = courseincurriculummodel.type
                            await enrollmentdata.save()
                    }else{
                        console.log("The internship for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForInternship = false
                    messageforinternship = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
                }
                
            }else{
                registeredForInternship = false
                // console.log("Student unable to register for Internships because the student may already met his requirements(i.e -> intern credits > 6)")
            
            }
        }else{
            
            const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                
            if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(enrollmentdata){
                    
                    success = true
                    registeredForInternship = false
                    messageforinternship = "Registration details (for Internship) were saved to database  - Deregistered" 
                    console.log(messageforinternship)
                    enrollmentdata.courseType = courseincurriculummodel.type
                    enrollmentdata.approval = 4
                    await enrollmentdata.save()
                
                }else{
                    // console.log("The internship for this student is not found in the enollment collections")
                }
            }else{
                registeredForInternship = false
                messageforinternship = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
            }
                
        }

        if(actPoints){
            const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})
           
            let flag=false
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                flag = true
            }else if(studentinfo.type == "lateral" && db_internship.value<75){
                flag = true
            }
            
            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                            success = true
                            registeredForActivityPoints = true
                            messageforactivitypoints = "Registration details (for Activity Points) were saved to database"
                            // console.log(messageforactivitypoints)
                            enrollmentdata.semester = studentinfo.currentSemester
                            if(studentinfo.currentSemester%2==0){
                                enrollmentdata.semType="even"
                            }else{
                                enrollmentdata.semType="odd"
                            }
                            enrollmentdata.approval = 10
                            enrollmentdata.courseType = courseincurriculummodel.type
                            await enrollmentdata.save()
                    
                    }else{
                        // console.log("The Activity Points for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForActivityPoints = false
                    messageforactivitypoints = "The Activity Points for your regulation is not found in curriculum(No course Code for internship type)"
                    // console.log(messageforactivitypoints)
                }
            }else{
                // message="Student unable to register for Activity Points"
                registeredForActivityPoints = false
                // console.log("Student unable to register for Activity Points because the student may already met his requirements(i.e -> activityPoints> 100||75)")
            }
        }else{
            const courseincurriculummodel = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                            success = true
                            registeredForActivityPoints = false
                            messageforactivitypoints = "Registration details (for Activity Points) were saved to database - Deregistered"
                            // console.log(messageforactivitypoints)
                            enrollmentdata.approval = 4
                            await enrollmentdata.save()
                    
                    }else{
                        // console.log("The Activity Points for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForActivityPoints = false
                    message = "The Activity Points for your regulation is not found in curriculum(No course Code for internship type)"
                    // console.log(message)
                }
        }

        res.status(200).json({success:success, message:message,messageforenrolledcourses, invalidCourse, messageforracourses, invalidracourse, messageforsacourses, invalidsacourse, messagefordroppingcourses, invalidDroppingcourse, messagefordroppededcourses, invalidDroppedcourse, registeredForActivityPoints,registeredForInternship})
        
     
    }catch(error){
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}




/////////////////////// EXAM FEE MODULE ///////////////////////


export const ExamFeePayment_GetData = async (req, res) => {
try {
    const user = req.user
    if(!user){
        res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
    }
    
    // Initialize variables to be used for the response
    let allowed = null, data = null, restrict = false;
    
    // Find the student information using the provided register number
    const studentinfo = await StudentsModel.findOne({email:user.email})
    
    // Check if the student information was found and get the metadata related to fee payment for their current semester
    if (studentinfo) {
        allowed = await SemesterMetadataModel.findOne(
            { batch: studentinfo.batch, sem: studentinfo.currentSemester },
            { receivePaymentDetails: 1 }
        );
    }
    // Otherwise, retrieve the exam payment details for the student
    if (allowed && allowed.receivePaymentDetails) {
        restrict = false;
        data = await ExamPaymentModel.findOne({
            studentId: studentinfo._id,
            semester: studentinfo.currentSemester
        });
    }
    // If the student is not allowed to enter payment details, restrict the access
    else {
        restrict = true;
    }

    // Return the exam fee payment details as a JSON response
    res.status(200).json({ success: true, restrict: restrict, message: "Result is fetched successfully", data });
} catch (error) {
    // Handle any errors that may occur during the execution of this function
    res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
}
}

export const ExamFeePayment_saveData = async (req, res) => {
    try {
        const user = req.user
        if(!user){
            res.status(200).json({success:false,message:"User is not authenticated",authenticated:false})
        }
        // Find the student info based on the register number
        const studentinfo = await StudentsModel.findOne({email:user.email})
        
        let data = req.body;
  
        // Find the exam payment document for the current semester and the current student
        let doc = await ExamPaymentModel.findOne({
            studentId: studentinfo._id,
            semester: studentinfo.currentSemester,
        });
  
        if (doc) {
            // Update the existing exam payment document with new data
            doc.date = data.paymentDate;
            doc.referenceId = data.referenceNumber;
            doc.paid = true;
    
            // Save the updated exam payment document
            await doc.save();
    
            // Send success response to client
            res.status(200).json({ success: true, message: "Payment Data Saved Successfully" });
        } else {
            // Send error response to client if exam payment document not found
            res.status(200).json({ success: false, message: "Unable to save data" });
        }
    } catch (error) {
        // Send error response to client if any error occurred
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error.message });
    }
};

/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ////////////// /////////
export const getFeedback = async (req, res) => {

    try {

        let params = req.query

        let check = await SemesterMetadataModel.find({sem: params.semester-1, batch: params.batch}, {feedback: 1}).lean()
        check = check[0].feedback

        let start = new Date(check.start).getTime()
        let end = new Date(check.end).getTime()
        let now = new Date().getFullYear()+((new Date().getMonth()+1)<10?"-0":"-")+(new Date().getMonth()+1)+"-"+new Date().getDate()+"T"+new Date().toTimeString().slice(0,8)+".000Z"
        now = new Date(now).getTime()

        if(start<now && now < end){
            let feedback = await FeedbackModel.find({studentId: params._id, semester: params.semester-1, submitted: false }, {__v: 0, createdAt: 0, updatedAt: 0, branch: 0, batch: 0, semester: 0}).populate("feedback.questionId", {type: 1, question: 1}).populate("facultyId", {title: 1, firstName: 1, lastName: 1}).populate("courseId", {courseCode:1, type: 1}).lean()
            if(feedback.length>0){
            feedback = feedback.map( (doc) => {
                doc.facultyName = doc.facultyId.title+" "+doc.facultyId.firstName+" "+doc.facultyId.lastName
                delete doc.facultyId
                doc.courseCode = doc.courseId.courseCode
                doc.courseType = doc.courseId.type
                delete doc.courseId
                let feedback = {}
                doc.feedback.map( (question) => {
                    let type = question.questionId.type
                    let ques = question.questionId.question
                    if(!feedback[type]) feedback[type] = {}
                    if(!feedback[type][ques]) feedback[type][ques] = {}
                    feedback[type][ques]["questionId"] = question.questionId._id
                    feedback[type][ques]["score"] = question.score
                    feedback[type][ques]["_id"] = question._id
                    feedback[type][ques]["type"] = question.type
                } )
                doc.feedback = feedback

                return doc
            } )
            res.status(200).json(feedback)   
        }   
        else res.status(200).send("Feedback Submitted!!!")
            return 
        }

        res.status(200).send("Feedback closed!!!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const postFeedback = async (req, res) => {

    try {

        let feedbacks = req.body

        feedbacks.forEach( async (doc) => {
            let _id = doc._id
            let feedback = []
            Object.keys(doc.feedback).forEach((type)=>{
                Object.keys(doc.feedback[type]).forEach((question)=>feedback.push(doc.feedback[type][question]))
            })
            doc.feedback = feedback
            doc.submitted = true
            delete doc._id
            
            await FeedbackModel.updateOne({_id: _id}, doc)    
        } )
        res.status(200).send("Feedback posted successfully!")
    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}


/////////////////////// REQUEST MODULE ///////////////////////

export const profileRequest = async (req, res) => {

    try {

        let data = req.body
        data._id = mongoose.Types.ObjectId();
        await StudentsModel.updateOne( {_id: data.from}, { requestId: data._id } )
        await RequestsModel.create(data)

        res.status(200).send("Requested successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const cancelProfileRequest = async (req, res) => {

    try {

        let {requestId} = req.body
        
        await StudentsModel.updateOne({requestId: requestId}, {requestId: ""})
        await RequestsModel.updateOne({_id: requestId}, {cancel: true})

        res.status(200).send("Profile request cancelled successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

/////////////////////// PROFILE ///////////////////////

export const getProfile = async (req, res) => {

    try {

        let { studentId } = req.query
        //Get the student details 
        let profile = await StudentDetailsModel.find({ studentId: studentId }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0, isActive: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0, isCredentialCreated: 0, status: 0, isActive: 0, masterAttendance: 0 })
        profile = { ...profile[0].studentId.toObject(), ...profile[0].toObject() }

        delete profile.studentId
        profile = shrinkObject(profile)

        //find the fa
        let staff = await SemesterMetadataModel.find({ sem: profile.currentSemester, batch: profile.batch, "facultyAdvisor.branch": profile.branch }, {_id:0, "facultyAdvisor.$":1})

        //storing the fa and hod 
        profile.toId = staff[0].facultyAdvisor[0].faculty
        res.status(200).json(profile)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

function shrinkObject(doc, str = "", result = {}) {

    for(let key of Object.keys(doc)) {

        let newKey = str != "" ? str + "." + key : key

        if(key!="_id" && typeof(doc[key]) == typeof({})) {

            shrinkObject(doc[key], newKey, result)

        } else result[newKey] = doc[key]

    }   return result
}