import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    workingStatus: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
    },
    totalOrdersAccepted: {
        type: Number,
        default: 0
    },
    totalOrdersServed: {
        type: Number,
        default: 0
    },
    totalOrdersNotServed: {
        type: Number,
        default: 0
    },
    yearOfExperience: {
        type: Number,
        default: 0
    },
    workingCategory: {
        type: [{
            type: String,
            enum: ["plumber", "electrician", "carpenter", "painter", "Tv", "Fridge", "Ac", "washing machine", "Laptop"],
        }],
        required: true,
    },
    specialization: {
        type: String,
        enum: ["plumber", "electrician", "carpenter", "painter", "Tv", "Fridge", "Ac", "washing machine", "Laptop"],
        required: true,
    },


},{timestamps: true});

export const Worker = mongoose.model("Worker", workerSchema);