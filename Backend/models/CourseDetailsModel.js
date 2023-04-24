import mongoose from "mongoose"

const { Schema, model } = mongoose

const CourseDetailsSchema = new Schema({

    semType: { type: String, required: true },

    semester: { type: Number, required: true },

    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty' },

    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Curriculum' },

    courseCode: { type:String, required:true},

    type: { type: String, required: true },

    branch: { type: String, required: true },

    section: { type: String, default: "A" },

    batch: { type: Number, required: true },

    groupNo: { type: Number, default: 1 },

    schedule: { type: [Number] },

    newSchedule: {
        
        effectiveDate: { type:Schema.Types.Date },
        
        schedule: { type: [Number] }
    
    },

    freezeAttendance: {

        save: { type:Number, default: 0 },

        startDate: { type: Schema.Types.Date, default: null },
        
        endDate: { type: Schema.Types.Date, default: null },
    
    },

    hodFreeze: {

        attendance: { type: Boolean, default: false },

        internals: { type: Boolean, default: false }

    },

    attendanceApproval: {

        ci: { type: Boolean, default: false },

        fa: { type: Boolean, default: false },

        hod: { type: Boolean, default: false }

    },

    unitSchedule: [ {
        date: { type: Schema.Types.Date, default: null },

        number: { type: Number },

        session: { type: String },

        type: { type: String },

        students: { type: [Schema.Types.ObjectId], default: null, ref: 'Students' }
    } ]

}, { collection: "CourseDetails", timestamps: true })


export const CourseDetailsModel = model('CourseDetails', CourseDetailsSchema)