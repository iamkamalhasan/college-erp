import mongoose from "mongoose"

const { Schema, model } = mongoose

const EnrollmentSchema = new Schema({

    type: { type: String, required: true },

    courseType: { type: String, required: true },

    semType: { type: String, required: true },

    courseCode: { type: Schema.Types.ObjectId, required: true, ref: 'Curriculum' },

    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    courseId: { type: Schema.Types.ObjectId, ref: 'CourseDetails' },

    regulation: { type: Number, required: true },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    section: { type: String, default: "A" },

    semester: { type: Number, required: true },

    courseCategory: { type: String, required: true },

    enrolled: { type: Boolean, default: false },

    approval: { type: Number, default: 0 },

    groupNo: { type: Number, default: 1 },

    attendancePercentage: { type: String, default: "0/0 0.00%" },

    condonation: {

        status: String,
    
        approvedOn: Schema.Types.Date,
    
        paymentId: String 
    
    },

    examEligibility: { type: Number, default: 0 },

    hallTicketRelease: { type:Boolean, default:false },

    feedbackEnabled: { type: Boolean, default: false },
    
}, { collection: "Enrollment", timestamps: true })


export const EnrollmentModel = model('Enrollment', EnrollmentSchema)
