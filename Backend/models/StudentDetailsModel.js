import mongoose from "mongoose"

const { Schema, model } = mongoose 

const StudentDetailsSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    NADId: { type: String, default:  "" },

    gender: { type: String, default:  "" },

    father: {
    
        name: { type: String, default:  "" },

        mobile: { type: String, default:  "" },

        occupation: { type: String, default:  "" },

        income: { type: String, default:  "" }
    },

    mother: {

        name: { type: String, default:  "" },

        mobile: { type: String, default:  "" },

        occupation: { type: String, default:  "" },

        income: { type: String, default:  "" }
    },

    guardian: {

        name: { type: String, default:  "" },

        mobile: { type: String, default:  "" },

        occupation: { type: String, default:  "" },

        income: { type: String, default:  "" }
    },

    permanentAddress: { type: String, default:  "" },

    temporaryAddress: { type: String, default:  "" },

    aadhaar: { type: String, default:  "" },

    doj: { type: String, default:  "" },

    sslc: {

        school: { type: String, default:  "" },

        studyPeriod: { type: String, default:  "" },

        board: { type: String, default:  "" },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    hsc: {

        school: { type: String, default:  "" },

        studyPeriod: { type: String, default:  "" },

        group: { type: String, default:  "" },

        board: { type: String, default:  "" },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    diploma: {

        institution: { type: String, default:  "" },

        studyPeriod: { type: String, default:  "" },

        affiliation: { type: String, default:  "" },

        branch: { type: String, default:  "" },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    undergraduate: {

        college: { type: String, default:  "" },

        studyPeriod: { type: String, default:  "" },

        affiliation: { type: String, default:  "" },

        branch: { type: String, default:  "" },

        percentage: { type: Number, default: 0 },

        passingYear: { type: Number, default: 0 }
    }

}, { collection: "StudentDetails", timestamps: true })


export const StudentDetailsModel = model('StudentDetails', StudentDetailsSchema)