import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExamFeesSchema = new Schema({
    
    regulation: { type: Number, required: true },

    applicationForm: {type: Number, required:true},

    courseRegistrationFee: {

        theory:{type: Number, required:true},

        practical:{type: Number, required:true},

        activity:{type: Number, required:true},
        
        internship:{type: Number, required:true}

    },

    statementOfMarks: {type: Number, required:true},
    
    consolidateMarkSheet: {type: Number, required:true},
    
    courseCompletionCertificate: {type: Number, required:true},
    
    provisionalCertificate: {type: Number, required:true},
    
    degreeCertificate: {type: Number, required:true},
    
    otherUniversityFee: {type: Number, required:true},

}, { collection: "ExamFees", timestamps: true })


export const ExamFeesModel = model('ExamFees', ExamFeesSchema)