import mongoose from "mongoose"

const { Schema, model } = mongoose

const CalendarSchema = new Schema({

    date: { type: Date, required: true, unique: true },

    day: { type: Number, required: true },

    month: { type: Number, required: true },

    year: { type: Number, required: true },

    isWorkingDay: { type: Boolean, default: true },

    isDayOrder: { type: Boolean, default: false },

    batches: { type: [Number], default: null },

    order: { type: Number, default: null },

    reason: { type: String, default: null },
   
    events: { type: [String], default: null }

}, { collection: "Calendar", timestamps: true })

export const CalendarModel = model("Calendar", CalendarSchema)