///////////////////////  ADMIN MODULE ///////////////////////

import mongoose from "mongoose"
import XLSX from "xlsx"

import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { CourseDetailsModel } from "../models/CourseDetailsModel.js"
import { MasterTimetableModel } from "../models/MasterTimetableModel.js"
import { BranchModel } from "../models/BranchModel.js"
import { CurriculumModel } from "../models/CurriculumModel.js"
import { EnrollmentModel } from "../models/EnrollmentModel.js"
import { StudentsModel } from "../models/StudentsModel.js"
import { CalendarModel } from "../models/CalendarModel.js"
import { AttendanceModel } from "../models/AttendanceModel.js"
import { RequestsModel } from "../models/RequestsModel.js"

///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////

export const getDemo = async (req,res) =>{
    try{
        await EnrollmentModel.updateMany({},{section:"A"})
        await CourseDetailsModel.updateMany({},{section:"A"})
        await MasterTimetableModel.updateMany({},{section:"A"})
        await AttendanceModel.updateMany({},{section:"A"})
        res.status(200).send("Success");
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const dataload = async (req,res) => {
    
    try{

        // await EnrollmentModel.deleteMany({})
        // await CourseDetailsModel.deleteMany({})

        const excel = XLSX.readFile("C:/Users/THIYANESH S/Downloads/IT_Enrollment.xlsx")

        const source = excel.Sheets[excel.SheetNames[0]]
    
        const data = XLSX.utils.sheet_to_json(source)
        
        await EnrollmentModel.insertMany(data)
        
        res.status(200).json(await EnrollmentModel.find({}))
    
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }
}


//Completed
export const getStaff = async (req,res) => {

    try {

        let result = {}
        let { branch, isFirstYear, section } = req.query
        let sems = []
        //Get Current Batch and Semester...
        if(isFirstYear=="true"){
            sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({batch:-1, sem:-1}).limit(1)
            console.log(sems+"hiii");
        }else{
            sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(4)
            sems = sems.filter(item => (item.sem != 1 && item.sem != 2))
        }

        result.sems = sems
        result.courses = []

        //Iterate for each batch...
        for(let sem of sems) {

            //Check Course Details for Row creation...
            let courses = await CourseDetailsModel.find({branch:branch, semester:sem.sem,batch:sem.batch, type:"theory", section:{$in:section}}, {courseId:1, courseCode:1, semester:1, batch:1, section:1}).populate("courseId",{_id:1, title:1, category:1}).populate("facultyId", {_id:1, title:1, firstName:1, lastName:1})
            courses = courses.map(course => ( course.toObject() ))
            
            //If no rows created get data from enrollment...
            if(courses.length==0){
                
                let data =  {
                    "_id": "",
                    "semester": sem.sem,
                    "courseCode": "",
                    "batch": sem.batch,
                    "branch": branch,
                    "section":"",
                    "facultyId": "",
                    "courseName": "",
                    "courseCategory": "",
                    "facultyName": ""
                }
                
                //Group By Curriculum ID to get courses...
                let data1 = await EnrollmentModel.aggregate(
                    [
                        {
                            "$match": {semester:sem.sem, batch:sem.batch, branch:branch, courseType: "theory", section:{$in:section}}
                        }, 
                        {
                            $group:{_id:{"courseCode":"$courseCode", "section":"$section"}}
                        } 
                    ])
                await CurriculumModel.populate(data1, {path:"_id.courseCode", select: {courseCode:1, title:1, category:1}})
                
                //Regularize data for front-end...
                for(let course of data1){
                    data.courseCode = course._id.courseCode.courseCode
                    data.section = course._id.section
                    data.courseName = course._id.courseCode.title
                    data.courseCategory = course._id.courseCode.category
                    data.courseId = course._id.courseCode._id
                    result.courses.push({ ...data })
                }

            }else{ 
                console.log("Wrong")
                //Regularize data for front-end...
                for (let course of courses){
                    course.courseName = course.courseId.title
                    course.courseCategory = course.courseId.category
                    course.courseId = course.courseId._id

                    //check if faculty already allocated...
                    if(course.hasOwnProperty('facultyId')){
                        course.facultyName = course.facultyId.title + " " + course.facultyId.firstName + " " + course.facultyId.lastName
                        course.facultyId = course.facultyId._id
                    } else {
                        course.facultyName = ""
                        course.facultyId = ""
                    }

                    result.courses.push({ ...course})
                }
            }
            
        }

        //Get Faculty List for Drop-Down
        result.faculty = await FacultyModel.find({},{title:1, firstName:1, lastName:1, branch:1})
        result.faculty = result.faculty.map(staff => ({ ...staff._doc }))
        
        //Regularize data for front-end...
        for(let faculty of result.faculty){
            faculty.Name = faculty.title + " " + faculty.firstName + " " + faculty.lastName
            delete faculty.title
            delete faculty.firstName
            delete faculty.lastName
        }
        res.status(200).json(result);

    } catch(err) { res.status(200).send("Request Failed: "+ err.message ) }

}


//Completed
export const postStaff = async (req,res) => {

    try{

        let { courses } = req.body
        let data = []
        let data1 = {
            semType: "",
            semester: 0,
            courseId: "",
            courseCode: "",
            type: "",
            branch: "",
            batch: "",
            groupNo: 1,
            schedule: [],
            unitSchedule:[
                {
                    number:1,
                    session:"",
                    type:"",
                },
                {
                    number:2,
                    session:"",
                    type:"",
                },
                {
                    number:3,
                    session:"",
                    type:"",
                }
            ]
        }

        //Iterate over Each Course
        for(let course of courses){

            //If Course Details Id present Update ....
            if (course._id != ""){
                await CourseDetailsModel.updateOne({_id:course._id},{$set: {facultyId:course.facultyId}})
            } else {

                // Create a new entry in Course Details...
                data1._id = mongoose.Types.ObjectId()
                data1.semType = course.semester%2==0 ? "even" : "odd"
                data1.semester = course.semester
                data1.courseId = course.courseId
                data1.courseCode = course.courseCode
                let temp = data1.courseCode.indexOf('$')
                if(temp!=-1){
                    data1.courseCode = course.courseCode.substring(0,temp)+course.semester+course.courseCode(temp+1)
                }
                data1.section = course.section
                data1.type = "theory"
                data1.branch = course.branch
                data1.batch = course.batch
                
                if(course.hasOwnProperty('facultyId')){
                    if(course.facultyId!="")
                        data1.facultyId = course.facultyId
                }
                console.log(data);
                data.push({...data1})

                //update Coursedetails Id in Enrollment...
                await EnrollmentModel.updateMany({branch:course.branch,batch:course.batch,section:course.section,semester:course.semester,courseCode:course.courseId}, {courseId:data1._id})
            }

        }

        //Create rows in Course Detail
        if(data.length!=0)
            await CourseDetailsModel.insertMany(data)
                
        res.status(200).send("Updated successfully")

    } catch(err) { res.status(400).send("Request Failed: "+err.message)}
}


// Completed
export const getTimetable = async (req,res) => {

    try{

        let result = {}
        let flag1 = 0
        let flag2 = 0
        let { branch, isFirstYear, section } = req.query
        
        let sems = []
        //Get Current Batch and Semester...
        if(isFirstYear==true){
            sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({batch:-1, sem:-1}).limit(1)
        }else{
            sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(4)
            sems = sems.map(item => item.toObject())
            sems = sems.filter(item => !(parseInt(item.sem)==1||parseInt(item.sem)==2))        
        }
        console.log(sems.map(item =>item.sem))
        result.sems = sems
        
        let data = []
        
        //Get all Courses Registered from CourseDetails
        for(let sem of sems) {
            let temp = await CourseDetailsModel.find( {branch:branch, semester:sem.sem, batch:sem.batch, section:{$in:section}}, {facultyId:1, batch:1, newSchedule:1, semester:1, section:1, schedule:1, courseCode:1, groupNo:1, type:1 }).populate("courseId", {_id:1,title:1}).populate("facultyId",{title:1, firstName:1, lastName:1})
            temp = temp.map(item => item.toObject())
            data = data.concat([...temp])
        }
        result.courses = []
        
        //Regularize data for front-end...
        for(let course of data){
            
            console.log("course = ", course)
            course.courseName = course.courseId.title
            course.courseId = course.courseId._id
            if(course.type == "practical" && course.courseName != "Mini Project" && course.courseName != "Project Work")
                course.courseCode = course.courseCode + "-B" + course.groupNo

            if(course.courseName == "Mini Project"){
                if(flag1==0)
                    flag1=1
                else
                    continue
            }

            if(course.courseName == "Project Work"){
                if(flag2==0)
                    flag2=1
                else
                    continue
            }

            if(course.newSchedule!=null){
                if(course.newSchedule.hasOwnProperty("effectiveDate")){
                    course.effectiveDate = course.newSchedule.effectiveDate
                    course.schedule = course.newSchedule.schedule
                }    
            }
            delete course.newSchedule
            
            if(course.hasOwnProperty("facultyId")){
                course.facultyName = course.facultyId.title + " " +course.facultyId.firstName + " " + course.facultyId.lastName;
                course.facultyId = course.facultyId._id
            }

            result.courses.push({...course})
        }

        res.status(200).send(result)

    } catch(err) { res.status(400).send("Request Failed: " + err.message) }

}


//Completed...
export const postTimetable = async (req,res) => {
    try{
        
        let { data, ed, branch } = req.body
        ed = new Date(ed)
        console.log(data)
        //Iterate over each Course
        for(let course of data){
            console.log(course)
            let temp = {
                effectiveDate: ed,
                schedule: course.schedule
            }

            if(course.courseName == "Mini Project" || course.courseName == "Project Work"){
                await CourseDetailsModel.updateMany({courseId:course.courseId, batch:course.batch, semester:course.semester, branch: branch}, {$set: {newSchedule: temp}} )
            }
            console.log(temp)
            await CourseDetailsModel.updateOne({_id:course._id}, {$set: {newSchedule: temp}})
        
        }
        
        res.status(200).send("Updated Successfully")
    
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }

}


//Completed
export const getUt = async (req, res) => {

    try{

        let { branch, isFirstYear, section } = req.query
        
        let sems = []
        //Get Current Batch and Semester...
        if(isFirstYear==true){
            sems = await SemesterMetadataModel.find({}, { _id:0, sem:1, batch:1 }).sort({batch:-1, sem:-1}).limit(1)
        }else{
            sems = await SemesterMetadataModel.find({}, { _id:0, sem:1, batch:1 }).sort({date:-1}).limit(4)
            sems = sems.filter(item => (item.sem!=1||item.sem!=2))
        }
        
        let result = []
        //Get All Courses of Current Batch and Semester...
        for(let sem of sems) {
            let temp = await CourseDetailsModel.find({branch:branch, type:"theory", semester:parseInt(sem.sem), batch:sem.batch, section:{$in:section}}, {_id:1, courseCode:1, unitSchedule:1, batch:1, semester:1, section:1 }).populate("courseId", {title:1})
            temp = temp.map(item=>item.toObject())
            result = result.concat([...temp])
        }
        console.log(result)
        
        //Regularize Data for front-end...
        let course_list = []
        for(let course of result){
            course.courseName = course.courseId.title
            delete course.courseId
            for(let ut of course.unitSchedule){
                let temp = {}
                temp.batch = course.batch
                temp.semester = course.semester
                temp.section = course.section
                temp.courseId = course._id
                temp.courseCode = course.courseCode
                temp.courseName = course.courseName
                temp.date = ut.date
                temp.number = ut.number
                temp.session = ut.session
                course_list.push(temp)
            }
        }

        let data = {
            sems: sems,
            courses: course_list
        }
        
        console.log("Data Sent")
        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


//
export const postUt = async (req,res) => {

    try{

        let data = req.body
        console.log(data)
        let data1 = []

        //Group Data of Same course
        for(let course of data){
            let flag=false

            for(let course1 of data1){
                
                //Check if row for the course created 
                if(course.courseId === course1.courseId){
                    
                    let temp = {
                        date:course.date,
                        number:course.number,
                        session: course.session
                    }

                    //push only UT into it
                    course1.unitSchedule.push({...temp})
                    flag=true
                    break
                }
            }

            //Create course row if not done
            if(flag==false){
                
                let temp = {
                    courseId: course.courseId,
                    courseName: course.courseName,
                    courseCode: course.courseCode,
                    unitSchedule: [
                        {
                            date:course.date,
                            number:course.number,
                            session: course.session
                        }
                    ]
                }

                data1.push({...temp})
            }

        }

        //push data into DB
        for(let course of data1){
            console.log("updating...")
            await CourseDetailsModel.updateOne({_id:course.courseId}, {unitSchedule:course.unitSchedule})
        }

        res.status(200).json(data1)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


//Need to sort students ....
export const getGroups = async (req,res) => {

    try{
        
        let { branch, isFirstYear, section } = req.query
        let result = {}
        result.courses = []
        
        let sems = []
        //Get Current Batch and Semester
        if(isFirstYear==true){
            sems = await SemesterMetadataModel.find({}, { _id:0, sem:1, batch:1 }).sort({batch:-1, sem:-1}).limit(1)
        }else{
            sems = await SemesterMetadataModel.find({}, { _id:0, sem:1, batch:1 }).sort({date:-1}).limit(4)
            sems = sems.filter(item => (item.sem!=1||item.sem!=2))
        }
        result.sems = sems
        //Iterate over each Batch
        for(let sem of sems){

            //Group By CourseCode and groupNo to get each groups...
            let data1 = await EnrollmentModel.aggregate(
                [
                    {
                        "$match": {semester:sem.sem, batch:sem.batch, branch:branch, courseType:"practical", section:{$in:section}}
                    },
                    {
                        $group:{
                            _id:{"courseCode":"$courseCode","section":"$section","groupNo":"$groupNo", "courseId":"$courseId"}, 
                            students:{ $push: "$studentId"}
                        }
                    },
                    {
                        "$sort": {
                            "_id.groupNo":1
                        }
                    }, 
                    
                    
                ]
            )
            
            await CurriculumModel.populate(data1, {path:"_id.courseCode", select: {courseCode:1, title:1, category:1}})
            await StudentsModel.populate(data1, {path: "students", select: {register:1}});
            
            for(let course of data1)
                console.log(course.students);

            //Regularize data for front-end...
            for(let course of data1){
                let data =  {
                    "semester": sem.sem,
                    "batch": sem.batch,
                    "courseId":"", 
                    "courseCode": "",
                    "courseName": "",
                    "groupNo":0,
                    "section":"",
                    "studentId":[],
                    "student":[]
                    }

                //if Course detail row created get faculty details...
                if(course._id.hasOwnProperty("courseId")){
                    await CourseDetailsModel.populate(course, {path: "_id.courseId", select:{facultyId:1}})
                    data._id = course._id.courseId._id
                    let temp = {...course._id.courseId}
                    temp = temp._doc
                    if(temp.hasOwnProperty("facultyId")){
                        await FacultyModel.populate(temp, {path: "facultyId", select:{title:1, firstName:1, lastName:1}})
                        data.facultyId = temp.facultyId._id
                        data.facultyName = temp.facultyId.title+" "+temp.facultyId.firstName+" "+temp.facultyId.lastName
                    }
                }

                data.courseId = course._id.courseCode._id
                data.courseCode = course._id.courseCode.courseCode
                data.courseName = course._id.courseCode.title
                data.groupNo = course._id.groupNo
                data.section = course._id.section
                
                //Student List...
                for(let student of course.students){
                    data.student.push(student.register)
                    data.studentId.push(student._id)
                }

                result.courses.push({...data})
            }
        }

        //Faculty List for Drop Down...
        result.faculty = await FacultyModel.find({},{title:1, firstName:1, lastName:1})
        result.faculty = result.faculty.map(staff => ({ ...staff._doc }))
        
        //Regularize data for front-end...
        for(let faculty of result.faculty){
            faculty.Name = faculty.title + " " + faculty.firstName + " " + faculty.lastName
            delete faculty.title
            delete faculty.firstName
            delete faculty.lastName
        }

        res.status(200).send(result);

    } catch (err) { res.status(400).send("Request Failed: "+err.message) }

}


//Completed
export const postGroups = async (req,res) => {

    try{

        let { courses, branch } = req.body
        let data = []
       
        //Iterate over courses
        for (let course of courses){
            
            //If Course exist in Course Detail...
            if (course.hasOwnProperty("_id")){

                //Update faculty
                if(course.hasOwnProperty("facultyId")){
                    await CourseDetailsModel.updateOne({_id:course._id},{$set:{facultyId:course.facultyId}})
                }

                //Update CourseDetail id and Group No in Enrollment
                await EnrollmentModel.updateOne( { batch:course.batch, section:course.section, semester:course.semester, courseCode:course.courseId, studentId:{$in:course.studentId}, courseType: "practical" }, {$set:{courseId:course.coursId, groupNo:course.groupNo}})
                
            }else{

                //Create new entry in Course Details...
                let data1 = {
                    _id: mongoose.Types.ObjectId(),
                    semType: course.semester%2==0?"even":"odd",
                    semester: course.semester,
                    courseId: course.courseId,
                    courseCode: course.courseCode,
                    type: "practical",
                    branch: branch,
                    batch: course.batch,
                    section: course.section,
                    groupNo: course.groupNo,
                    facultyId:course.facultyId,
                    schedule: [],
                    unitSchedule:[
                        {
                            number:1,
                            session:"",
                            type:"",
                        },
                        {
                            number:2,
                            session:"",
                            type:"",
                        },
                        {
                            number:3,
                            session:"",
                            type:"",
                        }
                    ]
                }

                //Update CourseDetail id and Group No in Enrollment
                await EnrollmentModel.updateMany({branch:course.branch, batch:course.batch, section:course.section, semester:course.semester, studentId:{$in:course.studentId}, courseCode:course.courseId, courseType:"practical", },{$set:{courseId:data1._id, groupNo:data1.groupNo}} )
                
                data.push({...data1})
               
            }
        }

        //Create new Rows in Course Details...
        if(data.length!=0)
            await CourseDetailsModel.insertMany(data)
        
        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


//
export const getdailyjob = async (req,res) => {

    try{

        await MasterTimetableModel.deleteMany({})
        console.log(await CalendarModel.find({}).sort({date:1}))
        //await MasterTimetableModel.deleteMany({})
        let periods = []
        let date1 = new Date(new Date('2023-02-02').toJSON().slice(0, 10))
            
        //Create Days for Feb...
        for(let i=0;i<45;i++){
            let date = new Date(new Date('2023-02-02').toJSON().slice(0, 10))
            date.setDate(date1.getDate()+i)
            console.log(i, date)
            let cal = await CalendarModel.find({date:date})
            let fn = false
            let an = false

            if (cal[0].isWorkingDay==false)
                continue

            for(let batch of cal[0].batches){

                //Creating only for 2019 Batch...
                if(batch!=2019)
                    continue

                //Get all Branches...
                let branches = await BranchModel.find({})
                
                //Get Current Sem of each branch...
                let sem = await SemesterMetadataModel.find({batch:batch},{ _id:0, sem:1, freeze:1}).sort({date:-1}).limit(1) 

                //Iterate over each Branch...
                for(let branch of branches){

                    //Get All Courses of the particular class...
                    let courses = await CourseDetailsModel.find({branch:branch.name, semester:sem[0].sem, batch:batch},{schedule:1,unitSchedule:1,facultyId:1, newSchedule:1})
                    courses = courses.map(course => ({ ...course._doc }))
                    
                    //Iterate over each Course...
                    for(let course of courses){

                        //Check Effective Date reached
                        if(course.newSchedule != null){
                            if (course.newSchedule.hasOwnProperty("effectiveDate")){

                                if(course.newSchedule.effectiveDate.toString()==date.toString()){
                                    course.schedule = course.newSchedule.schedule
                                    await CourseDetailsModel.updateOne({_id:course._id}, {schedule:course.schedule,newSchedule:null})
                                }
                            }
                        }

                        //Set freeze date...
                        let freezeDate = new Date(date)
                        freezeDate.setDate(freezeDate.getDate()+sem[0].freeze.attendance+5)
                        
                        //Initialize Period...
                        let period = {
                            date: date,
                            branch: branch.name,
                            batch: batch,
                            dayOrder: cal[0].order,
                            workingDay: true,
                            courseId:course._id,
                            facultyId:course.facultyId,
                            period:0,
                            type:"regular",
                            freeze: freezeDate
                        }

                        //Create Periods for each Course if it has period today...
                        for(let schedule of course.schedule){
                            
                            //Check of Is it has any period today?
                            if(Math.floor(schedule/10)==cal[0].order){
                                
                                //Check of UT Scheduled in Morning 
                                if((schedule%10)<=4&&fn==false){
                                    period.period = schedule%10
                                    periods.push({...period})
                                }

                                //Check of UT Scheduled in Afternoon
                                if((schedule%10)>4&&an==false){
                                    period.period = schedule%10
                                    periods.push({...period})
                                }
                            }
                        }

                        //Iterate over utSchedules to createa attendance for the UT if any Scheduled today
                        for(let ut of course.unitSchedule){

                            if(ut.date==null)
                                continue
                            
                            if(ut.date.toString() !=cal[0].date.toString()){
                                continue
                            }

                            if(ut.session=="FN"){

                                //Set Flag to show UT Scheduled...
                                fn=true

                                //Remove Periods if UT Scheduled...
                                periods = periods.filter(period => ![1,2,3,4].some(each => period.period == each))
                                
                                //Push UT Period...
                                period.period = 2
                                periods.push({...period})
                                period.period = 3
                                periods.push({...period})

                            }

                            if(ut.session=="AN"){

                                //Set Flag to show UT Scheduled...
                                an=true

                                //Remove Periods if UT Scheduled...
                                periods = periods.filter(period => ![5,6,7,8].some(each => period.period == each))
                                
                                //Push UT Period...
                                period.period = 6
                                periods.push({...period})
                                period.period = 7
                                periods.push({...period})
                            }
                          
                        //UT Iteration Close
                        }
                        //console.log("1 completed")
                    
                    // Course Iteration Close
                    }

                //Branch Iteration Close
                }

            //Batch Iteration Close
            }

        //Days Iteration Close
        }
        console.log(periods)
        await MasterTimetableModel.insertMany(periods)
        res.status(200).json(await MasterTimetableModel.find({}))

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



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
    
        //checking whether the fa has made any request
        let isRequestMade = await RequestsModel.find({ from: facultyId }, { done: 1 })

        //storing whether the fa can make request or not
        let canRequest = (isRequestMade) ? true : false

        staff = await FacultyModel.find({ admin: true }, { _id: 1 })
        toId = staff[0]._id

        res.status(200).json({...profile.toObject(), canRequest: canRequest, toId: toId })

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