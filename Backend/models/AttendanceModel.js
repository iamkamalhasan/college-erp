import mongoose from "mongoose"

const { Schema, model } = mongoose

const AttendanceSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    masterTimetableId: { type:Schema.Types.ObjectId, required:true, ref: 'MasterTimetable' },

    courseId: { type:Schema.Types.ObjectId, required:true, ref:'CourseDetail' },
    
    courseCode: { type: String, required: true },

    branch: { type: String, required: true },

    section: { type: String, default: "A" },

    batch: { type: Number, required: true },

    date: { type: Schema.Types.Date, required: true },

    period: { type: Number, required: true },

    present: { type: Boolean, default: false },

    onduty: { type: Boolean, default: false }

}, { collection: "Attendance", timestamps: true })


export const AttendanceModel = model('Attendance', AttendanceSchema)