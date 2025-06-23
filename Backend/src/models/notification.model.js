import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userType: {
        type: String,
        enum: ["customer", "worker"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
