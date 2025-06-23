import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer", 
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    serviceRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceRequest",
        default: null,
    },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);
