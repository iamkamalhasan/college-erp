import mongoose from "mongoose"

const { Schema, model } = mongoose

const CurriculumSchema = new Schema({
    
    courseCode: { type: String, required: true },

    title: { type: String, required: true },

    type: { type: String, required: true },

    requirement: { type: String },

    category: { type: String, required: true },

    marks: {

        ca: { type: Number },

        sem: { type: Number }

    },

    hours: {

        lecture: { type: Number },

        tutorial: { type: Number },

        practical: { type: Number },

        credits: { type: Number }

    },

    semester: { type: String, required: true },

    regulation: { type: Number, required: true },

    branch: { type: String, required: true }

}, { collection: "Curriculum", timestamps: true })


export const CurriculumModel = model('Curriculum', CurriculumSchema)