import mongoose from "mongoose"

const { Schema, model } = mongoose

const AdminSchema = new Schema({
    
    adminId: { type: String, required: true, unique: true },

    email: { type: String, required: true },

    mobile: { type: String, required: true },

    isActive: { type: Boolean, default: false },
    
    title: { type: String },

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    address: { type: String }
    
}, { collection: "Admin", timestamps: true })


export const AdminModel = model('Admin', AdminSchema)