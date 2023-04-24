import mongoose from "mongoose"

const { Schema, model } = mongoose

const StudentsSchema = new Schema({

    register: { type: String, required: true, unique: true },

    regulation: { type: Number, required: true },

    batch: { type: Number, required: true },

    degree: { type: String, required: true },

    branch: { type: String, required: true },

    section: { type: String, default: "A" },

    currentSemester: { type: Number, required: true },

    email: { type: String, default: "" },

    mobile: { type: String, default: "" },

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    dob: { type: String, required: true },

    type: { type: String, default: "regular" },

    status: { type: String, default: "active" },

    isActive: { type: Boolean, default: false },

    masterAttendance: {

        sem_1: { type: String, default: "0/0 0.00%" },

        sem_2: { type: String, default: "0/0 0.00%" },

        sem_3: { type: String, default: "0/0 0.00%" },

        sem_4: { type: String, default: "0/0 0.00%" },

        sem_5: { type: String, default: "0/0 0.00%" },

        sem_6: { type: String, default: "0/0 0.00%" },

        sem_7: { type: String, default: "0/0 0.00%" },

        sem_8: { type: String, default: "0/0 0.00%" }
        
    },
    
    hallTicketRelease: { type: Boolean, default: false },

    requestId: { type: String, default: "" }

}, { collection: "Students", timestamps: true })


export const StudentsModel = model('Students', StudentsSchema)
