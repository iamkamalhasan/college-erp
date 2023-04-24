import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExternalsSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Curriculum' },

    letterGrade: { type: String },

    attempt: { type: Number, default: 0 },

    result: { type: String },

    gradePoints: { type: Number }

}, { collection: "Externals", timestamps: true })


export const ExternalsModel = model('Externals', ExternalsSchema)