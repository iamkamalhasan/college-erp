import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExamPaymentSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    paymentDetails : {
        
        applicationForm: {type: Number, required:true},

        courseRegistrationFee:{

            theory:{type: Number, required:true},
    
            practical:{type: Number, required:true},
    
            activity:{type: Number, required:true},
            
            internship:{type: Number, required:true},

            total:{type: Number, required:true}
    
        },

        statementOfMarks: {type: Number, required:true},
        
        consolidateMarkSheet: {type: Number, required:true},
        
        courseCompletionCertificate: {type: Number, required:true},
        
        provisionalCertificate: {type: Number, required:true},
        
        degreeCertificate: {type: Number, required:true},
        
        otherUniversityFee: {type: Number, required:true},

        totalAmount: { type: Number, required: true },
        

    },

    paid: { type: Boolean, default: false },

    referenceId: { type: String, required: true },

    date: { type: Schema.Types.Date },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    section: { type:String, default:'A'},

    semester: { type: Number, required: true }

}, { collection: "ExamPayment", timestamps: true })


export const ExamPaymentModel = model('ExamPayment', ExamPaymentSchema)