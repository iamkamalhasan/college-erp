import mongoose, { Mongoose, mongo } from "mongoose"

import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { AttendanceModel } from "../models/AttendanceModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { StudentsModel } from "../models/StudentsModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { RequestsModel } from "../models/RequestsModel.js";
import { CalendarModel } from "../models/CalendarModel.js";
import { InternalsModel } from "../models/InternalsModel.js";
import XLSX from "xlsx"
import { excelToJson } from "../utilities/excel-parser.js";
///////////////////////  ADMIN MODULE ///////////////////////


///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////


export const demo = async (req,res) => {
    try{
        let result = await MasterTimetableModel.deleteMany({date:'2023-02-02T00:00:00.000Z', period:3})
        res.status(200).send(result)
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}


//Completed...
export const getMasterAttendance = async (req, res) => {

    try {

        let { facultyId } = req.query;

        //Get Current Batch Start and End Date
        let sem_dates = await SemesterMetadataModel.find({}, { batch: 1, sem: 1, begin:1, end:1 }).sort({ date: -1 }).limit(4);

        //Overall Start and End Date Calculation
        let start_date = new Date();
        let end_date = new Date('01-01-2070');
        sem_dates = sem_dates.map(item => item.toObject())
        
        for (let i of sem_dates) {
            
            if (start_date > i.begin) {
                start_date = i.begin
            }
            
            if (end_date > i.end) {
                end_date = i.end
            }
        
        }

        let today = new Date();
        if (end_date > today) {
            end_date = today
        }

        console.log(start_date, end_date)
        //Get Periods from MasterTimetable
        let result = await MasterTimetableModel.find({ facultyId: facultyId, date: { $gte: start_date, $lte: end_date } }, { date: 1, courseId: 1, period:1, freeze:1 }).populate("courseId", { courseId: 1, courseCode: 1, batch:1, section:1, branch:1, semester:1, "hodFreeze.attendance":1, freezeAttendance:1 })
        await CurriculumModel.populate(result, { path: "courseId.courseId", select: { courseCode: 1, title: 1 } })
        console.log(result)
        //Regularize data for front-end
        result = result.map(period => (period.toObject()));
        for (let period of result) {
            period.courseCode = period.courseId.courseCode;
            period.courseName = period.courseId.courseId.title;
            period.batch = period.courseId.batch;
            period.section = period.courseId.section;
            period.branch = period.courseId.branch;
            period.semester = period.courseId.semester;
            period.hodFreeze = period.courseId.hodFreeze.attendance
            period.reportFreeze = ((period.courseId.freezeAttendance.save!=0)&&(period.date>=period.courseId.freezeAttendance.startDate||period.date<=period.courseId.freezeAttendance.endDate)?true:false)
            period.courseId = period.courseId._id;
        }

        res.status(200).send(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const getAttendance = async (req, res) => {

    try {

        let { _id, courseId } = req.query

        //Fetch Attendance from if already done
        let result = await AttendanceModel.find({ masterTimetableId: _id }, { studentId:1, masterTimetableId:1, present: 1, onduty: 1 }).populate({path:"studentId", select:{ register: 1, firstName: 1, lastName: 1 } })

        //If no Data, fetch from enrollment 
        if (result.length == 0) {

            result = await EnrollmentModel.find({ courseId: courseId }, { _id: 0, studentId: 1 }).populate({path:"studentId", select:{ register: 1, firstName: 1, lastName: 1 } })
            
            //Regularize Data for front-end
            result = result.map(student => (student.toObject()));
            for (let student of result) {
                student.masterTimetableId = _id;
                student.name = student.studentId.firstName + " " + student.studentId.lastName;
                student.register = student.studentId.register
                student.studentId = student.studentId._id
                student.present = true
                student.onduty = false
            }

        } else {

            //Regularize data for front-end
            result = result.map(student => (student.toObject()));
            for (let student of result) {
                student.name = student.studentId.firstName + " " + student.studentId.lastName;
                student.register = student.studentId.register
                student.studentId = student.studentId._id
            }

        }

        result.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        res.status(200).json(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


export const dropPeriod = async (req,res) => {

    try{

        let { _id } = req.query

        await AttendanceModel.deleteMany({masterTimetableId:_id})

        await MasterTimetableModel.deleteMany({_id:_id})

        res.status(200).send("Delete Successful")

    } catch(err) { res.status(400).send("Request Failed: " + err.message); }

}

//Completed
export const postAttendance = async (req, res) => {

    try {

        let data = req.body;
        let attendance = []

        //Get Period Data...
        let period = await MasterTimetableModel.find({ _id: data[0].masterTimetableId }).populate("courseId", { courseCode: 1 })
        period = period.map(item=>item.toObject())

        //Iterate over each Student
        for (let student of data) {

            //Check if Id is there...
            if (student.hasOwnProperty("_id"))
                await AttendanceModel.updateOne({ _id: student._id }, { present: student.present, onduty: student.onduty })
            else {

                //Create a new Entry in AttendanceModel
                let temp = {
                    studentId: student.studentId,
                    masterTimetableId: period[0]._id,
                    courseId: period[0].courseId._id,
                    courseCode: period[0].courseId.courseCode,
                    branch: period[0].branch,
                    batch: period[0].batch,
                    section: period[0].section,
                    date: period[0].date,
                    period: period[0].period,
                    present: student.present,
                    onduty: student.onduty
                }

                attendance.push({ ...temp })

            }

        }

        //Create Entries if needed..
        if (attendance.length != 0) {
            await AttendanceModel.insertMany(attendance)
        }

        //Change boolean to attendance marked...
        await MasterTimetableModel.updateOne({ _id: data[0].masterTimetableId }, { marked: 1 })
        res.status(200).send("Updated Successfully")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const getCourses = async (req, res) => {

    try {

        let { facultyId } = req.query
        let result = {}

        //Get Current Batch Start and End Date
        let sems = await SemesterMetadataModel.find({}, { batch: 1, sem: 1, begin:1, end:1 }).sort({ date: -1 }).limit(4);
        sems = sems.map(item => item.toObject())

        console.log(sems)
        //Overall Start and End Date Calculation
        let start_date = new Date();
        let end_date = new Date('01-01-2070');

        for (let i of sems) {
            if (start_date > i.begin) {
                start_date = i.begin
            }
            if (end_date > i.end) {
                end_date = i.end
            }
        }

        let today = new Date();
        if (end_date > today) {
            end_date = today
        }

        result.start_date = start_date;
        result.end_date = end_date;
        result.courses = []

        //Get Courses Handled this semester
        for(let sem of sems) {
            let temp = await CourseDetailsModel.find({ facultyId: facultyId, semester: sem.sem, batch: sem.batch }, { semester: 1, courseCode: 1, batch: 1, branch: 1, groupNo:1, section:'A', freezeAttendance:1, "hodFreeze.attendance":1 }).populate("courseId", { _id: 0, title: 1 })
            temp = temp.map(course => (course.toObject()))
            result.courses = result.courses.concat([...temp])
        }
        console.log(result)

        //Regularize Data for front-end
        for (let course of result.courses) {

            course.startDate = course.freezeAttendance.startDate
            course.endDate = course.freezeAttendance.endDate
            course.freezeAttendance = (course.freezeAttendance.save != 0)||(course.hodFreeze.attendance) 
            console.log(course.freezeAttendance, course.hodFreeze.attendance, course.freezeAttendance)
            course.courseName = course.courseId.title
            if(course.courseName.split(" ").slice(-1)[0]=="Laboratory"||course.courseName=="Project Work"||course.courseName=="Mini Project") {
                course.courseName = course.courseId.title + " Batch-" + course.groupNo
            }

            delete course.hodFreeze
            delete course.courseId
            delete course.groupNo

        }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const getSubmittedAttendance = async (req, res) => {

    try {

        let { courseId } = req.query

        //Get Stored Attendance Percent
        let data = await EnrollmentModel.find( { courseId:courseId }, {attendancePercentage:1} ).populate("studentId", {register:1, firstName:1, lastName:1})

        //Regularize Data for Front-end
        data = data.map(student => (student.toObject()))
        for(let student of data) {
            
            student.register = student.studentId.register
            student.name = student.studentId.firstName + " " + student.studentId.lastName
            let attdArr = student.attendancePercentage.split(/[\s\/]+/)
            student.present = attdArr[0]
            student.total = attdArr[1]
            student.percent = attdArr[2]

            delete student.studentId
            delete student.attendancePercentage

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

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

//Completed...
export const getAttendancePercent = async (req, res) => {

    try {

        let { courseId, start_date, end_date } = req.query

        start_date = new Date(start_date)
        end_date = new Date(end_date)

        //Take report using group-by studentId
        let data = await AttendanceModel.aggregate(
            [
                {
                    $match: {
                        $expr: {
                            $eq: ['$courseId', { $toObjectId: courseId }]
                        },
                        date: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    }
                },
                {
                    "$project": {
                        studentId: 1,
                        presented: {
                            $cond: [{ $eq: ["$present", true] }, 1, 0]
                        },
                    }
                },
                {
                    $group: {
                        _id: "$studentId",
                        total: { $count: {} },
                        present: { $sum: "$presented" }
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                }
            ]
        )

        //Get Student Details...
        await StudentsModel.populate(data, { path: "_id", select: { register: 1, firstName: 1, lastName: 1 } })

        //Regularize data for front-end
        for (let student of data) {

            student.register = student._id.register
            student.name = student._id.firstName + " " +student._id.lastName
            student.Total = student.total
            student.Present = student.present
            student.percent = (student.present/student.total * 100).toFixed(2)+"%"
            student._id = student._id._id
            
            delete student.total
            delete student.present
            
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}

export const postSaveAttendance = async (req,res) => {

    try {

        let { courseId, data } = req.body

        let attd = "0/0 100.00%"
        for(let student of data) {
            attd = student['Present']+"/"+student['Total']+" "+student['percent']
            await EnrollmentModel.updateOne( { studentId:student._id, courseId:courseId }, { attendancePercentage:attd } )
        }

        await CourseDetailsModel.updateOne( { _id:courseId }, {"freezeAttendance.save":1} )

        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed...
export const getStaffTimetable = async (req, res) => {

    try {

        let { facultyId } = req.query

        //Get All Periods...
        let data = await MasterTimetableModel.find({facultyId:facultyId}, {date:1, period:1}).sort({date:1,period:1}).populate("courseId", {courseId:1, courseCode:1})
        await CourseDetailsModel.populate(data, {path:"courseId.courseId", select:{title:1}})

        //Regularize data for front-end
        data = data.map(student => (student.toObject()));
        for (let period of data) {
            period.courseCode = period.courseId.courseCode
            period.courseName = period.courseId.courseId.title
            delete period.courseId
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}

export const getClasses = async (req,res) => {

    try{

        let { facultyId } = req.query
        let sems = await SemesterMetadataModel.find({}, { _id: 0, sem: 1, batch: 1 }).sort({ date: -1 }).limit(4)
        let data = []
        let temp = new Set()
        for(let i of sems){
            temp = new Set()
            let result = await CourseDetailsModel.find({facultyId:facultyId, semester:i.sem, batch:i.batch}, {branch:1})
            result = result.map(item => item.toObject())
            for(let j of result){
                temp.add(j.branch)
            }
            let row = {
                semester:i.sem,
                batch:i.batch,
                branch:""
            }
            for(let j of temp){
                row.branch = j
                data.push({...row})
            }
        }
        
        res.status(200).json(data)

    } catch(err) { res.status(400).send("Request Failed: " + err.message); }

}

//Completed...
export const getStudentTimetable = async (req, res) => {

    try {

        let { branch, batch, sem, section } = req.query
        
        //Get All Periods of All Classes...
        let data = await MasterTimetableModel.find({ branch: branch, semester:sem, section:section, batch:batch }, { batch: 1, branch: 1, semester: 1, date: 1, period: 1 }).populate("courseId", { courseId: 1, courseCode: 1 }).populate("facultyId", { title:1, firstName:1, lastName:1 } ).sort({date:1,period:1})
        await CurriculumModel.populate(data, { path: "courseId.courseId", select: { title: 1 } })

        //Regularize data for front-end
        data = data.map(student => (student.toObject()));
        for (let period of data) {
            console.log(period)
            period.courseCode = period.courseId.courseCode
            period.courseName = period.courseId.courseId.title
            period.courseId = period.courseId._id
            period.facultyName = period.facultyId.title + " " + period.facultyId.firstName + " " + period.facultyId.lastName
            period.facultyId = period.facultyId._id
            delete period.branch
            delete period.batch
        }



        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}

//
export const postExtraPeriod = async (req,res) => {

    try{

        let data = req.body

        let data1 = await MasterTimetableModel.find({branch:data.branch, batch:data.batch, date:data.date, period:data.period})
        data1 = data1.map(item => item.toObject())

        console.log(data1)
        if(data1.length==0){
            console.log(await CalendarModel.find({}))
            let dayOrder = await CalendarModel.find({date:data.date},{_id:0,order:1})
            dayOrder = dayOrder.map(item => item.toObject())
            console.log(dayOrder)
            let freezeDayCount = await SemesterMetadataModel.find({batch:data.batch}, {_id:0,freeze:1}).sort({date:-1}).limit(1);
            freezeDayCount = freezeDayCount.map(item => item.toObject())
            console.log(freezeDayCount)
            let period = {
                date:data.date,
                branch:data.branch,
                batch:data.batch,
                section:data.section,
                dayOrder:dayOrder[0].order,
                workingDay:true,
                courseId:data.courseId,
                facultyId:data.facultyId,
                period:data.period,
                type:"Extra",
                freeze:new Date(data.date).setDate(new Date(data.date).getDate()+freezeDayCount[0].freeze.attendance)
            }
            console.log(period)
            await MasterTimetableModel.insertMany([{...period}])
        
            res.status(200).send("Period Creation Success")
        
        } else {
            res.status(400).send("Already Period Exist")
        }
        
        
    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}

/////////////////////// HALLTICKET MODULE ///////////////////////

export const getCoursesHandled = async (req,res) => {

    try {

        let { facultyId } = req.query
        
        //Get Current Batch and Semester
        let sems = await SemesterMetadataModel.find({}, { batch: 1, sem: 1 }).sort({ date: -1 }).limit(4);
        
        let result = [];

        for (let item of sems){
            let temp = await CourseDetailsModel.find( { batch:parseInt(item.batch), semester:parseInt(item.sem), facultyId:facultyId }, {courseCode:1, groupNo:1, "hodFreeze.attendance":1, attendanceApproval:1, branch:1, section:1 }).populate("courseId",{title:1,_id:0})
            temp = temp.map(i => i.toObject())
            for(let i of temp){
                i.batch = item.batch
                i.semester = item.sem
                i.hodFreeze = i.hodFreeze.attendance
                i.courseName = i.courseId.title
                console.log()
                if(i.courseName.split(" ").slice(-1)[0]=="Laboratory"||i.courseName=="Project Work"||i.courseName=="Mini Project") {
                    i.courseName = i.courseId.title + " Batch-" + i.groupNo
                }
                delete i.courseId
                delete i.groupNo

            }
            
            result = result.concat(temp)
            //console.log(result)
        }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }
}

export const getCondonationApplication = async (req,res) => {

    try {

        let { courseId } = req.query
        
        let result = await EnrollmentModel.find( { courseId:courseId }, {attendancePercentage:1, condonation:1, examEligibility:1 }).populate("studentId", {register:1, firstName:1, lastName:1})
        result = result.map(student =>student.toObject())

        for(let student of result){
            
            student.register = student.studentId.register
            student.name = student.studentId.firstName + " " + student.studentId.lastName
            student.attendance = student.attendancePercentage
            student.ExamEligibility = student.examEligibility
            student.condonationStatus = student.condonation.status
            delete student.examEligibility
            delete student.condonation
            delete student.attendancePercentage
            delete student.studentId

        }

        result.sort((a, b) => {
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

export const postSaveCondonationApplication = async (req,res) => {

    try {

        let { data } = req.body

        for(let student of data){
            await EnrollmentModel.updateMany( { _id:student._id }, { "condonation.status":student.condonationStatus } )
        }

        res.status(200).send("Update Success")

    } catch (err) { res.status(200).send("Request Failed: " + err.message); }

}

export const postSubmitCondonationApplication = async (req,res) => {

    try {

        let { courseId, data } = req.body

        for(let student of data){
            await EnrollmentModel.updateMany( { _id:student._id }, { "condonation.status":student.condonationStatus } )
        }
    
        await CourseDetailsModel.updateOne( { _id:courseId }, { "attendanceApproval.ci": true } )

        res.status(200).send("Update Success")

    } catch (err) { res.status(200).send("Request Failed: " + err.message); }
    
}

/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////
export const getCO = async (req, res) => {

    try {

        let { courseId } = req.query

        let data = await InternalsModel.find({courseId: courseId}, {co: 1, category: 1, number: 1 }).populate("studentId", {_id: 0, register: 1, firstName:1, lastName: 1}).lean()
        
        let report = {}
        data.map((doc)=>{
            let register = doc.studentId.register
            let category = doc.category.replaceAll(" ","")
            category = category.toLowerCase()
            if(!report[register]) report[register] = {}
            if(!report[register][category]) report[register][category] = {}
            report[register][category][doc.number] = doc.co
            report[register]["name"] = doc.studentId.firstName+" "+doc.studentId.lastName
            Object.keys(doc.co).map((number)=>{
                if(!report[register][`CO${number}`]){
                     report[register][`CO${number}`] = {}
                     report[register][`CO${number}`]["allotted"] = 0
                     report[register][`CO${number}`]["obtained"] = 0
                    }
                report[register][`CO${number}`]["allotted"] += doc.co[number].allotted
                report[register][`CO${number}`]["obtained"] += doc.co[number].obtained
            })
        })
        res.status(200).json(report)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getFacultyCourses = async (req, res) => {

    try {

        let {facultyId} = req.query
        let courses = await CourseDetailsModel.find({facultyId: facultyId}, {batch:1, semester: 1, courseCode: 1}).populate("courseId", {title: 1}).lean()

        // cutomising
        let response = {}
        courses.map((course)=>{
            if(!response[course.batch]) response[course.batch] = {}
            if(!response[course.batch][course.semester]) response[course.batch][course.semester] = {}
            if(!response[course.batch][course.semester][course.courseCode]) response[course.batch][course.semester][course.courseCode]={}
            response[course.batch][course.semester][course.courseCode]["title"] = course.courseId.title
            response[course.batch][course.semester][course.courseCode]["_id"] = course._id
        })

        res.status(200).json(response)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

/////////////////////// INTERNALS MODULE ///////////////////////


export const createInternal = async (req, res) => {
 
    try {

        let { courseId, category, number, questions } = req.body
        let internals = await EnrollmentModel.find({courseId: courseId}, {studentId: 1, branch: 1, semester: 1, batch: 1, courseType: 1}).populate("studentId", {register:1, firstName:1, lastName: 1}).lean()
        internals = internals.map((internal)=>{
            let enrollmentId = internal._id
            delete internal._id
            internal.number = number
            internal.type = internal.courseType
            internal.questions = questions.map((question)=>{
                let q = {}
                q.co = Number.parseInt(question.co.slice(-1))
                q.number = Number.parseInt(question.number)
                q.allotted = Number.parseInt(question.allotted)
                return q
            })
            internal = { enrollmentId: enrollmentId, courseId: courseId, ...internal, category: category, number: number }
            return internal
        })
        
        let check = await InternalsModel.find({courseId: courseId, category: category, number: number}).limit(1)
        if(check.length>0)
            internals.map( async (internal)=>{
                await InternalsModel.updateOne({category: category, number: number, enrollmentId: internal.enrollmentId}, internal, {upsert: true})
            })
        else {await InternalsModel.create(internals)}

    let students = internals.map((internal)=> ({ register: internal.studentId.register, name: internal.studentId.firstName+" "+internal.studentId.lastName }))

    const questionNo = questions.map(q =>{
        return `Q${q.number}`;
    })
    const co = questions.map(q =>{
        return `${q.co}`;
    })
    let total =0
    const mark =questions.map(q =>{
        total+=Number.parseInt(q.allotted)
        return `${q.allotted}M`;
    })
    let headerrows = questions.map(q => {
        return `Q${q.number}-${q.allotted}M-${q.co}`
    });

    const firstRow = ["ROLLNO","NAME",...questionNo,"TOTAL"];
    const secondRow = ["$","$",...co,"$"];
    const thirdRow = ["$","$",...mark, total+"M"];
    
    const aoaData = [firstRow,secondRow,thirdRow];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws,aoaData);
    XLSX.utils.sheet_add_json(ws,students,{origin:'A4',skipHeader : true});
    XLSX.utils.book_append_sheet(wb,ws,"Marks");

    const buffer = XLSX.write(wb,{bookType : 'xlsx', type:'buffer'});
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const uploadInternal = async (req, res) => {

    try {

        let {courseId, type, number} = req.body
        let data = await excelToJson(req.files.data)  
        let internals = await InternalsModel.find({courseId: courseId, category: type, number: number}).populate("studentId", {register: 1}).lean()
        delete data[0]
        delete data[1]
        console.log(data, internals);
        data.map( async (doc)=>{
            let internal = internals.find((id)=>doc.ROLLNO==id.studentId.register)
            internal.questions = internal.questions.map((question)=>{
                question.obtained = Number.parseInt(doc[`Q${question.number}`])
                return question
            })
            await InternalsModel.updateOne({_id: internal._id}, internal)
        })

        res.status(200).send("Uploaded successfully!")
    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getInternal = async (req, res) => {

    try {
        let {courseId} = req.query
        let internals = await InternalsModel.find({courseId: courseId}).populate("studentId", {register: 1, firstName: 1, lastName: 1, _id: 0}).lean()
        let meta = {}
        internals = internals.map((internal)=>{
            let category = internal.category.toLowerCase()
            category = category.replaceAll(" ", "")
            if(!meta[category]) meta[category] = []
            let set = new Set(meta[internal.number])
            set.add(internal.number)
            meta[category] = [...set]
            let register = internal.studentId.register
            let name = internal.studentId.firstName+" "+internal.studentId.lastName
            delete internal.studentId
            return { register: register, name: name, ...internal }
        })

        res.status(200).json({meta: meta, internals: internals})

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

//fetching from courseDetails -> Enrollement 
export const getHandlingCourses = async(req,res) => {
    let { facultyId } = req.query;
    const data = await CourseDetailsModel.find({facultyId : facultyId, type:"theory"}).populate("courseId");
    console.log(data);
    const courses = data.map( d => {
        const course = {
            _id: d._id,
            semType: d.semType,
            semester: d.semester,
            facultyId: d.facultyId,
            courseCode: d.courseId.courseCode,
            title: d.courseId.title,
            type: d.courseId.type,
            requirement: d.courseId.requirement,
            category: d.courseId.category,
            semester: d.courseId.semester,
            regulation: d.courseId.regulation,
            branch: d.courseId.branch,
            batch: d.batch
        }
        return course;
    })
    res.status(200).json(courses);
}

export const getEnrolledStudents = async(req,res) => {
    const { courseId } = req.query; 
    const data = await EnrollmentModel.find({courseId : courseId }).populate("studentId"    );
    console.log("In get students");
    const students = data.map( d => {
        const student = {
            enrollmentId : d._id,
            studentId : d.studentId._id,
            rollNo : d.studentId.register,
            name : `${d.studentId.firstName} ${d.studentId.lastName}`,
        }
        return student;
    })

    res.status(200).json(students); 
}
 


export const generateExcelTemplate = async(req,res) =>{
    const {courseId, questions} = req.body;
    let students = await EnrollmentModel.find({courseId : courseId }).populate("studentId");
    students = students.map(s => {
        const rollNo = s.studentId.register;
        const name = s.studentId.firstName + " " + s.studentId.lastName;
        const student = {rollNo,name};
        return student;
    })
    console.log(students);
    console.log(questions);

    // { qNo: '3', COType: 'CO2', Mark: '2' },
    // { qNo: '4', COType: 'CO3', Mark: '2' }
    const questionNo = questions.map(q =>{
        return `Q${q.number}`;
    })
    const coNo = questions.map(q =>{
        return `${q.co}`;
    })
    let totalMark = 0;
    const mark =questions.map(q =>{
        totalMark+=Number.parseInt(q.allotted);
        return `${q.allotted}M`;
    })
    let headerrows = questions.map(q => {
        return `Q${q.qNo}-${q.Mark}M-${q.COType}`
    });

    const firstRow = ["ROLLNO","NAME",...questionNo,"TOTAL"];
    const secondRow = ["$","$",...coNo,"$"];
    const thirdRow = ["$","$",...mark,`${totalMark}M`];
    
    const aoaData = [firstRow,secondRow,thirdRow];
    // const aoaData = [["ROLL NO","NAME",...headerrows,"TOTAL"]];
    console.log(aoaData);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws,aoaData);
    XLSX.utils.sheet_add_json(ws,students,{origin:'A4',skipHeader : true});
    XLSX.utils.book_append_sheet(wb,ws,"Marks");

    const buffer = XLSX.write(wb,{bookType : 'xlsx', type:'buffer'});
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

}


//Handling excel upload
export const handleUpload = async (req,res) =>{
    let data = XLSX.read(req.files.data.data,{type:"buffer"});
    console.log(data.SheetNames);
    let type = req.body.type;
    let number = req.body.number;
    console.log(req.body);
    console.log(`${type} - ${number}`);
    data.SheetNames.forEach(sheetName => {
    let rowObject = XLSX.utils.sheet_to_json(data.Sheets[sheetName]);
    console.log(rowObject);
        var questions = [];
        var COtypeHeader = rowObject[0];
        var COMarkHeader = rowObject[1];
        console.log(COtypeHeader[`Q${1}`]);
        for(let i=1;i<=Object.keys(rowObject[0]).length-3;i++){
            let q = {
                number : i,
                co : Number.parseInt(String(COtypeHeader[`Q${i}`]).slice(2)),
                total : Number.parseInt(String(COMarkHeader[`Q${i}`])) ,
                obtained : 0,
            }
            questions.push(q);
            
        }
        console.log(questions);
      
      });

    res.status(200);
} 



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ///////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query, toId = null, staff = null
        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = profile[0]

        //checking whether the ci is also a hod
        if (profile.hod == true) {
            staff = await FacultyModel.find({ admin: true }, { _id: 1 })
            toId = staff[0]._id
        }
        else {
            staff = await FacultyModel.find({ branch: profile.branch, hod: true }, { _id: 1 })
            toId = staff[0]._id
        }

        res.status(200).json({ ...profile.toObject(), toId: toId })

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


export const unfreezeRequest = async (req, res) => {
    /*
        ##########  req.body should be like this ##########
        req.body = {
                from:               // Faculty _id who made request
                fromRef:            // 'Faculty'
                type:               // Period Unfreeze Request 
                body: { 
                    _id:            // _id of period in MasterTimeTable
                    branch:         // Branch 
                    }     
            }
        }
    */
    try {       
     
        let request = req.body 
        request._id = mongoose.Types.ObjectId()
        let body = JSON.parse(request.body)
        // Updating the MasterTimeTable with the requestId to prevent the continuos request
        await MasterTimetableModel.updateOne({_id: body._id}, {requestId: request._id})

        let hodId = await FacultyModel.find({hod: true, branch: body.branch}, {_id: 1}).lean()

        // Updating the request with the toId
        request.to = hodId[0]._id

        // Creating the request
        await RequestsModel.create(request)

        res.status(200).send("Requested Successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const cancelProfileRequest = async (req, res) => {

    try {

        let {requestId} = req.body
        
        await FacultyModel.updateOne({requestId: requestId}, {requestId: ""})
        await RequestsModel.updateOne({_id: requestId}, {cancel: true})

        res.status(200).send("Profile request cancelled successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const cancelUnfreezeRequest = async (req, res) => {

    try {

        let {unfreezeId} = req.body
        await MasterTimetableModel.find({unfreezeId: unfreezeId}, {unfreezeId: ""})

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const swapRequest = async (req, res) => {

    try {
        /*
            ##########  req.body should be like this ##########
            req.body = {
                _id:                    // _id of the period in MasterTimeTable
                request: {              // This obj will the actual request for swapping

                    from:               // Faculty _id who made request
                    fromRef:            // 'Faculty'
                    to:                 // Faculty _id who accept/decline the request
                    type:               // Period Unfreeze Request 
                    body: [             // Contains the one of two JSON object
                        {
                            _id:        // _id of swapping period in MasterTimeTable 
                            courseId:   
                            facultyId:
                        }
                    ],
                    deadline:           // deadline only in hours
                }
                       
                }
            }
        */

        let data = req.body
        data.request._id = mongoose.Types.ObjectId()
        
        await MasterTimetableModel.updateOne( {_id: data._id}, { swapId: data.request._id} )
        await RequestsModel.create(data.request);

        res.status(200).send("Requested Successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const cancelSwapRequest = async (req, res) => {

    try {

        let data = req.body
        let _id = data._id
        await MasterTimetableModel.updateOne({swapId: _id}, {swapId: ""})
        await RequestsModel.updateOne({_id: _id}, data)

        res.status(200).send("Requeste Cancelled Successfully!")
    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const updateSwapRequest = async (req, res) => {

    try {

        let data = req.body

        data.body = JSON.parse(data.body)
        
        data.body.forEach(async doc => {
            let _id = doc._id
            delete doc._id
            let update =  data.approved ? {...doc, swapId: ""} : {swapId: ""}
            await MasterTimetableModel.updateOne( {_id: _id}, update)
        } )

        res.status(200).send("Request updated successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}