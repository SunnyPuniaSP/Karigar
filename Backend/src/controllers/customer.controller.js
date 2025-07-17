import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import mongoose from "mongoose";
import ms from "ms";

const generateAccessAndRefreshTokens = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId);
    const accessToken = customer.generateAccessToken();
    const refreshToken = customer.generateRefreshToken();
    customer.refreshToken = refreshToken;
    await customer.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;

  if (!fullName || !email || !password || !phone || !address) {
    throw new ApiError(400, "All fields are required");
  }

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    throw new ApiError(400, "Customer with this email already exists");
  }

  const profilePhotoLocalPath = req.file?.path;

  let profilePhoto;
  if (profilePhotoLocalPath) {
    profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
  }

  const customer = await Customer.create({
    fullName,
    email,
    password,
    phone,
    address,
    profilePhoto: profilePhoto?.url || "",
  });

  const createdCustomer = await Customer.findById(customer._id).select(
    "-password -refreshToken"
  );

  if (!createdCustomer) {
    throw new ApiError(500, "Customer creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdCustomer, "Customer registered successfully")
    );
});

const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const customer = await Customer.findOne({ email });

  if (!customer) {
    throw new ApiError(404, "Customer does not exist");
  }

  const isPasswordCorrect = await customer.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    customer._id
  );

  const loggedInCustomer = await Customer.findById(customer._id).select(
    "-password -refreshToken"
  );

  const accessTokenExpiry = ms(process.env.ACCESS_TOKEN_EXPIRY);
  const refreshTokenExpiry = ms(process.env.REFRESH_TOKEN_EXPIRY);

  return res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: refreshTokenExpiry,
    })
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: accessTokenExpiry,
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          customer: loggedInCustomer,
          refreshToken,
          accessToken,
        },
        "Customer logged in successfully"
      )
    );
});

const logoutCustomer = asyncHandler(async (req, res) => {
  await Customer.findByIdAndUpdate(
    req.customer._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const customer = await Customer.findById(decodedToken?._id);

    if (!customer) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== customer?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); //ud....................
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      customer._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const customer = await Customer.findById(req.customer?._id);
  const isPasswordCorrect = await customer.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  customer.password = newPassword;
  await customer.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentCustomer = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.customer, "User fetched successfully"));
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
  const profilePhotoLocalPath = req.file?.path;

  if (!profilePhotoLocalPath) {
    throw new ApiError(400, "Profile Photo file is missing");
  }

  const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);

  if (!profilePhoto?.url) {
    throw new ApiError(400, "Error while uploading Profile Photo");
  }

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    {
      $set: {
        profilePhoto: profilePhoto.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Profile Photo updated successfully"));
});

const updateCustomerDetails = asyncHandler(async (req, res) => {
  const { fullName, email, address, phone } = req.body;

  if (!email || !fullName || !address || !phone) {
    throw new ApiError(400, "all fields are required to update profile");
  }

  const customer = await Customer.findByIdAndUpdate(
    req.customer?._id,
    {
      $set: {
        email: email,
        fullName: fullName,
        address: address,
        phone: phone,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Profile updated successfully"));
});

const getCustomerDetails = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findById(customerId).select(
    "-password -refreshToken"
  );

  if (!customer) {
    throw new ApiError(400, "customer not found");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, customer, "Customer details fetched successfully")
    );
});

const toggleIsLiveRequestToFalse = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    {
      $set: {
        isLiveRequest: false,
        liveServiceId: null,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!customer) {
    throw new ApiError(
      400,
      "Something went wrong while fetching customer and update live request status to false"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        customer,
        "live request set to false in customer database successfully"
      )
    );
});

const getPastRequests = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;

  const requests = await ServiceRequest.aggregate([
    {
      $match: {
        customerId: customerId,
        orderStatus: "completed",
      },
    },
    {
      $lookup: {
        from: "workers",
        localField: "workerId",
        foreignField: "_id",
        as: "workerDetails",
      },
    },
    {
      $addFields: {
        workerName: "$workerDetails.fullName",
        workerPhoto: "$workerDetails.profilePhoto",
      },
    },
    {
      $project: {
        workerDetails: 0,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, requests, "Past requests find sucessfully"));
});

export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentCustomer,
  updateProfilePhoto,
  updateCustomerDetails,
  getCustomerDetails,
  toggleIsLiveRequestToFalse,
  getPastRequests,
};
