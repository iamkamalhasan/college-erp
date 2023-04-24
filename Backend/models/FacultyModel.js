import mongoose from "mongoose"

const { Schema, model } = mongoose

const FacultySchema = new Schema({

    facultyId: { type: String, required: true, unique: true },

    type: { type: String, default: "" },

    email: { type: String, required: true },

    mobile: { type: String, required: true },

    isActive: { type: Boolean, default: false },

    cfa: { type: Boolean, default: false },

    hod: { type: Boolean, default: false },

    pc: { type: Boolean, default: false },

    ttc: { type: Boolean, default: false },

    fa: { type: Boolean, default: false },

    ci: { type: Boolean, default: false },

    primaryRole: { type: String, required: true },

    branch: { type: String, required: true },

    title: { type: String, default: "" },

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    address: { type: String, default: "" },

    requestId: { type: String, default: null }

}, { collection: "Faculty", timestamps: true })


export const FacultyModel = model('Faculty', FacultySchema)