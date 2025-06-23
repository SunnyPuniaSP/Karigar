import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Phone number must be 10 digits",
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    refreshToken: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    yearOfExperience: {
      type: Number,
      default: 0,
    },
    workingCategory: {
      type: [
        {
          type: String,
          enum: [
            "plumber",
            "electrician",
            "carpenter",
            "painter",
            "Tv",
            "Fridge",
            "Ac",
            "washing machine",
            "Laptop",
          ],
        },
      ],
      required: true,
    },
    currentLocation: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: null,
      },
    },
    profilePhoto: {
      type: String, // URL to image
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    penaltyScore: {
      type: Number,
      default: 0,
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

workerSchema.index({ currentLocation: "2dsphere" });

export const Worker = mongoose.model("Worker", workerSchema);
