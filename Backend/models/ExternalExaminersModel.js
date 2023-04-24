import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExternalExaminersSchema = new Schema({
    
    facultyId: { type: String, required: true },

    facultyType: { type: String },

    isActive: { type: Boolean, default: false },

    email: { type: String },
    
    mobile: { type: String },

    college: { type: String },

    branch: { type: String },

    firstName: { type: String },

    lastName: { type: String },

    collegeAddress: { type: String },

    residentialAddress: { type: String }

}, { collection: "ExternalExaminers", timestamps: true })


export const ExternalExaminersModel = model('ExternalExaminers', ExternalExaminersSchema)