import mongoose from "mongoose"

const { Schema, model } = mongoose

const ValueAddedCourseSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    semester: { type: Number, required: true },

    type: { type: String, required: true },

    value: { type: Number, required: true }

}, { collection: "ValueAddedCourse", timestamps: true })


export const ValueAddedCourseModel = model('ValueAddedCourse', ValueAddedCourseSchema)