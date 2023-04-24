import mongoose from "mongoose"

import { StudentsModel } from "../models/StudentsModel.js"
import { StudentDetailsModel } from "../models/StudentDetailsModel.js"
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { ExternalsModel } from '../models/ExternalsModel.js'
import { excelToJson, jsonToExcel } from "../utilities/excel-parser.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { UsersModel } from "../models/UsersModel.js"
import { CalendarModel } from "../models/CalendarModel.js"
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js"
import { redis } from "../index.js"
import { BranchModel } from "../models/BranchModel.js"
import { CurriculumModel } from "../models/CurriculumModel.js"
import { ElectiveMetadataModel } from "../models/ElectiveMetadataModel.js"
import { RequestsModel } from "../models/RequestsModel.js"
import { ExamFeesModel } from "../models/ExamFeesModel.js"
import { ExamPaymentModel } from "../models/ExamPaymentModel.js"
import { AdminModel } from "../models/AdminModel.js"
import { FeedbackQuestionsModel } from "../models/FeedbackQuestionsModel.js"
import { FeedbackModel } from "../models/FeedbackModel.js"
import { InternalsModel } from "../models/InternalsModel.js"

///////////////////////  CACHE ///////////////////////

//Batch cache
function setCache(redisKey, data) {
    redis.set(redisKey, JSON.stringify(data))
}

