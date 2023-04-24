import mongoose from "mongoose"

const { Schema, model } = mongoose

const FeedbackSchema = new Schema({

    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    facultyId: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'CourseDetails' },

    courseTitle: { type: String, required: true },

    batch: { type: Number, required: true },

    branch: { type: String, required: true },

    semester: { type: Number, required: true },

    feedback: [
        {

            questionId: { type: Schema.Types.ObjectId, ref: 'FeedbackQuestions' },

            type: { type: String, required: true },
        
            score: { type: Number, default: 0 }
        
        }
    ],

    score: { type: Object, default: {} },

    total: { type: Object, default: 0 },

    submitted: { type: Boolean, default: false },

}, { collection: "Feedback", timestamps: true })


FeedbackSchema.pre("updateOne", function(next){
    let update = this.getUpdate()
    const score = update.feedback.reduce((accumulator, question)=>{
        if(!accumulator["total"]){ 
            accumulator["total"] = {}
            accumulator["total"]["allotted"] = 0
            accumulator["total"]["obtained"] = 0
        }
        accumulator["total"]["obtained"] += question.score
        accumulator["total"]["allotted"] += 5

        if(!accumulator[question.type]) accumulator[question.type] = {}
        if(!accumulator[question.type][question.score]) accumulator[question.type][question.score] = 0
        if(!accumulator[question.type]["obtained"])
            accumulator[question.type]["obtained"] = 0

        accumulator[question.type]["obtained"] += question.score
        accumulator[question.type][question.score] += 1

        return accumulator
    }, {})
    update.total = score.total
    delete score.total
    update.score = { ...score }
    next()
})

export const FeedbackModel = model('Feedback', FeedbackSchema)