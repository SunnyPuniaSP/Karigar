import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    worker:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
        required: true
    },
    serviceType: {
        type: String,
        enum: ["plumber", "electrician", "carpenter", "painter", "Tv", "Fridge", "Ac", "washing machine", "Laptop"],
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["pending", "accepted", "rejectesByWorker", "rejectedByCustomer"],
        default: "pending"
    },
    

},{timestamps: true});

export const Order = mongoose.model("Order", orderSchema);