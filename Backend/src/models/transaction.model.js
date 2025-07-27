import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  workerId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker", 
    required: true,
  },
  dateAndTime:{
    type:Date,
    default:null
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionNature: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  platformFee: {  
    type: Boolean,
    default: false,
  },
  walletRecharge:{
    type:Boolean,
    default:false
  },
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    default: null,
  },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);
