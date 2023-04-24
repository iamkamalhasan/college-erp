import { AttendanceModel } from "../models/AttendanceModel.js";
import { CalendarModel } from "../models/CalendarModel.js";
import mongoose from "mongoose"
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { RequestsModel } from "../models/RequestsModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { StudentDetailsModel } from "../models/StudentDetailsModel.js";
import { StudentsModel } from "../models/StudentsModel.js";
import fs from "fs"
import { ExamFeesModel } from "../models/ExamFeesModel.js";
import { ExamPaymentModel } from "../models/ExamPaymentModel.js";
import { UsersModel } from "../models/UsersModel.js";

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////

export const demo = async(req,res) => {

    try{

        await EnrollmentModel.updateMany({branch:"Information Technology"}, {branch:"IT"})
        await AttendanceModel.updateMany({branch:"Information Technology"}, {branch:"IT"})
        await MasterTimetableModel.updateMany({branch:"Information Technology"}, {branch:"IT"})
        await CourseDetailsModel.updateMany({branch:"Information Technology"}, {branch:"IT"})

        res.status(200).send("Update Success")

    }catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getAttendanceReport = async(req,res) => {

    try{

        let { branch, batch, semester, section } = req.query

        //Get Course List of the student Enrolled
        let courses = await CourseDetailsModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), semester: parseInt(semester), section:section, "freezeAttendance.save": 2 } },
                { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1, "hodFreeze.attendance":1 } },
                {
                    $group: {
                        _id: {
                            "courseId": "$courseId"
                        },
                        facultyId: {$addToSet:"$facultyId"},
                        courseCode: {$addToSet: "$courseCode" },
                        semester:{$addToSet:"$semester"},
                        freeze:{$addToSet:"$hodFreeze.attendance"}
                    }
                }

            ]
        )

        if(courses.length==0){
            res.status(200).json( { freeze:false } )
            return
        }

        await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
        let Courses = []
        let condonationFreeze = true;
        for(let course of courses){
            condonationFreeze = condonationFreeze && course.freeze[0]
            let temp1 = []
            for(let faculty of course.facultyId){
                temp1.push({_id:faculty})
            }

            await FacultyModel.populate(temp1, { path:"_id", select: { title:1, firstName:1, lastName:1 } })
            
            let faculties = ''
            for(let faculty of temp1){
                faculties+=(faculty._id.title+" "+faculty._id.firstName+" "+faculty._id.lastName)+", "
            }
            
            let temp = {
                courseCode: course.courseCode[0],
                courseName: course._id.courseId.title,
                freeze: course.freeze[0],
                facultyName: faculties.slice(0,-2)
            }
            Courses.push({...temp})
            
        }
        
        //Course-wise Attendance Percent
        let data1 = await EnrollmentModel.find({ branch:branch, batch:batch, semester:semester }, { attendancePercentage:1, courseId:1 }).populate("courseId",{courseCode:1}).populate("studentId", { register:1, firstName:1, lastName:1 })
        data1 = data1.map(item=>item.toObject())

        //Regularize data for front-end
        for(let item of data1){
            item.register = item.studentId.register
            item.studentName = item.studentId.firstName+" "+item.studentId.lastName
            delete item.studentId
            item.courseCode = item.courseId.courseCode
            delete item.courseId
        }

        //Master Attendance Percent
        let data2 = await StudentsModel.find({ branch:"IT", batch:batch }, { masterAttendance:1, firstName:1, lastName:1, register:1 })
        data2 = data2.map(item=>item.toObject()).filter(item=>(item.hasOwnProperty("masterAttendance")))
        console.log(data2)

        //Regularize data for front-end
        for(let item of data2){
            item.studentName = item.firstName+" "+item.lastName
            item.courseCode = "Master Attendance"
            item.attendancePercentage = item['masterAttendance']['sem_'+semester]
            delete item.masterAttendance
            delete item.firstName
            delete item.lastName
        }
        
        let result = {
            freeze:true,
            condonationFreeze,
            data:[...data1,...data2],
            Courses
        }
        
        //Sort the student list
        result.data.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        //Sort the Course
        result.Courses.sort((a, b) => {
            if (a.courseCode < b.courseCode) {
                return -1;
            }
            if (a.courseCode > b.courseCode) {
                return 1;
            }
            return 0;
        })

        res.status(200).json(result)
    
    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getOpenCondonation = async(req,res) => {
    
    try{

        let { branch, batch, semester, section, data }  = req.body
        
        for(let item of data){
            
            if(item.courseCode=='Master Attendance'){
            
                let attd = parseFloat(item.attendancePercentage.split(" ")[1].slice(0,-1))
                if(attd<75){
                    await EnrollmentModel.updateMany({studentId:item._id},{examEligibility:2})
                } else {
                    await EnrollmentModel.updateMany({studentId:item._id},{examEligibility:1})
                }
            
            }else{

                let attd = parseFloat(item.attendancePercentage.split(" ")[1].slice(0,-1))
                if(attd>=75){
                    await EnrollmentModel.updateOne( { _id:item._id }, { condonation:{status:"Not Required"} } )
                }else if(attd>=50){
                    await EnrollmentModel.updateOne( { _id:item._id }, { condonation: {status:"Applicable"} })
                }else{
                    await EnrollmentModel.updateOne( { _id:item._id }, { condonation:{status:"Not Applicable"} } )
                }

            }

        }

        await CourseDetailsModel.updateMany( { branch:branch, batch:batch, semester:semester, section }, { "hodFreeze.attendance": true } )

        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getFreezeAndOpenCondonation = async(req,res) => {

    try {

        let { branch, batch, semester } = req.query
        
        await CourseDetailsModel.updateMany( { branch:branch, batch:batch, semester:semester }, { $set:{"freeze.attendance":true}} )

        //await EnrollmentModel.updateMany( { branch:branch, batch:batch, semester:semester }, { $unset: { condonation:{} } } )
        
        await EnrollmentModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), semester: parseInt(semester) } },
                { "$project": { attdpercent: { $toDecimal: {$rtrim: { input: { $arrayElemAt: [ { $split: [ "$attendancePercentage", " " ] } , 1 ] }, chars:'%' } } } } },
                { "$addFields": {condonation:{status:{ $switch: {
                    branches: [
                        { case: { $gte: [ "$attdpercent", 75.00 ] }, then: "Not Required" },
                        { case: { $gte: [ "$attdpercent", 50.00 ] }, then: "Applicable" },   
                    ],
                    default: "Not Applicable"
                }}}}}
            ]
        )

        res.status(200).json(await EnrollmentModel.find({batch:batch,semester:semester,branch:branch}))

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}

