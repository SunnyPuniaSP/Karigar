import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Worker } from "../models/worker.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { getDistance } from "geolib";
import { Transaction } from "../models/transaction.model.js";


const generateAccessAndRefreshTokens = async (workerId) => {
  try {
    const worker = await Worker.findById(workerId);
    const accessToken = worker.generateAccessToken();
    const refreshToken = worker.generateRefreshToken();
    worker.refreshToken = refreshToken;
    await worker.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerWorker = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    address,
    workingCategory,
    yearOfExperience,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !password ||
    !phone ||
    !address ||
    !workingCategory ||
    !yearOfExperience
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!Array.isArray(workingCategory)) {
    throw new ApiError(400, "WorkingCategory must be an array");
  }

  const validCategories = [
    "Plumber",
    "Electrician",
    "TV",
    "Fridge",
    "AC",
    "Washing-Machine",
    "Laptop",
  ];
  for (const category of workingCategory) {
    if (!validCategories.includes(category)) {
      throw new ApiError(400, `Invalid category: ${category}`);
    }
  }

  const existingWorker = await Worker.findOne({ email });
  if (existingWorker) {
    throw new ApiError(400, "Worker with this email already exists");
  }

  const profilePhotoLocalPath = req.file?.path;

  let profilePhoto;
  if (profilePhotoLocalPath) {
    profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
  }

  const worker = await Worker.create({
    fullName,
    email,
    password,
    phone,
    address,
    workingCategory,
    yearOfExperience,
    profilePhoto: profilePhoto?.url || "",
  });

  const createdWorker = await Worker.findById(worker._id).select(
    "-password -refreshToken"
  );

  if (!createdWorker) {
    throw new ApiError(500, "Worker creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdWorker, "Worker registered successfully")
    );
});

const loginWorker = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const worker = await Worker.findOne({ email });

  if (!worker) {
    throw new ApiError(404, "Worker does not exist");
  }

  const isPasswordCorrect = await worker.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    worker._id
  );

  const loggedInWorker = await Worker.findById(worker._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          worker: loggedInWorker,
          refreshToken,
          accessToken,
        },
        "Worker logged in successfully"
      )
    );
});

const logoutWorker = asyncHandler(async (req, res) => {
  await Worker.findByIdAndUpdate(
    req.worker._id,
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
    .json(new ApiResponse(200, {}, "Worker logged out successfully"));
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

    const worker = await Worker.findById(decodedToken?._id);

    if (!worker) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== worker?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used"); //ud....................
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      worker._id
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

  const worker = await Worker.findById(req.worker?._id);
  const isPasswordCorrect = await worker.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  worker.password = newPassword;
  await worker.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentWorker = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.worker, "Worker fetched successfully"));
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

  const worker = await Worker.findByIdAndUpdate(
    req.worker?._id,
    {
      $set: {
        profilePhoto: profilePhoto.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, worker, "Profile Photo updated successfully"));
});

const updateWorkerDetails = asyncHandler(async(req, res) => {
    const {fullName,email,address,phone} = req.body

    if (!email || !fullName || !address || !phone) {
        throw new ApiError(400, "all fields are required to update profile")
    }

    const worker = await Worker.findByIdAndUpdate(
        req.worker?._id,
        {
            $set: {
                email: email,
                fullName: fullName,
                address: address,
                phone: phone
            }
        },
        {new: true}
        
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Profile updated successfully"))
});

const getWorkerDetails=asyncHandler(async(req, res)=>{
    const {workerId}=req.params;
    
    const worker=await Worker.findById(workerId).select("-password -refreshToken -suspendedUntil -walletBalance -ratingsCount -ratingsPoints");

    if(!worker){
        throw new ApiError(400, "Worker not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Worker details fetched successfully"));
});

const toggleIsOnline=asyncHandler(async(req,res)=>{
    const worker=await Worker.findById(req.worker._id);
    if(!worker){
      throw new ApiError(400, "Worker not found");
    }
    worker.isOnline=!worker.isOnline;
    await worker.save({ validateBeforeSave: false });

    const updatedWorker=await Worker.findById(worker._id).select("-password -refreshToken -suspendedUntil -walletBalance -ratingsCount -ratingsPoints")

    return res
    .status(200)
    .json(new ApiResponse(200, updatedWorker, "IsOnline status toggle successfully"));
});

const updateWorkerCurrentLocation=asyncHandler(async(req,res)=>{
    const {latitude,longitude}=req.body
    const {serviceRequestId}=req.params
     if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required");
      }
    const workerLocation = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    const worker=await Worker.findByIdAndUpdate(
      req.worker._id,
      {
        $set:{
          currentLocation:workerLocation
        }
      },
      {new:true}
    ).select("-password -refreshToken");

    if (!worker) {
        throw new ApiError(400, "Worker not found");
      }

    const serviceRequest=await ServiceRequest.findById(serviceRequestId);
    if(!serviceRequest){
      throw new ApiError(400,"Service request not find");
    }

    const startCoordinates=worker.startLocation.coordinates;
    const customerCoordinates=serviceRequest.customerLocation.coordinates;

    if (startCoordinates && customerCoordinates) {
    const startLat = startCoordinates[1];
    const startLng = startCoordinates[0];
    const customerLat = customerCoordinates[1];
    const customerLng = customerCoordinates[0];

    const distanceFromStart = getDistance(
  { latitude: startLat, longitude: startLng },
  { latitude: latitude, longitude: longitude }
);
    const distanceToCustomer = getDistance(
  { latitude: latitude, longitude: longitude },
  { latitude: customerLat, longitude: customerLng }
);

    let statusUpdated = false;

    if (distanceFromStart > 100 && serviceRequest.orderStatus === "connected") {
      serviceRequest.orderStatus = "onway";
      statusUpdated = true;
    }

    if (distanceToCustomer < 100 && serviceRequest.orderStatus === "onway") {
      serviceRequest.orderStatus = "arrived";
      statusUpdated = true;
    }

    if (statusUpdated) {
      await serviceRequest.save();
    }
  }
    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Worker current location updated successfully"))

})

