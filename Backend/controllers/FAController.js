import mongoose from "mongoose"

import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js"
import { MasterTimetableModel } from "../models/MasterTimetableModel.js"
import { AttendanceModel } from "../models/AttendanceModel.js"
import { CourseDetailsModel } from "../models/CourseDetailsModel.js"
import { CurriculumModel } from "../models/CurriculumModel.js"
import { RequestsModel } from "../models/RequestsModel.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { StudentDetailsModel } from '../models/StudentDetailsModel.js'
import { UsersModel } from "../models/UsersModel.js"

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////


export const demo = async (req, res) => {
    try {
        res.status(200).json(await MasterTimetableModel.find({ _id: "63faea970fbbb6e187cba951" }))
    } catch (err) { res.status(400).send("Failed: " + err.message) }
}

//Completed
export const getAttendance = async (req, res) => {

    try {

        let result = []
        console.log(req.query)
        let { date, batch, branch, section } = req.query

        //Get all periods of the day..
        let data = await MasterTimetableModel.find({ date: date, batch: parseInt(batch), branch: branch, section:section }, { marked: 1, period: 1, courseId: 1, freeze:1 }).populate("courseId", { courseId: 1, courseCode: 1 })
        await CurriculumModel.populate(data, { path: "courseId.courseId", select: { title: 1 } })
        data = data.map(period => (period.toObject()))
        console.log(data.length)
        //Iterate for each period...
        for (let period of data) {
            console.log(period)
            //Check if Data exist...
            if (period.marked == 0) {

                //Get data from EnrollmentModel
                let students = await EnrollmentModel.find({ courseId: period.courseId, batch: batch, branch: branch, section:section }, { _id: 0, studentId: 1, courseId: 1 }).populate("studentId", { register: 1, firstName: 1, lastName: 1 })
                students = students.map(student => student.toObject())

                //Regularize data for front-end
                //Sending all data to push easier at save...
                for (let student of students) {
                    student.masterTimetableId = period._id
                    student.courseCode = period.courseId.courseCode
                    student.courseName = period.courseId.courseId.title
                    student.branch = branch
                    student.batch = batch
                    student.section = section
                    student.register = student.studentId.register
                    student.studetName = student.studentId.firstName + " " + student.studentId.lastName
                    student.studentId = student.studentId._id
                    student.date = date
                    student.period = period.period
                    student.present = true
                    student.onduty = false
                    student.marked=false
                    student.freezed=false
                    console.log(student)
                    result.push({ ...student })
                }

            } else {

                //Get exist data...
                let students = await AttendanceModel.find({ batch: batch, branch: branch, section:section, date: date, period: period.period, courseId:period.courseId._id }).populate("studentId", { register: 1, firstName: 1, lastName: 1 })
                students = students.map(student => student.toObject())
                for (let student of students) {
                    student.register = student.studentId.register
                    student.studentName = student.studentId.firstName + " " + student.studentId.lastName
                    student.studentId = student.studentId._id
                    if(period.marked==1){
                        console.log(student.register,student.period,period.marked)
                    }
                    if(period.marked==1)
                        student.marked = true
                    else
                        student.marked=false
                    console.log(student)
                    result.push({ ...student })
                }

            }

        }

        console.log(result)

        result.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })

        console.log(result)
        
        res.status(200).json(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const postAttendance = async (req, res) => {

    try {

        let data = req.body
        let result = []

        //Iterate over each student
        for (let student of data) {

            //Check if Document exist
            if (student.hasOwnProperty("_id")) {
                await AttendanceModel.updateOne({ _id: student._id }, { present: student.present, onduty: student.onduty })
            } else {
                delete student.courseName
                delete student.studentName
                delete student.register
                delete student.marked
                result.push({ ...student })
            }

        }

        //Create new entries if needed
        if (result.length != 0) {
            console.log(result.length)
            await AttendanceModel.insertMany(result);
        }

        await MasterTimetableModel.updateMany({ branch: data[0].branch, batch: data[0].batch, date: data[0].date, marked:0}, { marked: 1 })

        res.status(200).send("Update Successful")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getRequestReport = async (req,res) => {

    try {
        
        let { startDate, endDate, branch, batch, semester, section } = req.query

        let freezeAttendance = {
            save: 0,
            startDate: startDate,
            endDate: endDate
        }
        await CourseDetailsModel.updateMany( { branch:branch, batch:batch, semester:semester, section:section }, { freezeAttendance:freezeAttendance } )

        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getAttendanceReport = async (req,res) => {
    
    try {

        let { batch, branch, semester, section } = req.query

        //Get Course-List in current Semester by students
        let courses = await CourseDetailsModel.find( { branch:branch, batch:batch, semester:semester, section:section }, {freezeAttendance:1, "hodFreeze.attendance":1, courseCode:1} ).populate("courseId", {title:1}).populate("facultyId", { title:1, firstName:1, lastName:1 })

        let startDate, endDate, overallState=3, hodFreeze=true;
        let data = []

        courses = courses.map(course => (course.toObject()))
        for(let course of courses){
            startDate = course.freezeAttendance.startDate
            endDate = course.freezeAttendance.endDate
            hodFreeze = hodFreeze&&course.hodFreeze.attendance
            course.courseName = course.courseId.title
            course.facultyName = course.facultyId.title + " " + course.facultyId.firstName + " " +course.facultyId.lastName
            course.submitState = course.freezeAttendance.save
            if(overallState>course.freezeAttendance.save)
                overallState = course.freezeAttendance.save
            if(course.freezeAttendance.save!=0){
                let data1 = await EnrollmentModel.find({courseId:course._id},{attendancePercentage:1}).populate("studentId",{register:1, firstName:1, lastName:1})

                //Regularize data for Front-End
                data1 = data1.map(student => (student.toObject()))
                for(let student of data1){
                    
                    student.register = student.studentId.register
                    student.name = student.studentId.firstName + " " + student.studentId.lastName
                    student.courseCode = course.courseCode
                    delete student.studentId

                }

                data = data.concat(...data1)

            }

            delete course.courseId
            delete course.facultyId
            delete course.freezeAttendance
            delete course.hodFreeze

        }

        if(startDate!=null && endDate!=null){

            //Check if data submitted to HoD...
            if(overallState==2){

                //Get Submitted Data from studentsModel
                let data2 = await StudentsModel.find({ branch:"IT", batch:batch }, { masterAttendance:1, firstName:1, lastName:1, register:1 })
                data2 = data2.map(item=>item.toObject()).filter(item=>(item.hasOwnProperty("masterAttendance")))
                console.log(data2)

                //Regularize data for front-end
                for(let item of data2){
                    item.name = item.firstName+" "+item.lastName
                    item.courseCode = "Master Attendance"
                    item.attendancePercentage = item.masterAttendance["sem_"+semester]
                    delete item.masterAttendance
                    delete item.firstName
                    delete item.lastName
                }

                //append data
                data = data.concat(...data2)

            } else {

                //Generate data from attendance model
                let data1 = await AttendanceModel.aggregate(
                    [
                        {
                            "$match": {
                                branch: branch,
                                batch: parseInt(batch),
                                date: {
                                    $gte: startDate,
                                    $lte: endDate
                                }
                            },
                        },
                        {
                            "$project": {
                                studentId: 1,
                                courseId: 1,
                                date:1,
                                presented: {
                                    $cond: [{ $eq: ["$present", true] }, 1, 0]
                                },
                                session: {
                                    $cond: [{ $lte: ["$period", 4] }, 1, 0]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    "studentId": "$studentId",
                                    "date":"$date",
                                    "session":"$session"
        
                                },
                                total: { $count: {} },
                                count: { $sum: "$presented" }, 
                            }
                        },
                        {
                            $project:{
                                _id:1,
                                present: {
                                    $cond: [{ $eq: ["$count", "$total"] }, 1, 0]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    "studentId": "$_id.studentId"
        
                                },
                                total: { $count: {} },
                                present: { $sum: "$present" }, 
                            }
                        }
                    ]
                )
                
                await StudentsModel.populate(data1,{ path: "_id.studentId", select: { register: 1, firstName: 1, lastName:1 } })
            
                for(let student of data1) {
                    
                    student.register = student._id.studentId.register,
                    student.name = student._id.studentId.firstName + " " + student._id.studentId.lastName
                    student.studentId = student._id.studentId._id
                    student.courseCode = 'Master Attendance'
                    student.attendancePercentage = student['present']+"/"+student['total']+" "+(student['present']/student['total'] * 100).toFixed(2)+"%"
                    
                    delete student._id
                    delete student.present
                    delete student.total

                }

                //append data...
                data = data.concat(...data1)
                
            }

        }
        
        let result = {
            overallState, hodFreeze, startDate, endDate, courses, data
        }

        result.data.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        result.courses.sort((a, b) => {
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

export const postSaveAttendancePercent = async (req,res) => {

    try {

        let { data, branch, batch, semester } = req.body
        
        let masterRow  = "masterAttendance.sem_"+semester
        for(let student of data) {
            await StudentsModel.updateOne({_id:student.studentId}, {$set:{[masterRow]:student.attendancePercentage}})
        }

        await CourseDetailsModel.updateMany( { branch:branch, batch:batch, semester:semester }, { "freezeAttendance.save":2 } )

        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getReportStatus = async (req,res) => {

    try {

        let { branch, batch, semester } = req.query

        let courses = await CourseDetailsModel.find( { branch:branch, batch:batch, semester:semester }, {freeze:1})
        let flag = true
        for(let course of courses){
            flag = flag && course.freeze.attendance
        }

        let result = { flag }

        // result.data = await EnrollmentModel.find({branch:branch, batch:batch, semester:semester}, {attendancePercentage:1}).populate("studentId", {register:1, firstName:1, lastName:1})
        // result.data = result.data.map(item => item.toObject())

        // for(let item of result.data){
        //     item.register = item.studentId.register
        //     item.name = item.studentId.firstName + " " + item.studentId.lastName
        //     delete item.studentId
        // }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

//Completed...
export const getGenerateAttendanceReport = async (req, res) => {

    try {

        let { start_date, end_date, branch, batch, semester } = req.query
        start_date = new Date(start_date)
        end_date = new Date(end_date)
        batch = parseInt(batch)
        
        //Take report using group-by studentId
        let data = await AttendanceModel.aggregate(
            [
                {
                    "$match": {
                        branch: branch,
                        batch: batch,
                        date: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    },
                },
                {
                    "$project": {
                        studentId: 1,
                        courseId: 1,
                        courseCode:1,
                        batch: 1,
                        presented: {
                            $cond: [{ $eq: ["$present", true] }, 1, 0]
                        },
                    }
                },
                {
                    $group: {
                        _id: {
                            "studentId": "$studentId",
                            "courseId": "$courseId"
                        },
                        total: { $count: {} },
                        present: { $sum: "$presented" },
                        courseCode: {$addToSet: "$courseCode" } 
                    }
                }

            ]
        )

        //Get Master Attendance with group-by date and session and then by studentId find total present
        let data1 = await AttendanceModel.aggregate(
            [
                {
                    "$match": {
                        branch: branch,
                        batch: batch,
                        date: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    },
                },
                {
                    "$project": {
                        studentId: 1,
                        courseId: 1,
                        date:1,
                        presented: {
                            $cond: [{ $eq: ["$present", true] }, 1, 0]
                        },
                        session: {
                            $cond: [{ $lte: ["$period", 4] }, 1, 0]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            "studentId": "$studentId",
                            "date":"$date",
                            "session":"$session"

                        },
                        total: { $count: {} },
                        count: { $sum: "$presented" }, 
                    }
                },
                {
                    $project:{
                        _id:1,
                        present: {
                            $cond: [{ $eq: ["$count", "$total"] }, 1, 0]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            "studentId": "$_id.studentId"

                        },
                        total: { $count: {} },
                        present: { $sum: "$present" }, 
                    }
                }
            ]
        )

        await StudentsModel.populate(data, { path: "_id.studentId", select: { register: 1, firstName: 1, lastName: 1 } })
        await StudentsModel.populate(data1,{ path: "_id.studentId", select: { register: 1, firstName: 1, lastName:1 } })
        
        //Regularize per subject data for front-end
        for (let student of data) {
            student.register = student._id.studentId.register,
            student.studentName = student._id.studentId.firstName + " " + student._id.studentId.lastName
            student.courseCode = student.courseCode[0]
            student.courseId  = student._id.courseId
            student.studentId = student._id.studentId._id
            delete student._id
        }

        for(let student of data1) {
            student.register = student._id.studentId.register,
            student.studentName = student._id.studentId.firstName + " " + student._id.studentId.lastName
            student.studentId = student._id.studentId._id
            student.courseCode = 'Master Attendance'
            delete student._id
        }
        console.log(data)
        console.log(data1)

        let courses = await CourseDetailsModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), semester: parseInt(semester) } },
                { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1 } },
                {
                    $group: {
                        _id: {
                            "courseId": "$courseId"
                        },
                        facultyId: {$addToSet:"$facultyId"},
                        courseCode: {$addToSet: "$courseCode" },
                        semester:{$addToSet:"$semester"} 
                    }
                }

            ]
        )
        await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
        let Courses = []
        for(let course of courses){
            
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
                facultyName: faculties.slice(0,-2)
            }
            Courses.push({...temp})
            
        }

        
        let result ={
            data:[...data,...data1],
            Courses
        }
        
        
        result.data.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
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

export const getSubmittedAttendanceReport = async (req,res) => {

    try{

        let { branch, batch, semester } = req.query

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
            item.attendancePercentage = item.masterAttendance
            delete item.masterAttendance
            delete item.firstName
            delete item.lastName
        }

        //Get Course List of the student Enrolled
        let courses = await CourseDetailsModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), semester: parseInt(semester) } },
                { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1 } },
                {
                    "$group": {
                        _id: {
                            "courseId": "$courseId"
                        },
                        facultyId: {$addToSet:"$facultyId"},
                        courseCode: {$addToSet: "$courseCode" },
                        semester:{$addToSet:"$semester"} 
                    }
                }

            ]
        )
        await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
        let Courses = []
        for(let course of courses){
            
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
                facultyName: faculties.slice(0,-2)
            }
            Courses.push({...temp})
            
        }

        
        let result ={
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

export const postSaveReport = async (req, res) => {

    try{

        let { data, semester } = req.body

        let masterRow  = "masterAttendance.sem_"+semester
        console.log(data)

        for(let item of data){
            if(item['courseCode']=='Master Attendance'){
                console.log("executing...")
                await StudentsModel.updateOne({_id:item.studentId}, {$set:{[masterRow]:item['present']+"/"+item['total']+" "+(item['present']/item['total'] * 100).toFixed(2)+"%"}})
            }else{
                await EnrollmentModel.updateOne({studentId:item.studentId, courseId:item.courseId}, {attendancePercentage:item['present']+"/"+item['total']+" "+(item['present']/item['total'] * 100).toFixed(2)+"%"})
            }
        }

        console.log(await EnrollmentModel.find({}))

        console.log(await StudentsModel.find({}))
        
        res.status(200).json(await StudentsModel.find({}))

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }
}


/////////////////////// HALLTICKET MODULE ///////////////////////

export const getClassCourses = async (req, res) => {

    try{

        let { branch, batch, section, semester } = req.query

        let courses = await CourseDetailsModel.aggregate(
            [
                { "$match": { branch: branch, batch: parseInt(batch), section: section, semester: parseInt(semester), 'hodFreeze.attendance': true } },
                { "$project": { facultyId:1, courseId:1, courseCode:1, semester:1 } },
                {
                    $group: {
                        _id: {
                            "courseId": "$courseId"
                        },
                        courseCode: {$addToSet: "$courseCode" },
                    }
                }

            ]
        )
        
        await CurriculumModel.populate(courses, { path: "_id.courseId", select: { title:1 } })
        for(let course of courses){
            
            course.curriculumId = course._id.courseId._id,
            course.courseCode = course.courseCode[0],
            course.courseName = course._id.courseId.title,
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

        res.status(200).json(courses)
        
    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getFinalAttendanceReport = async (req,res) => {

    try {

        let { curriculumId, semester, section, branch, batch } = req.query

        let data = await EnrollmentModel.find({courseCode: curriculumId, semeseter:semester, section:section, branch:branch, batch:batch }, {condonation:1, attendancePercentage:1, examEligibility:1}).populate("studentId", {register:1, firstName:1, lastName:1}).populate("courseId", { attendanceApproval:1 } )
        
        data = data.map(item => item.toObject())
        for(let student of data){
            student.register = student.studentId.register
            student.name = student.studentId.firstName+" "+student.studentId.lastName
            student.Attendance = student.attendancePercentage
            student.Condonation = student.condonation.status
            student.ExamEligibility = student.examEligibility
            delete student.examEligibility
            delete student.attendancePercentage
            delete student.condonation
            delete student.studentId
            student.submitted = student.courseId.attendanceApproval.ci
            delete student.courseId
            if(!student.submitted){
                student.attendancePercentage = "---"
                student.condonation = "---"
                student.examEligibility = "---"
            }
        }

        let faculties = await CourseDetailsModel.find( { courseId:curriculumId }, {"attendanceApproval":1} ).populate("facultyId", {title:1, firstName:1, lastName:1})
        
        faculties = faculties.map(faculty => (faculty.toObject()))
        for(let faculty of faculties){
            faculty.name = faculty.facultyId.title+" "+faculty.facultyId.firstName+" "+faculty.facultyId.lastName
            faculty.submitted = faculty.attendanceApproval.ci
            faculty.approved = faculty.attendanceApproval.fa
            delete faculty.attendanceApproval
            delete faculty.facultyId
        }

        let facultyName = new Set(faculties.map(faculty => faculty.name))
        
        let Faculties = []
        for(let name of facultyName){
            let temp = faculties.filter(faculty => faculty.name == name)
            let submitted = true
            let approved = true
            for(let j of temp) {
                submitted = submitted && j.submitted
                approved = approved && j.approved
            }
            let faculty = { name, submitted, approved }
            Faculties.push({...faculty})
        }

        let result = {
            data, Faculties
        }

        result.data.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getSubmitReport = async (req,res) => {

    try {

        let { curriculumId, semester, branch, batch, section } = req.query

        // await CourseDetailsModel.updateMany( { courseCode:curriculumId, branch:branch, batch:batch, section:section, semester:semester }, { "attendanceApproval.fa":false})
        await CourseDetailsModel.updateMany( { courseId:curriculumId, branch:branch, batch:parseInt(batch), section:section, semester:parseInt(semester) }, { "attendanceApproval.fa":true})
        
        res.status(200).send("Update Success")

    } catch (err) { res.status(200).send("Request Failed: " + err.message); }

}

/////////////////////// ENROLLMENT MODULE ///////////////////////

// fetch data to feed the enrollment page 
export const CE_FA_getenrolledstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},approval:{$in:[-4,-3,-2,-1,0,1,2,3,4,-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
        // console.log(data)

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


export const CE_FA_approvestudents = async(req, res) => {
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
                        courseCode: course.courseCode
                    }
                    unenrolled.push(objs)
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval>1 && enrollmentdata.approval<=14){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval <-1 && enrollmentdata.approval>-11){
                    success = false
                   
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="rejected"
                    
                    invalid.push(obj)
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                enrollmentdata.approval = student.approval
                enrollmentdata.courseType = enrollmentdata.courseType ? enrollmentdata.courseType : courseinfo.type
                enrollmentdata.courseCategory = enrollmentdata.courseCategory ? enrollmentdata.courseCategory : courseinfo.category
                
                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes to database"
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


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

export const CR_FA_getRegisteredstudentslist = async(req, res) => {
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

export const CR_FA_approvestudents = async(req, res) => {
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
                if(enrollmentdata.approval>11){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval <-11 && enrollmentdata.approval >-15){
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


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ///////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query, toId = null, staff = null
        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = profile[0]

        //checking whether the ci is also a hod
        if(profile.hod==true){
            staff = await FacultyModel.find({ admin: true }, { _id: 1 })
            toId = staff[0]._id
        }
        else{
            staff = await FacultyModel.find({ branch: profile.branch, hod: true }, { _id: 1 })
            toId = staff[0]._id
        }

        res.status(200).json({...profile.toObject(), toId: toId })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}


/////////////////////// REQUEST MODULE ///////////////////////
export const profileRequest = async (req, res) => {

    try {

        let data = req.body
        console.log(data);
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

export const updateStudentProfile = async (req, res) => {

    try {

        let data = req.body
        data.body = JSON.parse(data.body)

        if (data.approved) {

            await StudentsModel.updateOne({ _id: data.from }, {...data.body.new, requestId: ""})
            await StudentDetailsModel.updateOne({ studentId: data.from }, {...data.body.new})

            if(data.body.new.email)
                await UsersModel.updateOne({userId: data.from}, {email: data.body.new.email})

        }else await StudentsModel.updateOne({_id: data.from}, {requestId: ""})

        res.status(200).send("Request updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

export const getRequests = async (req, res) => {

    try {

        let { facultyId } = req.query

        let data = await RequestsModel.find({ to: facultyId, cancel: false }, { __v: 0, createdAt: 0, updatedAt: 0 }).sort({createdAt: 'desc'})

        res.status(200).json(data)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}