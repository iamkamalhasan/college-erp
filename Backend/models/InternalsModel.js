import mongoose from "mongoose"

const { Schema, model } = mongoose

const InternalsSchema = new Schema({

    enrollmentId: { type: Schema.Types.ObjectId, required: true, ref: 'Enrollment' },

    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'CourseDetails' },

    batch: { type: Number, required: true },

    semester: { type: Number, required: true },

    category: { type: String, required: true },

    type: { type: String, required: true },

    number: { type: Number, required: true },

    questions: [
        {
            number: { type: Number, required: true },
            co: { type: Number, required: true },
            allotted: { type: Number, required: true },
            obtained: { type: Number, default: 0 }
        }
    ],

    total: {
            allotted: { type: Number, default: 0 },
            obtained: { type: Number, default: 0 }
    },

    co: { type: Object, default: {} }

}, { collection: "Internals", timestamps: true })

InternalsSchema.pre("save", function (next) {
    const co = this.questions.reduce((accumulator, question) => {
        if(!accumulator["total"]){
            accumulator["total"] = {}
            accumulator["total"].allotted = 0
            accumulator.total.obtained = 0}
    
        accumulator.total.allotted += question.allotted
        accumulator.total.obtained += question.obtained
        if(!accumulator[question.co]){
            accumulator[question.co] = {}
            accumulator[question.co].obtained = 0
            accumulator[question.co].allotted = 0}
        accumulator[question.co].obtained += question.obtained
        accumulator[question.co].allotted += question.allotted  
        return accumulator
    },{})

    this.total.allotted = co.total.allotted
    this.total.obtained = co.total.obtained

    delete co.total
    this.co = {...co}
    next()
})

InternalsSchema.pre("updateOne", function (next) {
    let update = this.getUpdate()
    const co = update.questions.reduce((accumulator, question) => {
        if(!accumulator["total"]){
            accumulator["total"] = {}
            accumulator["total"].allotted = 0
            accumulator.total.obtained = 0}
    
        accumulator.total.allotted += question.allotted
        accumulator.total.obtained += question.obtained ?? 0
        if(!accumulator[question.co]){
            accumulator[question.co] = {}
            accumulator[question.co].obtained = 0
            accumulator[question.co].allotted = 0}
        accumulator[question.co].obtained += question.obtained
        accumulator[question.co].allotted += question.allotted ?? 0
        return accumulator
    },{})
    update["total"] = {}
    update.total["allotted"] = co.total.allotted 
    update.total["obtained"] = co.total.obtained 
    update["co"] = {}
    delete co.total
    update["co"] = {...co}
    next()
})

export const InternalsModel = model('Internals', InternalsSchema)