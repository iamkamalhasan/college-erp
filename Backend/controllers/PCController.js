import mongoose from "mongoose"

import { SemesterMetadataModel } from '../models/SemesterMetadataModel.js';
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { CurriculumModel } from '../models/CurriculumModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
import { FacultyModel } from '../models/FacultyModel.js';
import { RequestsModel } from '../models/RequestsModel.js';

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////

// fetch data to feed the enrollment page 
export const CE_PC_getenrolledstudentslist = async(req, res) => {
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


export const CE_PC_approvestudents = async(req, res) => {
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
                if(enrollmentdata.approval>2 && enrollmentdata.approval<=14){
                    success = false
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval < -2 && enrollmentdata.approval>-11){
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

export const CR_PC_getRegisteredstudentslist = async(req, res) => {
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
                
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

export const CR_PC_approvestudents = async(req, res) => {
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
                if(enrollmentdata.approval>12){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval < -12 && enrollmentdata.approval>-15){
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