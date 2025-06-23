import mongoose from "mongoose";
import { searchCharge } from "../constants";

const customerSchema = new mongoose.Schema({
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
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"]
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: { 
            validator: (v) => /^\d{10}$/.test(v),
            message: "Phone number must be 10 digits"
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    profilePhoto: {
        type: String, // URL to image
        default: ""
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
    },
    refreshToken: {
        type: String
    },
    walletBalance: {
        type: Number,
        default: searchCharge
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

export const Customer = mongoose.model("Customer", customerSchema);