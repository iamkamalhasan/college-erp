import mongoose from "mongoose"

const { Schema, model } = mongoose

const RequestsSchema = new Schema({
    
    from: { type: Schema.Types.ObjectId, required: true, refPath: 'fromRef' },

    fromRef: { type: String, enum: ['Students', 'Faculty'] },

    to: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    body: { type: String },

    type: { type: String, required: true },

    approved: { type: Boolean, default: false },
 
    deadline: { type: Schema.Types.Date, default: null },

    cancel: { type: Boolean, default: false }

}, { collection: "Requests", timestamps: true })


export const RequestsModel = model('Requests', RequestsSchema)