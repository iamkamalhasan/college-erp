import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExaminersPanelSchema = new Schema({
    
    courseCode: { type: String, required: true },

    branch: { type: [String], required: true },

    batch: { type: [Number], required: true },

    qpSetters: [
        {

            home: { type: Boolean, default: true },
        
            faculty: { type: Schema.Types.ObjectId, refPath: 'schemaRef' },
        
            schemaRef: { type: String, enum: ['Faculty', 'ExternalExaminers'] }
        
        }
    ],

    asEvaluators: [
        {

            home: { type: Boolean, default: true },
        
            faculty: { type: Schema.Types.ObjectId, refPath: 'schemaRef' },
        
            schemaRef: { type: String, enum: ['Faculty', 'ExternalExaminers'] }
        
        }
    ],

    approval: { type: Boolean, default: false }

}, { collection: "ExaminersPanel", timestamps: true })


export const ExaminersPanelModel = model('ExaminersPanel', ExaminersPanelSchema)