import mongoose from "mongoose"

const { Schema, model } = mongoose

const FeedbackQuestionsSchema = new Schema({
    
    courseType: { type: String, required: true },

    number: { type: Number, required: true },

    type: { type: String, required: true },

    question: { type: String, required: true }

}, { collection: "FeedbackQuestions", timestamps: true })


export const FeedbackQuestionsModel = model('FeedbackQuestions', FeedbackQuestionsSchema)