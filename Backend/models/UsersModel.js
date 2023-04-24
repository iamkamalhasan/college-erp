import mongoose from "mongoose"

const { Schema, model } = mongoose

const UsersSchema = new Schema({
    
    email: { type: String, required: true, unique: true },

    isCredentialCreated: { type: Boolean, default: false },

    userType: { type: String, required: true },

    password: { type: String },

    userId: { type: Schema.Types.ObjectId, required: true, refPath: 'userRef' },

    userRef: { type: String, enum: ['Students', 'Faculty'] }

}, { collection: "Users", timestamps: true })

export const UsersModel = model('Users', UsersSchema)