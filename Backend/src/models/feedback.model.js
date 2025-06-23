import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    serviceRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        required: true,
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    reviewerType: {
        type: String,
        enum: ["customer", "worker"],
        required: true,
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