export const getCurrentCourses = async (req, res) => {

    try{

        let { branch } = req.query

        //Get Current Batch Start and End Date
        let semesters = await SemesterMetadataModel.find({}, { batch: 1, sem: 1 }).sort({ date: -1 }).limit(4);
        semesters = semesters.map(semester => (semester.toObject()))
        semesters = semesters.filter(item => (item.sem!=1)&&(item.sem!=2))
        let Courses = []

        for(let semester of semesters){
            let courses = await CourseDetailsModel.aggregate(
                [
                    { "$match": { branch: branch, batch: parseInt(semester.batch), semester: parseInt(semester.sem) } },
                    { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1, attendanceApproval:1, section:1 } },
                    {
                        $group: {
                            _id: {
                                "courseId": "$courseId",
                                "section":"$section"
                            },
                            courseCode: {$addToSet: "$courseCode" },
                            faApproved: {$addToSet: "$attendanceApproval.fa"}
                        }
                    }
    
                ]
            )
            
            await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
            for(let course of courses){
                
                course.batch = semester.batch
                course.section = course._id.section
                course.semester = semester.sem
                course.curriculumId = course._id.courseId._id,
                course.courseCode = course.courseCode[0],
                course.courseName = course._id.courseId.title,
                course.faApproved = course.faApproved[0]
                delete course._id

            }
            
            courses.sort((a, b) => {
                if (a.courseCode < b.courseCode) {
                    return -1;
                }
                if (a.courseCode > b.courseCode) {
                    return 1;
                }
                return 0;
            })

            Courses = Courses.concat(...courses)
    
        }
        
        
        res.status(200).json(Courses)
        
    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getFirstYearCurrentCourses = async (req, res) => {

    try{

        let { batch, semester } = req.query

        let Courses = []

        let courses = await CourseDetailsModel.aggregate(
            [
                { "$match": { batch: parseInt(batch), semester: parseInt(semester) } },
                { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1, attendanceApproval:1, section:1, branch:1 } },
                {
                    $group: {
                        _id: {
                            "courseId": "$courseId",
                            "section":"$section",
                            "branch":"$branch"
                        },
                        courseCode: {$addToSet: "$courseCode" },
                        faApproved: {$addToSet: "$attendanceApproval.fa"}
                    }
                }

            ]
        )
        
        await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
        for(let course of courses){
            course.branch = course._id.branch
            course.batch = batch
            course.section = course._id.section
            course.semester = semester
            course.curriculumId = course._id.courseId._id,
            course.courseCode = course.courseCode[0],
            course.courseName = course._id.courseId.title,
            course.faApproved = course.faApproved[0]
            delete course._id

        }
        
        courses.sort((a, b) => {
            if (a.courseCode < b.courseCode) {
                return -1;
            }
            if (a.courseCode > b.courseCode) {
                return 1;
            }
            return 0;
        })

        Courses = Courses.concat(...courses)

        
        res.status(200).json(Courses)
        
    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getFinalAttendanceReport = async (req,res) => {

    try {

        let { curriculumId, semester, section, branch, batch } = req.query

        let data = await EnrollmentModel.find({courseCode: curriculumId, semeseter:semester, section:section, branch:branch, batch:batch }, {condonation:1, attendancePercentage:1, examEligibility:1}).populate("studentId", {register:1, firstName:1, lastName:1})
        
        data = data.map(item => item.toObject())
        for(let student of data){
            student.register = student.studentId.register
            student.name = student.studentId.firstName+" "+student.studentId.lastName
            student.attendance = student.attendancePercentage
            student.Condonation = student.condonation.status
            student.ExamEligibility = student.examEligibility
            delete student.condonation
            delete student.attendancePercentage
            delete student.examEligibility
            delete student.studentId
        }

        let faculties = await CourseDetailsModel.find( { courseId:curriculumId }, {"attendanceApproval.hod":1} ).populate("facultyId", {title:1, firstName:1, lastName:1})
        
        faculties = faculties.map(faculty => (faculty.toObject()))
        let approved = true;
        for(let faculty of faculties){
            faculty.facultyName = faculty.facultyId.title+" "+faculty.facultyId.firstName+" "+faculty.facultyId.lastName
            approved = approved && faculty.attendanceApproval.hod
            
        }
        let Faculties = new Set(faculties.map(faculty => faculty.facultyName))

        let facultyName = Array.from(Faculties).join(', ');

        let result = {
            approved, facultyName:facultyName, data
        }
        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getSubmitReport = async (req,res) => {

    try {

        let { curriculumId, semester, branch, batch, section } = req.query

        await CourseDetailsModel.updateMany( { courseId:curriculumId, branch:branch, batch:batch, semester:semester, section:section }, { "attendanceApproval.hod":true})

        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


export const getStudentList = async (req,res) => {

    try {

        let { branch, batch, semester, section } = req.query

        console.log("Hello", branch, batch, section, semester)

        let data = await StudentsModel.find( { branch:branch, batch:parseInt(batch), semester:parseInt(semester), section:section }, { register:1, firstName:1, lastName:1, hallTicketRelease:1 } )
        data = data.map( student => student.toObject() )
        for(let student of data) {
            student.name = student.firstName + " " + student.lastName
            student['HallTicket Release'] = student.hallTicketRelease
            delete student.hallTicketRelease
            delete student.firstName
            delete student.lastName
        }

        data.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        

        res.status(200).json(data)

    } catch (err) { res.status(400).sedn("Request Failed: " + err.message); }

}

export const getStudentHallTicket = async (req,res) => {

    try {

        let { studentId, semester } = req.query

        let courses = await EnrollmentModel.find( { studentId:studentId, hallTicketRelease:true }, { courseId:1 } ).populate("courseId",{courseCode:1, semester:1})
        courses = courses.map( course => course.toObject() )
        
        let temp = await StudentDetailsModel.find( { studentId:studentId }, { permanentAddress:1, temporaryAddress:1, "father.mobile":1 }).populate("studentId", { register:1, firstName:1, lastName:1, mobile:1, currentSemester:1, degree:1, branch:1 } )
        temp = temp.map(student => student.toObject() )

        let feeTemp = await ExamPaymentModel.find( { studentId:studentId, semester:semester })
        feeTemp = feeTemp.map(student => student.toObject() )

        let student = {
            register : temp[0].studentId.register, name : temp[0].studentId.firstName + " " + temp[0].studentId.lastName,
            branch: temp[0].studentId.degree + " " + temp[0].studentId.branch, period: "NOV/DEC 2022",
            sem:  temp[0].studentId.currentSemester,
            fee1: feeTemp[0].paymentDetails.applicationForm, fee2: feeTemp[0].paymentDetails.courseRegistrationFee.total, fee3: feeTemp[0].paymentDetails.statementOfMarks, 
            fee4: feeTemp[0].paymentDetails.consolidateMarkSheet + feeTemp[0].paymentDetails.courseCompletionCertificate, 
            fee5: feeTemp[0].paymentDetails.provisionalCertificate + feeTemp[0].paymentDetails.degreeCertificate + feeTemp[0].paymentDetails.otherUniversityFee, 
            fee6: 0,
            total: feeTemp[0].paymentDetails.totalAmount,
            tAddr: temp[0].temporaryAddress,
            tPin: 607001,
            pAddr: temp[0].permanentAddress,
            pPin: 607001,
            ph: temp[0].father.mobile,
            mobile: temp[0].studentId.mobile
        }
        
        let Courses = []
        let cnt = courses.length;
        for(let course of courses) {

            let flag = true
            console.log(course)
            for(let cr of Courses) {
                if(cr.sem==course.courseId.semester) {
                    cr.courseCodes.push(course.courseId.courseCode)
                    flag = false
                    break
                }
            }
            
            if(flag==true) {
                let cr = {
                    sem:course.courseId.semester,
                    courseCodes: [course.courseId.courseCode]
                }
                Courses.push({...cr})
            }
        
        } 

        let crCnt = ""
        let arrear = ""

        let semesters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

        for(let item of Courses) {
            if(item.sem==student.sem)
                crCnt += semesters[parseInt(item.sem)-1]+"("+item.courseCodes.length+")"
            else
                crCnt += semesters[parseInt(item.sem)-1]+"("+item.courseCodes.length+"), " 
        }

        student.courseList = Courses
        student.course = cnt
        student.current = crCnt
        student.arrear = arrear.slice(0,-2)
        
        res.status(200).json(student)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getHallTicket = async (req,res) => {

    try {

        let { branch, section, batch, semester } = req.query

        console.log("hello", branch, batch, section, semester)

        let data = await EnrollmentModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), section:section, semester: parseInt(semester) } },
                { "$project": { studentId:1, courseId:1, hallticketRelease:1 } },
                {
                    $group: {
                        _id: {
                            "studentId": "$studentId"
                        },
                        courseId: {$addToSet:"$courseId"},
                        eligible: {$addToSet:"$hallticketRelease"}
                    }
                },
                { $sort: { '_id.studentId':1 } }
            ]
        )

        for(let student of data) {
            let temp = await StudentDetailsModel.find( { studentId:student._id.studentId }, { permanentAddress:1, temporaryAddress:1, "father.mobile":1 }).populate("studentId", { register:1, firstName:1, lastName:1, mobile:1, currentSemester:1, degree:1 } )
            console.log(temp)
            student.register = temp[0].studentId.register
            student.name = temp[0].studentId.firstName + " " + temp[0].studentId.lastName
            student.eligible = student.eligible[0]
            student.data = {
                register : student.register, name : student.name,
                branch: temp[0].studentId.degree + " " + branch, period: "NOV/DEC 2022",
                sem:  temp[0].studentId.currentSemester,
                fee1: 80, fee2: 200, fee3: 70, fee4: 600, fee5: 800, fee6: 0,
                total: 1170,
                tAddr: temp[0].temporaryAddress,
                tPin: 607001,
                pAddr: temp[0].permanentAddress,
                pPin: 607001,
                ph: temp[0].father.mobile,
                mobile: temp[0].studentId.mobile
            }
            let courses = []
            for(let course of student.courseId) {
                let tempCourse = await CourseDetailsModel.find( { _id:course }, { courseCode:1, semester:1 } )
                let flag = true
                for(let cr of courses) {
                    if(cr.sem==tempCourse[0].semester) {
                        cr.courseCodes.push(tempCourse[0].courseCode)
                        flag = false
                        break
                    }
                }
                if(flag==true) {
                    let cr = {
                        sem:tempCourse[0].semester,
                        courseCodes: [tempCourse[0].courseCode]
                    }
                    courses.push({...cr})
                }
            }
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getFileSend = async(req,res) => {

    try {
        
        let blob = fs.readFileSync('./utilities/hallticket.pdf')
        
        res.status(200).send(blob)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

/////////////////////// ENROLLMENT MODULE ///////////////////////

// fetch data to feed the enrollment page 
export const CE_HOD_getenrolledstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},approval:{$in:[-4,-3,-2,-1,0,1,2,3,4,-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             

        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
               
               
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
            //    studentsEnrolled:
                studentsList:nstudents
                
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
             
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


export const CE_HOD_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = ["message : Following Course Codes was not found in curriculum"]
        let invalidregisternumber = ["message : Following Student register numbers were not found in students collection"]
        let invalid = [
            "message : Following students were approved/rejected by higher staffs. (You will not be able to perform any changes)"
        ]
        let unenrolled = [
            "message : Following Students have not enrolled for given courses"]

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                success = false
                const objc = {
                    courseCode:course.courseCode
                }
                invalidCourseCode.push(objc)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                const obj = {}
                if(!studentinfo){
                    success = false
                    const objs = {
                        register: student.register
                    }
                    invalidregisternumber.push(objs)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    const objs = {
                        register: student.register,
                        courseCode:course.courseCode
                    }
                    unenrolled.push(objs)
                    success = false
                    continue
                }
                if(enrollmentdata.approval>3 && enrollmentdata.approval<=14){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval < -3 && enrollmentdata.approval>-11){
                    success = false
                   
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="rejected"
                    
                    invalid.push(obj)
                    continue
                }
                
                enrollmentdata.approval = student.approval
                enrollmentdata.enrolled = true
                if(student.approval==-3){
                    enrollmentdata.enrolled = false
                }
                enrollmentdata.courseType = enrollmentdata.courseType ? enrollmentdata.courseType : courseinfo.type
                enrollmentdata.courseCategory = enrollmentdata.courseCategory ? enrollmentdata.courseCategory : courseinfo.category
                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    continue
                }
            }
        }
       
        res.status(200).json({success:success,message:message,invalid,invalidCourseCode,invalidregisternumber,unenrolled})
        
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

export const CR_HOD_getRegisteredstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},enrolled:true,approval:{$in:[-11,-12,-13,-14,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             

        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
                studentsList:nstudents
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
        //     enrollmentdata.forEach(groupdata)
        // //    finaldetails
        
        //     function groupdata(eachcourse){
            
            //         const course = {
                //            courseCode : eachcourse.courseCode.courseCode,
                //            courseTitle: eachcourse.courseCode.title,
                //         //    studentsEnrolled:
    //             studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
    //         }
    //         courses.push(course)

    //         // return courses
    //     }
        // console.log(courses)
        //     res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_HOD_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = ["message : Following Course Codes was not found in curriculum"]
        let invalidregisternumber = ["message : Following Student register numbers were not found in students collection"]
        let invalid = [
            "message : Following students were approved/rejected by higher staffs. (You will not be able to perform any changes)"
        ]
        let unenrolled = [
            "message : Following Students have not enrolled for given courses"]

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                success = false
                const objc = {
                    courseCode:course.courseCode
                }
                invalidCourseCode.push(objc)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                const obj = {}
                if(!studentinfo){
                    success = false
                    const objs = {
                        register: student.register,
                    }
                    invalidregisternumber.push(objs)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    const objs = {
                        register: student.register,
                        courseCode:course.courseCode
                    }
                    unenrolled.push(objs)
                    success = false
                    continue
                }
                if(enrollmentdata.approval>13){
                    success = false
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval < -13 && enrollmentdata.approval>-15){
                    success = false
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="rejected"
                    invalid.push(obj)
                    continue
                }
                
                enrollmentdata.approval = student.approval
                enrollmentdata.courseType = enrollmentdata.courseType ? enrollmentdata.courseType : courseinfo.type
                enrollmentdata.courseCategory = enrollmentdata.courseCategory ? enrollmentdata.courseCategory : courseinfo.category
                
                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        res.status(200).json({success:success,message:message,invalid,invalidCourseCode,invalidregisternumber,unenrolled})
        
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


/////////////////////// PROFILE ////////////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query, toId = null, staff = null
        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = profile[0]

        staff = await FacultyModel.find({ admin: true }, { _id: 1 })
        toId = staff[0]._id

        res.status(200).json({...profile.toObject(), toId: toId })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

/////////////////////// REQUEST MODULE ///////////////////////
export const profileRequest = async (req, res) => {

    try {

        let data = req.body
        data._id = mongoose.Types.ObjectId();
        await FacultyModel.updateOne( {_id: data.from}, { requestId: data._id } )
        await RequestsModel.create(data.request)

        res.status(200).send("Requested successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}


export const cancelProfileRequest = async (req, res) => {

    try {

        let {requestId} = req.body
        
        await FacultyModel.updateOne({requestId: requestId}, {requestId: ""})
        await RequestsModel.updateOne({_id: requestId}, {cancel: true})

        res.status(200).send("Profile request cancelled successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getRequests = async (req, res) => {

    try {

        let {facultyId} = req.query

        let requests = await RequestsModel.find({to: facultyId}, {__v: 0, createdAt:0, updatedAt:0}).sort({createdAt:'desc'})

        res.status(200).json(requests)


    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const updateFacultyProfile = async (req, res) => {

    try {

        let data = req.body
        data.body = JSON.parse(data.body)

        if(data.approved) await FacultyModel.updateOne({_id: data.from}, {...data.body.new, requestId: ""})
        else await FacultyModel.updateOne({_id: data.from}, {requestId: ""})

        if(data.body.new.email)
            await UsersModel.updateOne({userId: data.from}, {email: data.body.new.email})

        res.status(200).send("Request updated successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const updateUnfreezeRequest = async (req, res) => {

    try {

        let request = req.body

        let _id = JSON.parse(request.body)._id          // _id belongs to MasterTimeTable

        let update = { unfreezeId: "" }

        if(request.approved){
            let now = new Date()
            update.freeze = new Date(now.setTime(now.getTime + data.deadline*60*60*1000))
        }
        
        await MasterTimetableModel.updateOne({_id: request.body}, update)

        await RequestsModel.updateOne({_id: request._id}, {done: true})

        res.status(200).send("Request updated successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}