export const getBatch = async (req, res) => {

    try {

        let data = await redis.get("SEMESTER_METADATA")

        if (data !== null) data = JSON.parse(data)
        else {

            data = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("SEMESTER_METADATA", data)

        }

        data = data.map(doc => doc.batch)
        data = new Set(data.sort(function (a, b) { return (b - a) }))
        res.status(200).json({ batches: [...data] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getBranchCache = async (req, res) => {

    try {

        let data = await redis.get("BRANCH")

        if (data !== null) data = JSON.parse(data)
        else {

            data = await BranchModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("BRANCH", data)

        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getRegulation = async (req, res) => {

    try {

        let data = await redis.get("SEMESTER_METADATA")

        if (data !== null) data = JSON.parse(data)
        else {

            data = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("SEMESTER_METADATA", data)

        }

        data = data.map(doc => doc.regulation)
        data = new Set(data.sort(function (a, b) { return (b - a) }))
        res.status(200).json({ batches: [...data] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

///////////////////////  ADMIN MODULE ///////////////////////
export const manageAdmin = async (req, res) => {

    try {

        let admin = req.body

        await AdminModel.updateOne({ email: admin.email }, admin, { upsert: true })

        res.status(200).send("Request successfull!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getAdmin = async (req, res) => {

    try {

        let admin = await AdminModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })

        admin = admin[0]

        res.status(200).json([{ adminId: admin.adminId, title: admin.title, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, mobile: admin.mobile, isActive: admin.isActive, _id: admin._id }])

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

//Create calendar
export const createCalendar = async (req, res) => {

    try {

        let { from, to, isSaturdayHoliday } = req.body

        from = new Date(from)
        to = new Date(to)

        let dates = generateCalendar(from, to, isSaturdayHoliday)

        let check = await CalendarModel.find({ date: { $in: [from, to] } })

        if (check.length != 0)
            res.status(200).send("Date already exist in calendar")
        else {
            await CalendarModel.create(dates)
            res.status(200).send("Success")
        }

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const manageSaturday = async (req, res) => {

    try {

        let { from, to, batches, isWorkingDay } = req.body

        let data = await CalendarModel.find({ date: { $gte: from, $lte: to }, day: 6 }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

        for (let doc of data) {

            doc.isWorkingDay = isWorkingDay
            if (isWorkingDay)
                doc.batches = batches
            else
                doc.order = doc.batches = null

            let _id = doc._id
            delete doc._id

            await CalendarModel.updateOne({ _id: _id }, doc)

        }

        res.status(200).send("Success")


    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const declareHoliday = async (req, res) => {

    try {

        let load = req.body
        let currentOrder = load[0].order ?? 1
        let currentDate = load[0].date

        load.forEach(async doc => {
            let id = doc._id
            delete doc._id
            doc.isWorkingDay = false
            doc.order = null
            doc.batches = null

            await CalendarModel.updateOne({ _id: id }, doc)
        })

        if (load[0].isDayOrder) {

            let data = await CalendarModel.find({ date: { $gte: new Date(currentDate) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

            data.map(async doc => {

                if (doc.day != 6) {
                    (doc.order = currentOrder)
                    if ((currentOrder % 5) == 0) {
                        currentOrder = 5
                        currentOrder = 1
                    } else currentOrder++
                }

                let id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: id }, doc)
            })


        }

        res.status(200).send("success")
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const manageWorkingDay = async (req, res) => {

    try {

        let data = { ...req.body }
        await CalendarModel.updateOne({ date: (data.date) }, data)

        res.status(200).send("Success")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getMinMaxDate = async (req, res) => {

    try {
        let minmax = await CalendarModel.aggregate([
            {
                "$group": {
                    "_id": null,
                    "min": { "$min": "$date" },
                    "max": { "$max": "$date" }
                }
            }
        ])
        res.status(200).json(...minmax)
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getAllDates = async (req, res) => {

    try {

        let { year } = req.query

        let data = await CalendarModel.find({ year: year }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

        res.status(200).json(data)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const manageBatchInCalendar = async (req, res) => {

    try {

        let { batches, from, to, addBatch, isDayOrder, workingDaysPerWeek } = req.body
        if (!addBatch) {
            let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })
            data = data.map(async doc => {
                batches.forEach(batch => {
                    doc.batches = doc.batches.filter(ele => ele != batch)
                })
                if (doc.batches.length == 0) (doc.order = null)
                let id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: id }, doc)
            })
        } else {
            addBatchInCalendar(from, to, batches, isDayOrder, workingDaysPerWeek)
        }

        res.status(200).send("Success")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const extendSemesterDuration = async (req, res) => {

    try {

        let { from, to, batch, isDayOrder, workingDaysPerWeek, proccedDayOrderWith } = req.body
        addBatchInCalendar(from, to, [batch], isDayOrder, workingDaysPerWeek, proccedDayOrderWith)

        res.status(200).send("Success")
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Generates calendar for given dates
async function addBatchInCalendar(from, to, batches, isDayOrder, workingDaysPerWeek = 5, proccedDayOrderWith = 1) {

    let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })
    if (!isDayOrder) {
        for (let doc of data) {
            //add only non existing batches
            if (doc.batches == null) doc.batches = batches
            else {
                batches.forEach(batch => {
                    if (!doc.batches.includes(batch)) doc.batches.push(batch)
                })
            }

            if (doc.order == null) (doc.order = doc.date.getDay())
            doc.isDayOrder = isDayOrder
            let _id = doc._id
            delete doc._id
            await CalendarModel.updateOne({ _id: _id }, doc)
        }

    } else {

        let dayOrder = (data.length > 0) ? (data[0].order ?? proccedDayOrderWith) : proccedDayOrderWith
        for (let doc of data) {
            //add only non existing batch
            if (doc.batches == null) doc.batches = batches
            else {
                batches.forEach(batch => {
                    if (!doc.batches.includes(batch)) doc.batches.push(batch)
                })
            }

            let currentDayOrder = dayOrder
            if ((dayOrder % workingDaysPerWeek) == 0) {
                currentDayOrder = workingDaysPerWeek
                dayOrder = 1
            } else dayOrder++

            doc.order = doc.order ?? currentDayOrder
            doc.isDayOrder = isDayOrder
            let _id = doc._id
            delete doc._id
            await CalendarModel.updateOne({ _id: _id }, doc)
        }

    }

}

function generateCalendar(startDate, endDate, isSaturdayHoliday = true) {

    let currentDate = new Date(startDate);
    endDate = new Date(endDate)

    let dates = [];

    while (currentDate <= endDate) {

        let day = currentDate.getDay()

        let isWorkingDay = (isSaturdayHoliday && day == 6) || (day == 0) ? false : true

        dates.push({ date: new Date(currentDate), day: day, isWorkingDay: isWorkingDay, month: currentDate.getMonth(), year: currentDate.getFullYear() });

        currentDate.setDate(currentDate.getDate() + 1);

    }

    return dates;

}


//Semester Metadata
export const createMetadata = async (req, res) => {

    try {

        let metaData = req.body
        let batch = metaData.batch, semester = metaData.sem, from = metaData.begin, to = metaData.end, isDayOrder = metaData.schedule.isDayOrder, workingDaysPerWeek = metaData.schedule.workingDaysPerWeek
        addBatchInCalendar(from, to, [batch], isDayOrder, workingDaysPerWeek)

        let forCache = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })

        //Checks whether the batch and sem already exists
        let check = forCache.filter((doc) => doc.batch == batch && doc.sem == semester)

        //Creates a doc in semester metadata
        if (check.length == 0) {
            metaData.begin = changeToLocalTime(metaData.begin)
            metaData.end = changeToLocalTime(metaData.end)
            delete metaData._id
            await SemesterMetadataModel.create(metaData)
            await StudentsModel.updateMany({ batch: batch, status: "active" }, { $set: { currentSemester: semester } })
            forCache.push(metaData)
            setCache("SEMESTER_METADATA", forCache)
            res.status(200).send("Semester metadata created successfully!")
            return
        }

        res.status(200).send("Semester for this batch already exists !!!")
    
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const updateMetadata = async (req, res) => {

    try {

        let updates = req.body
        let id = updates._id

        delete updates._id
        await SemesterMetadataModel.updateOne({ _id: id }, updates)

        let forCache = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0, facultyAdvisor: 0 })
        setCache("SEMESTER_METADATA", forCache)

        res.status(200).send("Semester metadata updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getFAMeta = async (req, res) => {

    try {

        let faMeta = await SemesterMetadataModel.find({}, { _id: 1, facultyAdvisor: 1, batch: 1, sem: 1 }).populate("facultyAdvisor.faculty", { firstName: 1, lastName: 1, title: 1 }).sort({ createdAt: "desc" })
        faMeta = faMeta.map((doc) => {
            doc = doc.toObject()
            if (doc.facultyAdvisor != null)
                doc.facultyAdvisor = doc.facultyAdvisor.map((dept) => {
                    dept.faculty = ((dept.faculty?.title ?? "") + " " + dept.faculty?.firstName + " " + dept.faculty?.lastName).trim()
                    return { faculty: dept.faculty, branch: dept.branch, section: dept.section }
                })
            return doc
        })
        res.status(200).json(faMeta)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getFeedbackMeta = async (req, res) => {

    try {

        let meta = await SemesterMetadataModel.find({}, { feedback: 1, sem: 1, batch: 1 }).lean()
        let minmax = await CalendarModel.aggregate([
            {
                "$group": {
                    "_id": null,
                    "min": { "$min": "$date" },
                    "max": { "$max": "$date" }
                }
            }
        ])

        let data = {
            batch: {},
            meta: {}
        }
        meta.forEach((doc) => {
            if (!doc.feedback) {
                if (!data.batch[doc.batch]) data.batch[doc.batch] = []
                data.batch[doc.batch].push(doc.sem)
            }
            else {
                if (!data.meta[doc.batch]) data.meta[doc.batch] = {}
                data.meta[doc.batch][doc.sem] = doc.feedback
            }
        })
        res.status(200).json({ meta: data.meta, batch: data.batch, minmax: minmax[0] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getMetadata = async (req, res) => {

    try {

        let meta = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0, feedback: 0 }).sort({ createdAt: 'desc' })

        res.status(200).json(meta)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

//Branch
export const manageBranch = async (req, res) => {
    try {

        let data = req.body

        let filter = data._id ? { _id: data._id } : { branch: data.branch, section: data.section }

        delete data._id

        await BranchModel.updateOne(filter, data, { upsert: true })

        res.status(200).send("Branch updates successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getBranch = async (req, res) => {

    try {

        let data = await BranchModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })

        res.status(200).json(data)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Electives
function manageElectives(data) {
    data.forEach(async doc => {
        doc.oe = doc.oe.replace(" ", "")
        doc.pe = doc.pe.replace(" ", "")

        doc.oe = doc.oe.split(",").map(oe => {
            oe = oe.toUpperCase()
            if (!oe.toUpperCase().includes("OE-"))
                oe = "OE-" + oe
            return oe
        })
        doc.pe = doc.pe.split(",").map(pe => {
            pe = pe.toUpperCase()
            if (!pe.includes("PE-"))
                pe = "PE-" + pe
            return pe
        })
        await ElectiveMetadataModel.updateOne({ regulation: doc.regulation, branch: doc.branch, semester: doc.semester }, doc, { upsert: true })
    })
}

export const addElective = async (req, res) => {
    try {

        let data = req.body
        manageElectives(data)
        res.status(200).send("Elective added successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const updateElective = async (req, res) => {
    try {

        let data = req.body
        manageElectives([data])
        res.status(200).send("Elective updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const uploadElectives = async (req, res) => {
    try {

        let data = req.files.data
        data = await excelToJson(data)
        manageElectives(data)
        res.status(200).send("Electives uploaded successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getElectives = async (req, res) => {

    try {

        let electives = await ElectiveMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })

        electives = electives.map(doc => {
            let PE = ""
            let OE = ""


            doc.oe.forEach(oe => {
                OE = OE + " " + oe + ","
            })
            OE = OE.slice(0, -1)

            doc.pe.forEach(pe => {
                PE = PE + " " + pe + ","
            })
            PE = PE.slice(0, -1)
            return { _id: doc._id, regulation: doc.regulation, semester: doc.semester, branch: doc.branch, oe: OE, pe: PE }
        })

        res.status(200).json(electives)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

///////////////////////  USERS MODULE ///////////////////////
export const getStudentUsers = async (req, res) => {

    try {

        let { batch } = req.query

        // Finds students by batch and returning the result with only required fields
        let students = await StudentsModel.find({ batch }, { __v: 0, createdAt: 0, updatedAt: 0, regulation: 0, degree: 0, dob: 0, section: 0, currentSemester: 0, mobile: 0, masterAttendance: 0, requestId: 0 })
        students = students.map((student) => {
            student = student.toObject()
            let fullName = (student.firstName + " " + student.lastName).trim()
            let register = student.register
            delete student.register
            return { register: register, fullName: fullName, ...student }
        })
        res.status(200).json(students)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Create or delete student account from collection based on activation status
export const manageUsers = async (req, res) => {

    try {

        let users = req.body
        users.forEach(async user => {

            let _id = user._id
            let userType = user.userType

            delete user["userType"]
            delete user["_id"]

            let credentials = { email: user.email, userType: userType, userId: _id }

            if (user.isActive) await UsersModel.updateOne({ email: user.email }, credentials, { upsert: true })
            else await UsersModel.deleteOne({$or: [ {email: user.email}, { userId: _id } ]})

            if (userType == "Student") await StudentsModel.updateOne({ _id: _id }, user)
            else if (userType == "Admin") await AdminModel.updateOne({ _id: _id }, user)
            else await FacultyModel.updateOne({ _id: _id }, user)

        })

        res.status(200).send("Users updated")
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Gets the all faculty from the db 
export const getFacultyUser = async (req, res) => {

    try {

        let faculty = await FacultyModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0, admin: 0, cfa: 0, hod: 0, pc: 0, ttc: 0, fa: 0, ci: 0, primaryRole: 0, address: 0, title: 0, type: 0, mobile: 0 })

        faculty = faculty.map((doc) => {
            doc = doc.toObject()
            doc.fullName = doc.firstName + " " + doc.lastName
            return { _id: doc._id, facultyId: doc.facultyId, fullName: doc.fullName, branch: doc.branch, email: doc.email, isActive: doc.isActive }
        })

        res.status(200).json(faculty)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}


///////////////////////  STUDENTS MODULE ///////////////////////

// Filters the trash documents and updates the remainig documents
export const updateStudent = async (req, res) => {

    try {

        studentUpdation(req.body)

        res.status(200).send("Student data updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Gets all the students of a particular batch
export const getStudents = async (req, res) => {

    try {

        let { batch } = req.query

        let ids = await StudentsModel.find({ batch }, { _id: 1 })

        let Students = await StudentDetailsModel.find({ studentId: { $in: ids.map(student => student._id) } }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0, requestId: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0 })

        Students = Students.map(doc => {
            doc = doc.toObject()
            let Student = doc.studentId
            let fullName = Student.firstName + " " + Student.lastName
            let register = Student.register
            delete Student.register
            delete Student.firstName
            delete Student.lastName
            delete doc.studentId
            doc = { register: register, fullName: fullName, ...Student, ...doc }
            return doc
        })

        res.status(200).json(Students)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

// Uploads the students
export const uploadStudents = async (req, res) => {

    let data = {}, trash = {}
    try {

        let file = req.files.data

        let load = await excelToJson(file), create = [], update = []

        let obj = filterValidStudentDocuments(load)

        data = obj.data
        trash = obj.trash

        let result = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { register: 1, _id: 1 })

        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.register == rdoc.register) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await studentCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await studentUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) {
        await StudentsModel.deleteMany({ batch: { $in: [...new Set(data.map(doc => doc.batch))] } })
        res.status(400).send('Request Failed: ' + err.message)
    }
}

const studentCreation = async (data) => {

    // Creates Id and stores the id for 2 schema
    data = data.map(doc => { doc["studentId"] = doc["_id"] = mongoose.Types.ObjectId(); return doc })

    await StudentsModel.create(data)

    data = data.map(doc => { delete doc["_id"]; return doc })

    await StudentDetailsModel.create(data)
}

const studentUpdation = async (data) => {

    const id = data._id

    delete data._id

    await StudentsModel.updateOne({ _id: id }, data)

    await StudentDetailsModel.updateOne({ studentId: id }, data)

    if(data.email)
        await UsersModel.updateOne({userId: id}, {email: data.email})
}

const filterValidStudentDocuments = (load) => {

    let trash = [], data = [], required = ["register", "regulation", "batch", "degree", "branch", "currentSemester", "email", "firstName", "lastName", "dob"]

    // Filter valid documents
    for (let doc of load) {
        let valid = true
        for (let field of required)
            if (!doc[field]) {
                trash.push({ ...doc })
                valid = false
                break
            }
        valid && data.push({ ...doc })
    }
    return { data, trash }

}

///////////////////////  FACULTY MODULE ///////////////////////
export const addFaculty = async (req, res) => {

    try {

        facultyCreation(req.body)

        res.status(200).send("Faculty added successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const updateFaculty = async (req, res) => {

    try {

        facultyUpdation(req.body)

        res.status(200).send("Faculty data updated successfully")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getFaculty = async (req, res) => {

    try {

        let faculty = await FacultyModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0, requestId: 0 })

        faculty = faculty.map((doc) => {
            doc = doc.toObject()
            let fullName = doc.firstName + " " + doc.lastName
            let facultyId = doc.facultyId
            delete doc.facultyId
            return { facultyId: facultyId, fullName: fullName, ...doc }
        })

        res.status(200).json(faculty)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const getFacultyAdvisor = async (req, res) => {

    try {

        let fa = await FacultyModel.find({ fa: true }, { _id: 1, branch: 1, firstName: 1, lastName: 1, title: 1 })

        fa = fa.map((doc) => {
            doc = doc.toObject()
            doc.fullName = ((doc.title ?? "") + " " + doc.firstName + " " + doc.lastName).trim()
            delete doc.firstName
            delete doc.lastName
            delete doc.title
            return doc
        })
        res.status(200).json(fa)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const uploadFaculty = async (req, res) => {

    try {

        let file = req.files.data

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidFacultyDocuments(load)

        let result = await FacultyModel.find({ facultyId: { $in: data.map(doc => doc.facultyId) } }, { facultyId: 1 })

        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.facultyId == rdoc.facultyId) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await facultyCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await facultyUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}


const facultyCreation = async (data) => {

    await FacultyModel.create(data)

}

const facultyUpdation = async (data) => {

    const id = data._id

    delete data._id

    await FacultyModel.updateOne({ _id: id }, data)

    if(data.email)
        await UsersModel.updateOne({userId: id}, {email: data.email})

}


const filterValidFacultyDocuments = (load) => {

    let trash = [], data = [], required = ["facultyId", "email", "mobile", "primaryRole", "branch", "firstName", "lastName"]

    // Filter valid documents
    for (let doc of load) {
        let valid = true
        for (let field of required)
            if (!doc[field]) {
                trash.push({ ...doc })
                valid = false
                break
            }
        valid && data.push({ ...doc })
    }
    return { data, trash }

}


/////////////////////// CURRICULUM MODULE ///////////////////////

const curriculumUpdation = async (data) => {

    const id = data._id

    delete data._id

    await CurriculumModel.updateOne({ _id: id }, data)

}


const curriculumCreation = async (data) => {

    await CurriculumModel.create(data)

}

const filterValidCurriculumDocuments = (load) => {

    let trash = [], data = [], required = ["courseCode", "title", "type", "category", "semester", "regulation", "branch", "type", "hours", "marks"]

    // Filter valid documents
    for (let doc of load) {
        let valid = true
        for (let field of required)
            if (!doc[field]) {
                trash.push({ ...doc })
                valid = false
                break
            }
        valid && data.push({ ...doc })
    }
    return { data, trash }

}

export const uploadCurriculum = async (req, res) => {

    try {

        let file = req.files.data

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidCurriculumDocuments(load)

        let result = await CurriculumModel.find({ courseCode: { $in: data.map(doc => doc.courseCode) } }, { courseCode: 1 })

        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.courseCode == rdoc.courseCode) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await curriculumCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await curriculumUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })




    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getCurriculum = async (req, res) => {

    try {

        let { regulation } = req.query
        let curriculum = await CurriculumModel.find({ regulation: regulation }, { __v: 0, createdAt: 0, updatedAt: 0 })

        res.status(200).json(curriculum)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const updateCurriculum = async (req, res) => {

    try {

        curriculumUpdation(req.body)

        res.status(200).send("Course updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

export const getCurriculumExamFee = async (req, res) => {
    try {
        let data = null
        if(req.query.regulation){
            let result = await ExamFeesModel.findOne({regulation:req.query.regulation},{createdAt:0,updatedAt:0,__v:0})
            if(result){
                data = result
            } else {
                let paymentDetails = {
                    regulation: req.query.regulation,
                    applicationForm: 0,
                    statementOfMarks: 0,
                    consolidateMarkSheet: 0,
                    courseCompletionCertificate: 0,
                    provisionalCertificate: 0,
                    degreeCertificate: 0,
                    otherUniversityFee: 0,
                    courseRegistrationFee: {
                        theory: 0,
                        practical: 0,
                        activity: 0,
                        internship: 0
                    }
                }
                data = await ExamFeesModel.create(paymentDetails)
            }
        }
        res.status(200).json({ success: req.query.regulation ? true : false, message: req.query.regulation ? "Details Fetched" : "Please Choose Regulation", data })
    } catch (err) { res.status(400).json({ success: false, message: err.message }) }
}

export const updateCurriculumExamFee = async (req, res) => {
    try {
        let data = req.body.data
        let id = data._id
        delete data._id
        await ExamFeesModel.updateOne({ _id: id }, data)
            .then((data) => res.status(200).json({ success: true, message: "Data Updated", data }))
            .catch(err => res.status(200).json({ success: false, message: err.message }))

    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: err.message })
    }
}
/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////

export const getHallTicketData = async (req, res) => {

    try {

        let { branch, batch, section, semester } = req.query
        
        let data = await EnrollmentModel.find( { branch:branch, batch:batch, semester:semester, section:section }, {type:1, condonation:1, examEligibility:1,attendancePercentage:1, _id:0 }).populate("courseId", {courseCode:1, courseId:1, "attendanceApproval.hod":1}).populate("studentId", {register:1, firstName:1, lastName:1})

        let temp = await ExamPaymentModel.find( { branch:"IT", batch:batch, semester:semester } ).populate("studentId", {register:1})
        temp = temp.map(item=>item.toObject())
        
        let fees = []
        for(let student of temp) {
            let item = {}
            item.register = student.studentId.register
            item.fee = student.paymentDetails.totalAmount
            item.paymentId = student.referenceId
            fees.push({...item})
        }
            
        //Regulirize data for Front-End
        data = data.map(item => (item.toObject()))
        for(let item of data) {

            item.register = item.studentId.register
            item.name = item.studentId.firstName + " " + item.studentId.lastName
            item.studentId = item.studentId._id
            item.approved = item.courseId.attendanceApproval.hod
            item.courseCode = item.courseId.courseCode
            item.condonationStatus = false
            item.condonationFee = ""
            item.fee = temp[0].paymentDetails.totalAmount
            item.paymentId = temp[0].referenceId

            let attd = parseFloat(item.attendancePercentage.split(" ")[1].slice(0, -1))
            if (item.examEligibility == 1 && attd >= 75) {
                item.eligible = 1
            } else if (item.examEligibility==1&&attd>=50&&item.condonation.status=="approved"){
                item.condonationStatus = true
                item.condonationFee = item.condonation.paymentId
                item.eligible = 1
            } else {
                item.eligible = 0
            }

            delete item.examEligibility
            delete item.attendancePercentage
            delete item.condonation
            delete item.courseId

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

        fees.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        let result = { data, fees }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const postReleaseHallTicket = async (req, res) => {

    try {

        let { studentIds, condonation } = req.body

        await StudentsModel.updateMany( { _id: { $in: studentIds } }, { hallTicketRelease:true } )

        if(condonation=="Condonation Courses") {
            await EnrollmentModel.updateMany( { studentId: { $in: studentIds }, "condonation.status":"approved" }, { hallTicketRelease:true } )
        } else {
            await EnrollmentModel.updateMany( { studentId: { $in: studentIds }, "condonation.status":"Not Required" }, { hallTicketRelease:true } )
        }
        
        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}

export const postFreezeHallTicket = async (req, res) => {

    try {

        let { studentIds, condonation } = req.body

        await StudentsModel.updateMany( { _id: { $in: studentIds } }, { hallTicketRelease:false } )

        //File Generation Pending...
        if(condonation=="Condonation Courses") {
            await EnrollmentModel.updateMany( { studentId: { $in: studentIds }, "condonation.status":"approved" }, { hallTicketRelease:false } )
        } else {
            await EnrollmentModel.updateMany( { studentId: { $in: studentIds }, "condonation.status":"Not Required" }, { hallTicketRelease:false } )
        }
        
        res.status(200).send("Update Success")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


/////////////////////// ENROLLMENT MODULE ///////////////////////
// CE - Course Enrollment
// fetch data to feed the enrollment page 
export const CE_Admin_getenrolledstudentslist = async (req, res) => {
    try {
        const { batch, sem, branch } = req.body

        const data = await EnrollmentModel.find({ batch: batch, branch: branch, semester: sem }, { courseCode: 1, studentId: 1, branch: 1, enrolled: 1, approval: 1, _id: 0 }).populate("courseCode", { courseCode: 1, title: 1 }).populate("studentId", { firstName: 1, register: 1, branch: 1, batch: 1 })

        let result = []
        for (let doc of data) {
            let flag = result.some(rdoc => rdoc.courseCode == doc.courseCode.courseCode)
            if (flag) continue

            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }

        let courses = []
        for (let i of result) {
            let nstudents = []
            let studentcount = 0

            for(let student of i.students){ 
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber: student.studentId.register,
                    studentname: student.studentId.firstName,
                    branch: student.studentId.branch,
                    batch: student.studentId.batch,
                    enrolled: student.enrolled,
                    approval: student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode: i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
                studentsList:nstudents
            }
            courses.push(course)
        }
        res.status(200).json(courses)       
    }catch(error){
        console.log(error);
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// manage approving the students
export const CE_Admin_approvestudents = async (req, res) => {
    try {
        const { courses } = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })

            if (!courseinfo) {
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    success = false  
                    invalidregisternumber.push(student.register)
                    continue
                }

                const enrollmentdata = await EnrollmentModel.findOne({ courseCode: courseinfo._id, studentId: studentinfo._id })

                if (!enrollmentdata) {
                    message = "These Students have not enrolled for given courses"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                if (enrollmentdata.approval == 10 && enrollmentdata.enrolled) {
                    message = "These students are already enrolled/approved"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if (student.approval == -4) {
                    enrollmentdata.enrolled = false
                    enrollmentdata.approval = -4
                }

                if (student.approval == 4) {
                    enrollmentdata.approval = student.approval
                    enrollmentdata.enrolled = true
                } else {
                    enrollmentdata.enrolled = false
                }
                enrollmentdata.courseType = courseinfo.type
                enrollmentdata.courseCategory = courseinfo.category
                const result = await enrollmentdata.save()

                if (!result) {
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }


    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// Adding students to enrollment
export const CE_Admin_addstudents = async (req, res) => {
    try {
        const { courses } = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })

            if (!courseinfo) {
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }

                const foundenrollmentdata = await EnrollmentModel.findOne({ courseCode: courseinfo._id, studentId: studentinfo._id })

                if (foundenrollmentdata) {
                    message = "These Students have already enrolled for given courses"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled: true,
                    approval: 4
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.section = studentinfo.section
                enrollmentdata.regulation = studentinfo.regulation
                if (courseinfo.category == "PE" || courseinfo.category == "OE") {
                    // console.log(course.electiveType)
                    enrollmentdata.courseCategory = course.electiveType
                } else {
                    enrollmentdata.courseCategory = courseinfo.category
                }
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch
                enrollmentdata.courseType = courseinfo.type

                if (studentinfo.currentSemester % 2 == 0) {
                    enrollmentdata.semType = "even"
                } else {
                    enrollmentdata.semType = "odd"
                }

                const newenrollmentdata = new EnrollmentModel(enrollmentdata)

                const result = await newenrollmentdata.save()

                if (!result) {
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// Remove students from enrollment(i.e: The doc will be completely removed)
export const CE_Admin_removestudents = async (req, res) => {
    try {

        const { courses } = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })


            if (!courseinfo) {
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }

                const foundenrollmentdata = await EnrollmentModel.findOneAndDelete({ courseCode: courseinfo._id, studentId: studentinfo._id })
                console.log(foundenrollmentdata)

            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

export const CE_Admin_QuerySelection = async (req, res) => {
    try {

        let enrolledList = await EnrollmentModel.find({ batch: req.query.batch }, { type:1,courseType:1, courseCategory:1, courseCode:1, studentId:1, branch:1, batch:1, regulation:1, semester:1, enrolled:1, approval:1}).populate("courseCode", { courseCode:1, title:1  }).populate("studentId", { register:1, degree:1, section:1, firstName:1, lastName:1, type:1})
        enrolledList = enrolledList.map(doc => {
            doc = doc.toObject()
            let student = doc.studentId
            let course = doc.courseCode
            delete doc.studentId
            delete doc.courseCode
            doc = { ...student, ...course, ...doc }
            return doc
        })

        res.status(200).json({ "success": true, "results": enrolledList })

    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, "Request Failed": err.message })
    }
}

const CE_filterValidEnrolmentDocuments = (load) => {

    let trash = [], data = [], required = ["courseCode", "register", "semester"]

    // Filter valid documents
    for (let doc of load) {
        let valid = true
        for (let field of required)
            if (!doc[field]) {
                trash.push({ ...doc })
                valid = false
                break
            }
        valid && data.push({ ...doc })
    }
    return { data, trash }

}

export const CE_uploadEnrolmentData = async (req, res) => {

    try {

        let file = req.files.data

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = CE_filterValidEnrolmentDocuments(load)

        let students = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { _id: 1, register: 1, regulation: 1, batch: 1, branch: 1 }).lean()
        let courses = await CurriculumModel.find({ courseCode: { $in: data.map(doc => doc.courseCode) } }, { _id: 1, courseCode: 1, type: 1, category: 1 }).lean()
        let result = await EnrollmentModel.find({ studentId: { $in: students.map(doc => doc._id) }, courseCode: { $in: courses.map(doc => doc._id) } }).populate("courseCode studentId", { createdAt: 0, updatedAt: 0, __v: 0 }).lean()
        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.register == rdoc.studentId.register && doc.courseCode == rdoc.courseCode.courseCode) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            }

            if(flag){
                let studentId = students.find((student)=>student.register==doc.register)
                let courseCode = courses.find((course)=>course.courseCode==doc.courseCode)
                if(studentId==undefined){
                    trash.push({...doc, message:"student Register not found in db"})
                    continue
                } else if (courseCode == undefined) {
                    trash.push({ ...doc, message: "Course Code was not found in db" })
                    continue
                }
                flag && create.push({ ...doc, type: doc.type ? doc.type : "normal", studentId: studentId._id, branch: studentId.branch, batch: studentId.batch, regulation: studentId.regulation, courseCode: courseCode._id, courseType: courseCode.type, courseCategory: doc.courseCategory ? doc.courseCategory : courseCode.category, enrolled:doc.enrolled ? doc.approval && doc.approval>2 && true : false , approval: doc.approval ? doc.approval : 4, semType: doc.semester%2==0 ? "even" : "odd" })
            }
        }

        // Creation
        if (create.length > 0) await CE_enrolmentCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await CE_enrolmentUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }
        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) {
        res.status(400).send('Request Failed: ' + err.message)
    }
}

const CE_enrolmentCreation = async (data) => {
    data.map(async (doc) => {
        await EnrollmentModel.create(doc)
    })

}

const CE_enrolmentUpdation = async (data) => {

    const id = data._id

    delete data._id
    delete data.courseCode
    delete data.register

    await EnrollmentModel.updateOne({ _id: id }, data)

}

export const CE_enrolmentUpdateData = async (req,res) => {

    const newData = req.body
    let existingData = await EnrollmentModel.findById(newData._id)
    existingData.approval = newData.approval
    existingData.enrolled = newData.enrolled
    existingData.courseCategory = newData.courseCategory
    existingData.semester = newData.semester
    existingData.type = newData.type
    await existingData.save().then(() => res.status(200).json({success:true,message:"Enrollment Collection Updated successfully"})).catch((err)=>res.status(200).json({success:false,message:"Unable to update the document "+err.message}))

}


/////////////////////// RESULT MODULE ///////////////////////

// Display students

export const Result_Admin_GetResults = async(req, res) => {
    try{
        let registeredStudents =[], results = []
        if(!req.query.batch){
            res.status(200).json({success:false,message:"Choose Batch",results})
        }else{

            
        // Retrieve list of registered students for the given batch
        await StudentsModel.find({batch:req.query.batch}).then(data => {
            data.map((d,k)=>{
                registeredStudents.push(d._id)
            })
        })

        // Fetch external exam results for registered students and populate studentId and courseId fields
        const externalsdata = await ExternalsModel.find({studentId:{$in:registeredStudents}}).populate("studentId courseId")

        // Retrieve semester data for each student's course from EnrollmentModel and create results object
        for(let d of externalsdata){
            await EnrollmentModel.findOne({studentId:d.studentId._id, courseCode:d.courseId._id},{semester:1}).then((enrollmentData)=>{ 
                // console.log(enrollmentData);
                if(enrollmentData){
                    results.push({
                        _id:d._id,
                        regulation:d.studentId.regulation || "NA",
                        batch : d.studentId.batch || "NA",
                        branch : d.studentId.branch || "NA",
                        studentId: d.studentId._id,
                        courseId:d.courseId._id,
                        semester:enrollmentData.semester || "NA",
                        RegisterNumber: d.studentId.register || "NA",
                        Name: d.studentId.firstName || "NA",
                        studentType:d.studentId.type || "NA",
                        courseCode: d.courseId.courseCode || "NA",
                        courseTitle:d.courseId.title || "NA",
                        courseCategory:d.courseId.category || "NA",
                        attempt:d.attempt ? d.attempt: "NA",
                        result:d.result?d.result : "NA",
                        gradePoints:d.gradePoints?d.gradePoints:"NA",
                        letterGrade:d.letterGrade?d.letterGrade: "NA"
                    })
                }    
            }).catch(err=>console.log(err))
        }    
        res.status(200).json({success:true,message:"success",results})
    }
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:error.message})
    }
}

// Upload students
export const Result_Admin_Upload = async (req, res) => {
    try {
        let file = req.files.data
        let load = await excelToJson(file)

        let cnt = 0
        for (let student of load) {
            cnt++
            const studentinfo = await StudentsModel.findOne({ register: student.register })
            if (studentinfo) {
                // console.log(studentinfo)
                const courseincurriculumm = await CurriculumModel.findOne({ courseCode: student.courseCode })
                // const courseincurriculumm = await EnrollmentModel.find({courseCode:student.courseCode}).populate("studentId courseCode")

                if (courseincurriculumm) {
                    const externalsData = await ExternalsModel.findOne({ studentId: studentinfo._id, courseId: courseincurriculumm._id })
                    //console.log(externalsData)
                    if (!externalsData) {
                        //////new data
                        const Studentdata = {
                            studentId: studentinfo._id,
                            courseId: courseincurriculumm._id,
                            attempt: student.attempt,
                            result: student.result
                        }
                        const studata = new ExternalsModel(Studentdata)
                        const result = await studata.save()
                        console.log(result)
                        if (student.result == "P") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "normal"
                                await enrollmentData.save()
                                // continue
                            }
                        }
                        if (student.result == "RA") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "RA"
                                await enrollmentData.save()
                                // console.log(res)

                            }
                        }
                        if (student.result == "SA") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "SA"
                                await enrollmentData.save()
                                // console.log(res)

                            }
                        }
                    }
                    else {
                        // console.log(student.attempt)
                        externalsData.attempt = student.attempt
                        externalsData.result = student.result
                        if (student.letterGrade) {
                            externalsData.letterGrade = student.letterGrade
                        }
                        if (student.gradePoints) {
                            externalsData.gradePoints = student.gradePoints
                        }
                        await externalsData.save()
                        // console.log(res) 
                        if (student.result == "RA") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "RA"
                                await enrollmentData.save()
                                // console.log(res)

                            }
                        }
                        if (student.result == "SA") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "SA"
                                await enrollmentData.save()
                                // console.log(res)

                            }
                        }
                        if (student.result == "P") {
                            const enrollmentData = await EnrollmentModel.findOne({ studentId: studentinfo._id, courseCode: courseincurriculumm._id })
                            if (enrollmentData) {
                                enrollmentData.type = "normal"
                                await enrollmentData.save()
                                // continue
                            }
                        }
                    }
                }
                else {
                    ///course code not available in database
                    console.log("Coursecode was not in curriculum database")
                }
            }
        }
        res.status(200).json({success:true, msg:"Results pushed into database"})
    }
        catch(error){
        console.log(error);
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}


export const Result_Admin_updateStudent = async(req, res) => {
    try{
        console.log(req.body)
        const data = req.body
        if (data.letterGrade == "NA") {
            data.letterGrade = ''
        }
        if (data.gradePoints == "NA") {
            data.gradePoints = ''
        }
        const externalsdata = {
            // studentId:data.studentId,
            // courseId:data.courseId,
            letterGrade: data.letterGrade,
            attempt: data.attempt,
            result: data.result,
            gradePoints: data.gradePoints
        }

        await ExternalsModel.updateOne({ _id: data._id }, externalsdata)

        const enrollmentData = {}
        if (data.result == 'RA') {
            enrollmentData.type = "RA"
        } else if (data.result == "SA") {
            enrollmentData.type = "SA"
        } if (data.result == 'P') {
            enrollmentData.type = "normal"
        }
        
        await EnrollmentModel.updateOne({ studentId: data.studentId, courseCode:data.courseId }, enrollmentData)
        res.status(200).json({success:true, message:"Result Updated"})
    } catch (err) { 
        console.log(err)
        res.status(400).json({success:true, message:"Unable to update result " + err.message})
    }
}


/////////////////////// REGISTRATION MODULE ///////////////////////

// Fetch and send registered students list..
export const CR_Admin_getRegisteredstudentslist = async (req, res) => {
    try {
        const { batch, sem, branch } = req.body
        const data = await EnrollmentModel.find({batch:batch, branch:branch,semester:sem,enrolled:true,approval:{$in:[-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
        let result = []
        for (let doc of data) {
            let flag = result.some(rdoc => rdoc.courseCode == doc.courseCode.courseCode)
            if (flag) continue

            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }

        let courses = []
        for (let i of result) {
            let nstudents = []
            let studentcount = 0
            for (let student of i.students) {

                studentcount = studentcount + 1
                const nstudent = {
                    registernumber: student.studentId.register,
                    studentname: student.studentId.firstName,
                    branch: student.studentId.branch,
                    batch: student.studentId.batch,
                    enrolled: student.enrolled,
                    approval: student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode: i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled: studentcount,
                studentsList: nstudents
            }
            courses.push(course)
        }

        res.status(200).json(courses)  
    }catch(error){
        console.log(error);
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// Approve registered students
export const CR_Admin_approvestudents = async (req, res) => {
    try {
        const { courses } = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })

            if (!courseinfo) {
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    console.log(message)
                    success = false

                    invalidregisternumber.push(student.register)
                    continue
                }

                const enrollmentdata = await EnrollmentModel.findOne({ courseCode: courseinfo._id, studentId: studentinfo._id })

                if (!enrollmentdata) {
                    message = "These Students have not enrolled for given courses"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if (enrollmentdata.approval == 14 && enrollmentdata.enrolled) {
                    message = "These students are already enrolled && approved"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if (student.approval == -14) {
                    enrollmentdata.approval = -14
                }

                if (student.approval == 14) {
                    enrollmentdata.approval = student.approval
                }
                enrollmentdata.courseType = courseinfo.type
                enrollmentdata.courseCategory = courseinfo.category
                const result = await enrollmentdata.save()

                if (!result) {
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }


    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// Add students to the registration
export const CR_Admin_addstudents = async (req, res) => {
    try {
        const { courses } = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })

            if (!courseinfo) {
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }

                const foundenrollmentdata = await EnrollmentModel.findOne({ courseCode: courseinfo._id, studentId: studentinfo._id })

                if (foundenrollmentdata) {
                    message = student.register + "This Student have already registeredfor given course " + course.courseCode
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled: true,
                    approval: 14
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.regulation = studentinfo.regulation
                enrollmentdata.courseCategory = courseinfo.category
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch

                if (studentinfo.currentSemester % 2 == 0) {
                    enrollmentdata.semType = "even"
                } else {
                    enrollmentdata.semType = "odd"
                }

                const newenrollmentdata = new EnrollmentModel(enrollmentdata)

                const result = await newenrollmentdata.save()

                if (!result) {
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}

// Remove from registration
// The students will be pushed back to enrollment phase
export const CR_Admin_removestudents = async (req, res) => {
    try {

        const { courses } = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for (let course of courses) {
            const courseinfo = await CurriculumModel.findOne({ courseCode: course.courseCode })


            if (!courseinfo) {
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for (let student of course.students) {

                const studentinfo = await StudentsModel.findOne({ register: student.register })

                if (!studentinfo) {
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }

                const foundenrollmentdata = await EnrollmentModel.findOne({ courseCode: courseinfo._id, studentId: studentinfo._id })
                if (foundenrollmentdata) {
                    foundenrollmentdata.approval = 4
                    await foundenrollmentdata.save()
                }else{
                    console.log("The enrollment Collection was not found for student" + studentinfo.register + " for coursecode: "+ courseinfo.courseCode)
                }
            }
        }

        if (!success) {
            res.status(200).json({ success: success, message: message, invalidCourseCode, invalidregisternumber })
        }
        else {
            res.status(200).json({ success: success, message: message })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: error });
    }
}


/////////////////////// EXAM FEE MODULE ///////////////////////

const calculateExamFees = async (data) => {
    return await ExamFeesModel.findOne({ regulation: data }, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }).lean().then((doc) => {
        let courseRegistrationFee = doc.courseRegistrationFee
        delete doc.courseRegistrationFee
        delete doc.regulation
        return { ...doc, ...courseRegistrationFee };
    })
}

export const examFee_getData = async(req,res)=>{
    try{
        if(req.query.batch == undefined || req.query.semester == undefined){
            res.status(200).json({success:false, message:"Please choose batch and semester"})
        }
        else{
            let result=[],organizedDatas=[],courseDetails=[],uniqueCourseDetails=[], amountDetails=null;
            let data = await EnrollmentModel.find({batch:req.query.batch,semester:req.query.semester,approval:{$in:[13,14]},enrolled:true},{enrolled:1,approval:1,semester:1}).populate("studentId",{section:1,register:1,regulation:1,batch:1,firstName:1,email:1}).populate("courseCode", {courseCode:1,_id:0,type:1})
            let paymentDetails = await ExamPaymentModel.find({batch:req.query.batch,semester:req.query.semester}).populate("studentId",{register:1})
            for(let doc of data){
                doc = doc.toObject()
                let student = doc.studentId
                let course = doc.courseCode.courseCode
                let courseDetail = doc.courseCode
                delete doc.studentId
                delete doc.courseCode
                doc = {...student, courseCode:course, ...doc}
                organizedDatas.push(doc)
                courseDetails.push(courseDetail)
            }
            for(let doc of courseDetails){
                let flag = uniqueCourseDetails.some(rdoc => rdoc.courseCode == doc.courseCode)
                if(flag){
                    continue
                }else{
                    uniqueCourseDetails.push(doc)
                }
            }
            for(let doc of organizedDatas){
                let flag = result.some(rdoc => rdoc.register == doc.register)
                if(flag){
                    continue
                }
                else{
                    doc.courses = []
                    doc.amount = 0
                    for(let rdoc of paymentDetails){
                        if(rdoc.studentId.register == doc.register){
                            doc.amount = rdoc.paymentDetails.totalAmount
                        }
                    }
                    for(let ndoc of organizedDatas){
                        if(ndoc.register == doc.register){
                            if(ndoc.courseCode == undefined){
                                continue
                            }else{
                                doc['courses'].push(ndoc.courseCode)
                            }

                        }
                    }
                }
                doc.totalCourses = doc['courses'].length
                delete doc.courseCode
                result.push(doc)
            } 
            if(organizedDatas[0]){
                amountDetails = await calculateExamFees(organizedDatas[0].regulation)
            }

            res.status(200).json({success:true, data:result,feeDetails:amountDetails,courseDetails:uniqueCourseDetails,paymentDetails:paymentDetails})
        }
        }catch(err){

        console.log(err)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: err.message });
    }
}

export const examFee_downloadData = async (req, res) => {
    let { ids } = req.query
    let data = await EnrollmentModel.find({ batch: ids[0], semester: ids[1], approval: { $in: [13, 14] } }, { semester: 1 }).populate("studentId", { _id: 0, register: 1, branch: 1 }).populate("courseCode", { courseCode: 1, _id: 0 })
    let paymentDetails = await ExamPaymentModel.find({ batch: ids[0], semester: ids[1] }).populate("studentId", { register: 1 })
    let result = [], organizedDatas = [], courseDetails = [], uniqueCourseDetails = []
    for (let doc of data) {
        doc = doc.toObject()
        let student = doc.studentId
        let course = doc.courseCode.courseCode
        let courseDetail = doc.courseCode
        delete doc.studentId
        delete doc.courseCode
        doc = { ...student, courseCode: course, ...doc }
        organizedDatas.push(doc)
        courseDetails.push(courseDetail)
    }
    for (let doc of courseDetails) {
        let flag = uniqueCourseDetails.some(rdoc => rdoc.courseCode == doc.courseCode)
        if (flag) {
            continue
        } else {
            uniqueCourseDetails.push(doc)
        }
    }
    for (let doc of organizedDatas) {
        let flag = result.some(rdoc => rdoc.register == doc.register)
        if (flag) {
            continue
        }
        else {
            doc.courses = []
            for (let rdoc of paymentDetails) {
                if (rdoc.studentId.register == doc.register) {
                    let paymentDetails = rdoc.paymentDetails
                    // let courseRegistrationFee = paymentDetails.courseRegistrationFee
                    // delete paymentDetails.courseRegistrationFee
                    // paymentDetails.courseRegistrationFee = courseRegistrationFee
                    // doc = {...doc, ...paymentDetails}
                    doc.paymentDetails = paymentDetails
                }
            }
            for (let ndoc of organizedDatas) {
                if (ndoc.register == doc.register) {
                    if (ndoc.courseCode == undefined) {
                        continue
                    } else {
                        doc['courses'].push(ndoc.courseCode)
                    }
                }
            }
        }
        doc.totalCourses = doc['courses'].length
        delete doc.courseCode
        result.push(doc)
    }
    let blob = jsonToExcel(result)
    res.status(200).send(blob)
}

export const examFee_updateamount = async (req, res) => {
    try {
        let docs = req.body.updatedData
        for (let doc of docs) {
            let studentDetail = await StudentsModel.findOne({ register: doc.register })
            let paymentDetail = await ExamPaymentModel.findOne({ studentId: studentDetail._id, semester: doc.semester })
            if (paymentDetail) {
                paymentDetail.paymentDetails = doc.paymentDetails
                await paymentDetail.save()
            } else {
                const obj = {
                    studentId: studentDetail._id,
                    paymentDetails: doc.paymentDetails,
                    referenceId: "-",
                    batch: doc.batch,
                    branch: studentDetail.branch,
                    semester: doc.semester
                }
                const newDocument = new ExamPaymentModel(obj)
                await newDocument.save()
            }
        }
   
        res.status(200).json({success:true,message:"Documents updated successfully"})
    }catch (err) { 

        console.log(err);
        res.status(400).send('Request Failed: ' + err.message)
    }
}

const examFeePayment_format = (res) => {
    let data = []
    res.map((doc) => {
        let student = doc.studentId;
        delete doc.studentId
        doc = { ...student, ...doc }
        data.push(doc)
    })
    return data;
}
export const examFeePayment_getData = async (req, res) => {
    try {
        let data = []
        await ExamPaymentModel.find({ batch: req.query.batch }, { semester: 1, paymentDetails: 1, paid: 1, date: 1, referenceId: 1 }).populate("studentId", { section: 1, register: 1, branch: 1, firstName: 1, lastname:1}).lean().then((res) => {
            data = examFeePayment_format(res)
        })
        res.status(200).json({ data: data })
    } catch (err) {
        console.log(err)
        res.status(400).json({ success: false, message: "Something wrong happened", Error: err.message });
    }
}


const examFeePayment_filterValidPaymentDocuments = (load) => {

    let trash = [], data = [], required = ["register", "referenceId", "semester", "paymentDetails_applicationForm", "paymentDetails_courseRegistrationFee_practical", "paymentDetails_courseRegistrationFee_activity", "paymentDetails_courseRegistrationFee_internship", "paymentDetails_courseRegistrationFee_total", "paymentDetails_statementOfMarks", "paymentDetails_consolidateMarkSheet", "paymentDetails_courseCompletionCertificate", "paymentDetails_provisionalCertificate", "paymentDetails_degreeCertificate", "paymentDetails_otherUniversityFee", "paymentDetails_totalAmount"]

    // Filter valid documents
    for (let doc of load) {
        let valid = true
        for (let field of required) {
            if (!doc[field]) {
                trash.push({ ...doc, message: `Innappropriate Field: ${field} is required` })
                valid = false
                break
            }
            valid && data.push({ ...doc })
        }
    }
    return { data, trash }

}

export const examFeePayment_uploadData = async (req, res) => {

    try {

        let file = req.files.data

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = examFeePayment_filterValidPaymentDocuments(load)
        // await ExamPaymentModel.deleteMany({})
        let students = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { _id: 1, register: 1, regulation: 1, batch: 1, branch: 1 }).lean()
        let result = await ExamPaymentModel.find({ studentId: { $in: students.map(doc => doc._id) } }).populate("studentId", { createdAt: 0, updatedAt: 0, __v: 0 }).lean()

        // Find existing documents
        for (let doc of data) {
            let flag = true
            let student = students.find(student => student.register == doc.register)
            if (!student) {
                trash.push({ ...doc, message: "student Register not found in db" })
                continue
            }
            let studentId = student._id
            delete student._id
            delete student.register
            for (let rdoc of result) {
                if (doc.register == rdoc.studentId.register) {
                    delete doc.register
                    update.push({ _id: rdoc._id, ...doc, studentId, ...student })
                    flag = false
                    break
                }
            }
            if (flag) {
                flag && create.push({ ...doc, studentId, ...student })
            }
        }
        // Creation
        if (create.length > 0) await examFeePayment_Creation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await examFeePayment_Updation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        // if(trash.length>0){
        //    let blob = CE_sendInvalidRowsAsExcel([...trash])
        // }

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) {
        console.log(err);
        res.status(400).send('Request Failed: ' + err.message)
    }
}



const examFeePayment_Creation = async (data) => {

    data.map(async (doc) => {
        await ExamPaymentModel.create(doc)
    })

}

const examFeePayment_Updation = async (data) => {
    let id = data._id
    delete data._id
    await ExamPaymentModel.updateOne({ _id: id }, data)

}

export const examFeePayment_updatePayment = async (req, res) => {
    try {
        const data = req.body
        let document = await ExamPaymentModel.findOne({ _id: data._id })
        document.date = data.date
        document.referenceId = data.referenceId
        document.paid = data.paid == "YES" ? true : false
        await document.save()
            .then((updatedDoc) => res.status(200).json({ success: true, message: "Data Updated", updatedDoc }))
            .catch((err) => res.status(200).json({ success: false, message: err.message }))

    } catch (err) {
        console.log(err)
        res.status(400).send("Request Failed: " + err.message)
    }
}

/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////

export const getFeedback = async (req, res) => {

    try {

        let params = req.query

        let data = await FeedbackModel.find({ batch: params.batch, sem: params.sem }, { __v: 0, createdAt: 0, updatedAt: 0,  batch: 0, semester: 0 }).populate("facultyId", { firstName: 1, lastName: 1, title: 1 }).populate("studentId", { register: 1, section: 1, _id: 0 }).populate("courseId", {courseCode: 1 }).lean()

        let report = {}

        // Customising the response
        data.forEach((doc) => {
            doc.courseCode = doc.courseId.courseCode
            if (!report[doc.branch]) report[doc.branch] = {}
            if (!report[doc.branch][doc.studentId.section]) report[doc.branch][doc.studentId.section] = {}
            if (!report[doc.branch][doc.studentId.section]["submitted"]) report[doc.branch][doc.studentId.section]["submitted"] = []
            if (!report[doc.branch][doc.studentId.section]["yetToSubmit"]) report[doc.branch][doc.studentId.section]["yetToSubmit"] = []

            if (doc.submitted) {

                report[doc.branch][doc.studentId.section]["submitted"].push(doc.studentId.register)
                let unique = new Set(report[doc.branch][doc.studentId.section]["submitted"])
                report[doc.branch][doc.studentId.section]["submitted"] = [...unique]

                if (!report[doc.branch][doc.studentId.section][doc.courseId._id]) report[doc.branch][doc.studentId.section][doc.courseId._id] = {}
                report[doc.branch][doc.studentId.section][doc.courseId._id]["faculty"] = doc.facultyId.title + doc.facultyId.firstName + doc.facultyId.lastName
                report[doc.branch][doc.studentId.section][doc.courseId._id]["courseCode"] = doc.courseCode
                report[doc.branch][doc.studentId.section][doc.courseId._id]["courseType"] = doc.courseType
                report[doc.branch][doc.studentId.section][doc.courseId._id]["courseTitle"] = doc.courseTitle
                
                if (!report[doc.branch][doc.studentId.section][doc.courseId._id]["count"]) report[doc.branch][doc.studentId.section][doc.courseId._id]["count"] = 0
                report[doc.branch][doc.studentId.section][doc.courseId._id]["count"] += 1

                if (!report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]) report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"] = {}
                if (!report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"]){ 
                    report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"] = {}
                    report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"]["obtained"] = 0
                    report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"]["allotted"] = 0
            }
                report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"]["obtained"] += doc.total.obtained
                report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]["total"]["allotted"] += doc.total.allotted
                Object.keys(doc.score).forEach((type) => {
                    let summary = report[doc.branch][doc.studentId.section][doc.courseId._id]["summary"]
                    if (!summary[type]) summary[type] = {}
                    Object.keys(doc.score[type]).forEach((key)=>{
                        if(!summary[type][key]) summary[type][key] = 0
                        summary[type][key] += doc.score[type][key]
                    })
                })
            }
            else {
                report[doc.branch][doc.studentId.section]["yetToSubmit"].push(doc.studentId.register)
                let unique = new Set(report[doc.branch][doc.studentId.section]["yetToSubmit"])
                report[doc.branch][doc.studentId.section]["yetToSubmit"] = [...unique]
            }



        })

        res.status(200).json(report)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

const changeToLocalTime = (date) => {
    date = new Date(date)
    date.setHours(date.getHours() + 5)
    date.setMinutes(date.getMinutes() + 30)
    return date
}

export const manageFeedback = async (req, res) => {

    try {

        let params = req.body
        params.start = changeToLocalTime(params.start)
        params.end = changeToLocalTime(params.end)
        if (params.create) {
            let data = await EnrollmentModel.find({ batch: params.batch, type: "normal", semester: params.sem, enrolled: true, courseType: "theory", approval: { $in: [13, 14] } }, { studentId: 1, batch: 1, branch: 1, semester: 1 }).populate("courseId", { facultyId: 1, type: 1 }).populate("courseCode", { title: 1 }).lean()
            let questions = await FeedbackQuestionsModel.find({}, { _v: 0, createdAt: 0, updatedAt: 0 }).lean()
            let theory = [], practical = []
            questions.forEach((question) => (question.courseType.toLowerCase() == "theory") ? theory.push({ questionId: question._id, type: question.type }) : practical.push({ questionId: question._id, type: question.type }))
            data = data.map((doc) => {
                doc.facultyId = doc.courseId.facultyId
                doc.courseTitle = doc.courseCode.title
                doc.feedback = doc.courseId.type.toLowerCase() == "theory" ? theory : practical
                doc.courseId = doc.courseId._id
                return doc
            })
            await FeedbackModel.create(data)
        }
        await SemesterMetadataModel.updateOne({ batch: params.batch, sem: params.sem }, { feedback: { start: params.start, end: params.end } })
        res.status(200).send("Feedback created successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const uploadFeedbackQuestions = async (req, res) => {

    try {

        let file = req.files.data

        let load = await excelToJson(file)

        await FeedbackQuestionsModel.deleteMany()

        await FeedbackQuestionsModel.create(load)

        let documents = {
            total: load.length,
            created: load.length,
            update: 0,
            trash: 0
        }

        res.status(200).json({ documents, trash: [] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

/////////////////////// PROFILE ////////////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query

        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })

        res.status(200).json(profile)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

export const updateProfile = async (req, res) => {

    try {

        facultyUpdation(req.body)

        res.status(200).send("Profile updated successfully")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}


/////////////////////// REQUEST MODULE ////////////////////////////
export const getRequests = async (req, res) => {

    try {

        let { facultyId } = req.query

        let requests = await RequestsModel.find({ to: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 }).sort({ createdAt: 'desc' })

        res.status(200).json(requests)


    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const updateFacultyProfile = async (req, res) => {

    try {

        let data = req.body
        data.body = JSON.parse(data.body)

        if (data.approved) await FacultyModel.updateOne({ _id: data.from }, { ...data.body.new, requestId: "" })
        else await FacultyModel.updateOne({ _id: data.from }, { requestId: "" })

        if(data.body.new.email)
            await UsersModel.updateOne({userId: data.from}, {email: data.body.new.email})

        res.status(200).send("Requested profile updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}
