import mongoose from "mongoose";
import { visitingCharge } from "../constants.js";

const serviceRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    category: {
      type: String,
      enum: [
        "Plumber",
        "Electrician",
        "TV",
        "Fridge",
        "AC",
        "Washing-Machine",
        "Laptop",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    audioNoteUrl: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: [
        "searching",
        "connected",
        "onway",
        "arrived",
        "verified",
        "repairAmountQuoted",
        "cancelled",
        "accepted",
        "rejected",
      ],
      default: "searching",
    },
    jobStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    customerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    workerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined, 
      },
    },

    searchExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60000), // 15 mins
    },
    visitingCharge: {
      type: Number,
      default: visitingCharge,
    },
    quoteAmount: {
      type: Number,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "technician", "system"],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "NA",
      enum: [
        "customerNotResponding",
        "workerNotRespondingOrLate",
        "workerNotAbleToServe",
        "byMistake",
        "notConnected",
        "unattendedRequests",
        "NA",
      ],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["online", "cash", null],
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    workerRated: {
      type: Boolean,
      default: false,
    },
    ratedWith: {
      type: Number,
      default: null,
    },
    workerReported: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ customerLocation: "2dsphere" });
serviceRequestSchema.index({ workerLocation: "2dsphere" });

export const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);