const updateWorkerStartLocation=asyncHandler(async(req,res)=>{
    const {latitude,longitude}=req.body
     if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required");
      }
    const workerLocation = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    const worker=await Worker.findByIdAndUpdate(
      req.worker._id,
      {
        $set:{
          startLocation:workerLocation,
        }
      },
      {new:true}
    ).select("-password -refreshToken");

    if (!worker) {
        throw new ApiError(400, "Worker not found");
      }

    return res
    .status(200)
    .json(new ApiResponse(200, worker, "Worker start location updated successfully"))

})

const temporaryBlockCustomer=asyncHandler(async(req,res)=>{
  const {customerId}=req.body
  
  if(!customerId){
    throw new ApiError(400,"Customer id is required to temporary block customer");
  }

  const blockDurationInMs = 60 * 60 * 1000; // 1 hour
  const blockedUntil = new Date(Date.now() + blockDurationInMs);

  const worker=await Worker.findByIdAndUpdate(req.worker._id, {
    $push: {
      temporaryBlockedCustomers: {
        customerId,
        blockedUntil
      }
    }
  },{new:true}).select("-password -refreshToken");


  return res
    .status(200)
    .json(new ApiResponse(200, worker, "Customer temporary blocked successfully"))

})

const getWorkerCurrentLocation=asyncHandler(async(req,res)=>{
  const {workerId}=req.params;

  const worker=await Worker.findById(workerId).select("-password -refreshToken");

  if(!worker){
    throw new ApiError(400,"Worker details not found")
  }

  const location={
    lng:worker.currentLocation.coordinates[0],
    lat:worker.currentLocation.coordinates[1],
  }
  return res
    .status(201)
    .json(new ApiResponse(201, location, "Worker current location fetched successfully"))

})

const toggleIsLiveRequestToFalse=asyncHandler(async(req,res)=>{
    const {workerId}=req.params;

    const worker=await Worker.findByIdAndUpdate(
        workerId,
        {
            $set:{
                isLiveRequest:false,
                liveServiceId:null
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    if(!worker){
      throw new ApiError(400,"Something went wrong while fetching worker and update live request status to false")
    }

    return res.status(200).json(new ApiResponse(200,worker,"live request set to false in customer database successfully"));
})

const getPastJobs=asyncHandler(async(req,res)=>{
    const workerId=req.worker._id;

    const jobs=await ServiceRequest.aggregate([
        {
            $match:{
                workerId: workerId,
                orderStatus: "completed"
            }
        },
        {
            $lookup:{
                from: "customers",
                localField:"customerId",
                foreignField:"_id",
                as:"customerDetails"
            }
        },
        {
            $addFields:{
                customerName:"$customerDetails.fullName",
                customerPhoto:"$customerDetails.profilePhoto"
            }
        },
        {
            $project:{
                customerDetails:0
            }
        },
        {
            $sort:{
                updatedAt:-1
            }
        }
    ])

    return res.status(201).json(new ApiResponse(201,jobs,"Past requests find sucessfully"))
})

const getOnlineTransactions=asyncHandler(async(req,res)=>{
  const workerId=req.worker._id;

  const transactions=await Transaction.find({
    workerId:workerId
  }).sort({updatedAt:-1})
  
  return res.status(200).json(new ApiResponse(200,transactions,"Transactions fetched successfully"))
})

export {
  registerWorker,
  loginWorker,
  logoutWorker,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentWorker,
  updateProfilePhoto,
  updateWorkerDetails,
  getWorkerDetails,
  toggleIsOnline,
  updateWorkerCurrentLocation,
  temporaryBlockCustomer,
  getWorkerCurrentLocation,
  updateWorkerStartLocation,
  toggleIsLiveRequestToFalse,
  getPastJobs,
  getOnlineTransactions
};
