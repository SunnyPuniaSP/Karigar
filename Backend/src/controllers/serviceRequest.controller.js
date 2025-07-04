import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";

const createServiceRequest = asyncHandler(async (req, res) => {
  const customerId = req.customer?._id;
  const { category } = req.params;
  const { description, customerLocation } = req.body;
  const audioNoteLocalPath = req.file?.path;
  let audioNote;
  if (audioNoteLocalPath) {
    audioNote = await uploadOnCloudinary(audioNoteLocalPath);
  }

  if (
    !customerLocation ||
    !customerLocation.coordinates ||
    !Array.isArray(customerLocation.coordinates) ||
    customerLocation.coordinates.length !== 2
  ) {
    throw new ApiError(400, "Valid customerLocation is required");
  }
  const serviceRequest = await ServiceRequest.create({
    customerId,
    category,
    description,
    customerLocation,
    audioNoteUrl: audioNote?.url || "",
  });

  const createdServiceRequest = await ServiceRequest.findById(
    serviceRequest._id
  ).select("_id customerId category description customerLocation audioNoteUrl");

  if (!createdServiceRequest) {
    throw new ApiError(500, "Service request creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdServiceRequest,
        "Service request created successfully"
      )
    );
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const findRequests = asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;

  // Get the worker's current location and workingCategory
  const worker = await Worker.findById(workerId);
  if (!worker || !worker.currentLocation || !Array.isArray(worker.workingCategory)) {
    throw new ApiError(404, "Worker profile incomplete or not found");
  }

  const [workerLng, workerLat] = worker.currentLocation.coordinates;
  const workingCategories = worker.workingCategory;

  // Find all open requests in range and matching category
  const requests = await ServiceRequest.find({
    workerId: null,
    category: { $in: workingCategories },
    orderStatus: "searching",
    customerLocation: {
      $near: {
        $geometry: worker.currentLocation,
        $maxDistance: SEARCH_RADIUS_METERS,
      },
    },
  }).select("_id customerId category description customerLocation audioNoteUrl");

  // Add distance to each request
  const requestsWithDistance = requests.map(req => {
    const [customerLng, customerLat] = req.customerLocation.coordinates;
    const distance_km = getDistanceFromLatLonInKm(workerLat, workerLng, customerLat, customerLng);
    return {
      ...req.toObject(),
      distance_km: Math.round(distance_km * 100) / 100, // rounded to 2 decimals
    };
  });

  return res.status(200).json(
    new ApiResponse(200, requestsWithDistance, "Matching service requests found")
  );
});

const acceptRequest = asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;
  const { serviceRequestId } = req.params;

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request is already accepted or completed
  if (serviceRequest.workerId || serviceRequest.orderStatus !== "searching") {
    throw new ApiError(400, "Service request already accepted or completed");
  }

  // Update the service request with worker details
  serviceRequest.workerId = workerId;
  serviceRequest.orderStatus = "connected";
  serviceRequest.workerLocation={
    type: "Point",
    coordinates: req.worker.currentLocation.coordinates,
  }
  serviceRequest.connectedAt = new Date();
  await serviceRequest.save();

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Service request accepted successfully")
  );
})

const setQuoteAmount = asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;
  const { serviceRequestId } = req.params;
  const { quoteAmount } = req.body;

  // Validate quote amount
  if (typeof quoteAmount !== "number" || quoteAmount <= 0) {
    throw new ApiError(400, "Invalid quote amount");
  }

  // Find the service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  // Check if the request is accepted and belongs to the worker
  if (serviceRequest.workerId?.toString() !== workerId || serviceRequest.orderStatus === "searching") {
    throw new ApiError(400, "Service request not accepted by this worker");
  }

  // Update the quote amount
  serviceRequest.quoteAmount = quoteAmount;
  serviceRequest.orderStatus = "repairAmountQuoted";
  await serviceRequest.save();

  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Quote amount set successfully")
  );
})

const acceptRepairQuote= asyncHandler(async (req, res) => {
  const {serviceRequestId} = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(400, "Service request is not in repair amount quoted state");
  }
  serviceRequest.orderStatus = "accepted";
  serviceRequest.acceptedAt = new Date();
  await serviceRequest.save();
  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Repair quote accepted successfully")
  );
})

const rejectRepairQuote = asyncHandler(async (req, res) => {
  const {serviceRequestId} = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(400, "Service request is not in repair amount quoted state");
  }
  serviceRequest.orderStatus = "rejected";
  await serviceRequest.save();
  return res.status(200).json(
    new ApiResponse(200, serviceRequest, "Repair quote rejected successfully")
  );
})

