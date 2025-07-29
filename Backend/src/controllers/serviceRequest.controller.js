import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ServiceRequest } from "../models/serviceRequest.model.js";
import { Worker } from "../models/worker.model.js";
import { ApiError } from "../utils/ApiError.js";
import { SEARCH_RADIUS_METERS } from "../constants.js";
import { Cancellation } from "../models/cancellation.model.js";
import { Customer } from "../models/customer.model.js";
import geolib from "geolib";
import { Transaction } from "../models/transaction.model.js";
import { platformCharge } from "../constants.js";

const createServiceRequest = asyncHandler(async (req, res) => {
  const customerId = req.customer?._id;
  const { category } = req.params;
  const { description, latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const customerLocation = {
    type: "Point",
    coordinates: [parseFloat(longitude), parseFloat(latitude)],
  };
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

  const customer =await Customer.findByIdAndUpdate(
    customerId,
    {
      $set:{
        liveServiceId:createdServiceRequest._id,
        isLiveRequest:true
      }
    },
    {new:true}
  )

  if(!customer){
    throw new ApiError("Service request created but service request id not updated in customer database")
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

const getServiceRequestStatus=asyncHandler(async(req, res)=>{
  const {serviceRequestId}=req.params;
  const serviceRequest=await ServiceRequest.findById(serviceRequestId).select("-searchExpiresAt -visitingCharge");
  if(!serviceRequest){
    throw new ApiError(404, "Service request not found");
  }

   return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        serviceRequest,
        "Service status fetched successfully"
      )
    );
});

const findRequests = asyncHandler(async (req, res) => {
  const workerId = req.worker?._id;

  // 1. Get worker details
  const worker = await Worker.findById(workerId);
  if (
    !worker ||
    !worker.startLocation ||
    !Array.isArray(worker.workingCategory)
  ) {
    throw new ApiError(404, "Worker profile incomplete or not found");
  }

  const [workerLng, workerLat] = worker.startLocation.coordinates;
  const workingCategories = worker.workingCategory;

  const now = new Date();
  const blockedCustomerIds = (worker.temporaryBlockedCustomers)
    .filter(entry => entry.blockedUntil > now)
    .map(entry => entry.customerId.toString());

  await Worker.updateOne(
    { _id: workerId },
    {
      $pull: {
        temporaryBlockedCustomers: { blockedUntil: { $lte: now } },
      },
    }
  );

  const requests = await ServiceRequest.find({
    workerId: null,
    category: { $in: workingCategories },
    orderStatus: "searching",
    customerId: { $nin: blockedCustomerIds },
    customerLocation: {
      $near: {
        $geometry: worker.startLocation,
        $maxDistance: SEARCH_RADIUS_METERS,
      },
    },
  }).select(
    "_id customerId category description customerLocation audioNoteUrl"
  );

  const requestsWithDistance = await Promise.all(
  requests.map(async (req) => {
    const [customerLng, customerLat] = req.customerLocation.coordinates;

    const distance_m = geolib.getDistance(
      { latitude: workerLat, longitude: workerLng },
      { latitude: customerLat, longitude: customerLng }
    );

    const customer = await Customer.findById(req.customerId).select("fullName");

    if (!customer) {
      throw new ApiError(500, "Error in fetching customer details");
    }

    return {
      ...req.toObject(),
      distance_km: Math.round((distance_m / 1000) * 100) / 100,
      customerName: customer.fullName,
    };
  })
);


  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requestsWithDistance,
        "Matching service requests found"
      )
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
  serviceRequest.workerLocation = {
    type: "Point",
    coordinates: req.worker.startLocation.coordinates,
  };
  serviceRequest.connectedAt = new Date();
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl "
  );

  if (!updatedServiceRequest) {
    throw new ApiError(500, "Service request not found after accepting");
  }

  const worker=await Worker.findByIdAndUpdate(
    workerId,
    {
      $set:{
        liveServiceId:serviceRequestId,
        isLiveRequest:true
      }
    },
    {new:true}
  )

  if(!worker){
    throw new ApiError(500,"worker live request details update failed")
  }
  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Service request accepted successfully"
      )
    );
});

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
  if (
    serviceRequest.workerId?.toString() !== workerId ||
    serviceRequest.orderStatus === "searching"
  ) {
    throw new ApiError(400, "Service request not accepted by this worker");
  }

  // Update the quote amount
  serviceRequest.quoteAmount = quoteAmount;
  serviceRequest.orderStatus = "repairAmountQuoted";
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus quoteAmount audioNoteUrl"
  );

  if (!updatedServiceRequest) {
    throw new ApiError(
      404,
      "Service request not found after updating quote amount"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Quote amount set successfully"
      )
    );
});

const acceptRepairQuote = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(
      400,
      "Service request is not in repair amount quoted state"
    );
  }
  serviceRequest.orderStatus = "payment_pending_quote_amount";
  serviceRequest.acceptedAt = new Date();
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus quoteAmount audioNoteUrl"
  );

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after accepting quote");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Repair quote accepted successfully"
      )
    );
});

const rejectRepairQuote = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }
  if (serviceRequest.orderStatus !== "repairAmountQuoted") {
    throw new ApiError(
      400,
      "Service request is not in repair amount quoted state"
    );
  }
  serviceRequest.orderStatus = "payment_pending_visiting_fee";
  serviceRequest.rejectedAt = new Date();
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus quoteAmount audioNoteUrl"
  );

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after rejecting quote");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Repair quote rejected successfully"
      )
    );
});

const cancelledByWorkerAsCustomerNotResponding = asyncHandler(
  async (req, res) => {
    const { serviceRequestId } = req.params;
    const workerId = req.worker?._id;

    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      throw new ApiError(404, "Service request not found");
    }

    if (serviceRequest.orderStatus !== "arrived") {
      throw new ApiError(
        400,
        "Worker has not arrived at the Customer location, cannot cancel"
      );
    }

    serviceRequest.orderStatus = "cancelled";
    serviceRequest.cancelledBy = "worker";
    serviceRequest.cancelledAt = new Date();
    serviceRequest.cancellationReason = "customerNotResponding";
    serviceRequest.jobStatus = "completed"; // Mark job as completed since worker is cancelling
    serviceRequest.completedAt = new Date();
    await serviceRequest.save();

    const cancel = await Cancellation.create({
      serviceRequestId: serviceRequest._id,
      cancelledBy: "worker",
      customerId: serviceRequest.customerId,
      workerId: workerId,
      cancellationReason: "customerNotResponding",
    });

    const customerNotRespondingCancellations = await Cancellation.find({
      customerId: serviceRequest.customerId,
      cancellationReason: "customerNotResponding",
      createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }, // Last 6 months
    });

    if (customerNotRespondingCancellations.length == 1) {
      const customer = await Customer.findById(serviceRequest.customerId);
      if (customer) {
        customer.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
        await customer.save();
      }
    } else if (customerNotRespondingCancellations.length == 2) {
      const customer = await Customer.findById(serviceRequest.customerId);
      if (customer) {
        customer.suspendedUntil = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ); // Suspend for 7 days
        await customer.save();
      }
    } else if (customerNotRespondingCancellations.length == 3) {
      const customer = await Customer.findById(serviceRequest.customerId);
      if (customer) {
        customer.suspendedUntil = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ); // Suspend for 30 days
        await customer.save();
      }
    } else if (customerNotRespondingCancellations.length >= 4) {
      const customer = await Customer.findById(serviceRequest.customerId);
      if (customer) {
        customer.suspendedUntil = new Date(
          Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
        ); // Suspend for 6 months
        await customer.save();
      }
    }

    const updatedServiceRequest = await ServiceRequest.findById(
      serviceRequestId
    ).select(
      "_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl"
    );

    if (!updatedServiceRequest) {
      throw new ApiError(404, "Service request not found after cancellation");
    }

    const worker=await Worker.findByIdAndUpdate(
    workerId,
    {
      $set:{
        isLiveRequest:false,
        liveServiceId:null
      }
    },
    {new:true}
  )

  if(!worker){
    throw new ApiError(500,"Service Request updated successfully but customer live request details not resetted")
  }

  await worker.deductPlatformFee();

    const transactionDebit = await Transaction.create({
            workerId: worker._id,
            dateAndTime: new Date(),
            amount: platformCharge,
            transactionNature: "debit",
            description: `Platform fee for service request ${serviceRequestId}`,
            platformFee: true,
            serviceRequestId: serviceRequest._id,
        })
    
        if (!transactionDebit) {
            throw new ApiError(500, "Failed to record debit transaction");
        }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedServiceRequest,
          "Service request cancelled successfully"
        )
      );
  }
);

const cancelledByWorkerAsNotAbleToServe = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const workerId = req.worker?._id;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  if (
    serviceRequest.orderStatus === "searching"
  ) {
    throw new ApiError(
      400,
      "Service request not accepted by this worker or not in connected state"
    );
  }

  serviceRequest.orderStatus = "cancelled";
  serviceRequest.cancelledBy = "worker";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "workerNotAbleToServe";
  serviceRequest.jobStatus = "completed"; 
  serviceRequest.completedAt = new Date();
  await serviceRequest.save();

  const cancel = await Cancellation.create({
    serviceRequestId: serviceRequest._id,
    cancelledBy: "worker",
    customerId: serviceRequest.customerId,
    workerId: workerId,
    cancellationReason: "workerNotAbleToServe",
  });

  const workerNotAbleToServeCancellations = await Cancellation.find({
    workerId: workerId,
    cancellationReason: "workerNotAbleToServe",
    createdAt: { $gte: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000) }, // Last 1 months
  });

  if (workerNotAbleToServeCancellations.length == 1) {
    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
      await worker.save();
    }
  } else if (workerNotAbleToServeCancellations.length == 2) {
    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Suspend for 7 days
      await worker.save();
    }
  } else if (workerNotAbleToServeCancellations.length == 3) {
    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Suspend for 30 days
      await worker.save();
    }
  } else if (workerNotAbleToServeCancellations.length >= 4) {
    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.suspendedUntil = new Date(
        Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
      ); // Suspend for 6 months
      await worker.save();
    }
  }

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl"
  );

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  const worker=await Worker.findByIdAndUpdate(
    workerId,
    {
      $set:{
        isLiveRequest:false,
        liveServiceId:null
      }
    },
    {new:true}
  )

  if(!worker){
    throw new ApiError(500,"Service Request updated successfully but customer live request details not resetted")
  }

  await worker.deductPlatformFee();

    const transactionDebit = await Transaction.create({
            workerId: worker._id,
            dateAndTime: new Date(),
            amount: platformCharge,
            transactionNature: "debit",
            description: `Platform fee for service request ${serviceRequestId}`,
            platformFee: true,
            serviceRequestId: serviceRequest._id,
        })
    
        if (!transactionDebit) {
            throw new ApiError(500, "Failed to record debit transaction");
        }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Service request cancelled successfully"
      )
    );
});

const cancelledByCustomerAsWorkerNotRespondingOrLate = asyncHandler(
  async (req, res) => {
    const { serviceRequestId } = req.params;
    const customerId = req.customer?._id;

    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      throw new ApiError(404, "Service request not found");
    }

    const worker =await Worker.findById(serviceRequest.workerId);

    if(!worker){
      throw new ApiError(404,"worker not found")
    }
    
    if (serviceRequest.orderStatus === "arrived") {
      throw new ApiError(
        400,
        "Worker has already arrived at the location, cannot cancel"
      );
    }

    serviceRequest.orderStatus = "cancelled";
    serviceRequest.cancelledBy = "customer";
    serviceRequest.cancelledAt = new Date();
    serviceRequest.cancellationReason = "workerNotRespondingOrLate";
    serviceRequest.jobStatus = "completed"; 
    serviceRequest.completedAt = new Date();
    await serviceRequest.save();

    await worker.deductPlatformFee();

    const transactionDebit = await Transaction.create({
            workerId: worker._id,
            dateAndTime: new Date(),
            amount: platformCharge,
            transactionNature: "debit",
            description: `Platform fee for service request ${serviceRequestId}`,
            platformFee: true,
            serviceRequestId: serviceRequest._id,
        })
    
        if (!transactionDebit) {
            throw new ApiError(500, "Failed to record debit transaction");
        }

    const cancel = await Cancellation.create({
      serviceRequestId: serviceRequest._id,
      cancelledBy: "customer",
      customerId: customerId,
      workerId: serviceRequest.workerId,
      cancellationReason: "workerNotRespondingOrLate",
    });

    const workerNotRespondingCancellations = await Cancellation.find({
      workerId: serviceRequest.workerId,
      cancellationReason: "workerNotRespondingOrLate",
      createdAt: { $gte: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000) }, // Last 1 months
    });

    if (workerNotRespondingCancellations.length == 1) {
      const worker = await Worker.findById(serviceRequest.workerId);
      if (worker) {
        worker.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspend for 24 hours
        await worker.save();
      }
    } else if (workerNotRespondingCancellations.length == 2) {
      const worker = await Worker.findById(serviceRequest.workerId);
      if (worker) {
        worker.suspendedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Suspend for 3 days
        await worker.save();
      }
    } else if (workerNotRespondingCancellations.length == 3) {
      const worker = await Worker.findById(serviceRequest.workerId);
      if (worker) {
        worker.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Suspend for 7 days
        await worker.save();
      }
    } else if (workerNotRespondingCancellations.length >= 4) {
      const worker = await Worker.findById(serviceRequest.workerId);
      if (worker) {
        worker.suspendedUntil = new Date(
          Date.now() + 1 * 30 * 24 * 60 * 60 * 1000
        ); // Suspend for 30 days
        await worker.save();
      }
    }

    const updatedServiceRequest = await ServiceRequest.findById(
      serviceRequestId
    ).select(
      "_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl"
    );

    if (!updatedServiceRequest) {
      throw new ApiError(404, "Service request not found after cancellation");
    }

    const customer=await Customer.findByIdAndUpdate(
    customerId,
    {
      $set:{
        isLiveRequest:false,
        liveServiceId:null
      }
    },
    {new:true}
  )

  if(!customer){
    throw new ApiError(500,"Service Request updated successfully but customer live request details not resetted")
  }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedServiceRequest,
          "Service request cancelled successfully"
        )
      );
  }
);

const cancelledByCustomerAsByMistake = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const customerId = req.customer?._id;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  if (Date.now() - serviceRequest.connectedAt.getTime() > 40 * 1000) {
    throw new ApiError(
      400,
      "Cannot cancel service request after 30sec of connection"
    );
  }

  serviceRequest.orderStatus = "cancelled";
  serviceRequest.jobStatus = "completed";
  serviceRequest.completedAt = new Date();
  serviceRequest.cancelledBy = "customer";
  serviceRequest.cancelledAt = new Date();
  serviceRequest.cancellationReason = "byMistake";
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description customerLocation workerLocation orderStatus audioNoteUrl"
  );

  if (!updatedServiceRequest) {
    throw new ApiError(404, "Service request not found after cancellation");
  }

  const customer=await Customer.findByIdAndUpdate(
    customerId,
    {
      $set:{
        isLiveRequest:false,
        liveServiceId:null
      }
    },
    {new:true}
  )

  if(!customer){
    throw new ApiError(500,"Service Request updated successfully but customer live request details not resetted")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Service request cancelled successfully"
      )
    );
});

const cancelBySystemAsNotConnected = asyncHandler(async (req, res) => {
  const cutoffTime = new Date(Date.now() - 10 * 60 * 1000);

  const result = await ServiceRequest.updateMany(
    {
      orderStatus: "searching",
      createdAt: { $lte: cutoffTime },
    },
    {
      $set: {
        orderStatus: "cancelled",
        jobStatus: "completed",
        completedAt: new Date(),
        cancelledBy: "system",
        cancellationReason: "notConnected",
        cancelledAt: new Date(),
      },
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cancelledCount: result.modifiedCount,
        message: "Old unconnected service requests cancelled by system",
      },
      "Old unconnected service requests cancelled by system"
    )
  );
});

const cancelledBySystemAsUnattended = asyncHandler(async (req, res) => {
  const cutoffTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const result = await ServiceRequest.updateMany(
    {
      createdAt: { $lte: cutoffTime },
    },
    {
      $set: {
        orderStatus: "cancelled",
        jobStatus: "completed",
        completedAt: new Date(),
        cancelledBy: "system",
        cancellationReason: "unattendedRequests",
        cancelledAt: new Date(),
      },
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        cancelledCount: result.modifiedCount,
        message: "Old unattended service requests cancelled by system",
      },
      "Old unconnected service requests cancelled by system"
    )
  );
});

const rateWorker = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const { rating } = req.body;
  const customerId = req.customer?._id;

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a number between 1 and 5");
  }

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  if (serviceRequest.customerId?.toString() !== customerId) {
    throw new ApiError(400, "Service request not belonging to this customer");
  }

  if (serviceRequest.orderStatus !== "completed") {
    throw new ApiError(400, "Service request is not completed yet");
  }

  const worker = await Worker.findById(serviceRequest.workerId);
  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  worker.ratingsCount += 1;
  worker.ratingsPoints += rating;
  worker.rating = worker.ratingsPoints / worker.ratingsCount;

  await worker.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description  orderStatus audioNoteUrl wokerRated ratedWith"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedServiceRequest, "Worker rated successfully")
    );
});

const reportWorker = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;

  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, "Service request not found");
  }

  const worker = await Worker.findById(serviceRequest.workerId);

  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  let newSuspendedUntil;

  if (worker.suspendedUntil && worker.suspendedUntil > new Date()) {
    // Already suspended, add 7 days to existing suspension
    newSuspendedUntil = new Date(
      worker.suspendedUntil.getTime() + 7 * 24 * 60 * 60 * 1000
    );
  } else {
    // Not suspended or suspension expired, suspend for 7 days from now
    newSuspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  worker.suspendedUntil = newSuspendedUntil;
  await worker.save();

  serviceRequest.workerReported = true;
  await serviceRequest.save();

  const updatedServiceRequest = await ServiceRequest.findById(
    serviceRequestId
  ).select(
    "_id customerId workerId category description orderStatus audioNoteUrl wokerReported"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedServiceRequest,
        "Worker reported successfully"
      )
    );
});

const deleteServiceRequest=asyncHandler(async(req,res)=>{
  const {serviceRequestId}=req.params

  const serviceRequest=await ServiceRequest.findById(serviceRequestId);

  if(!serviceRequest){
    throw new ApiError(400,"service request not found")
  }

  const customer=await Customer.findByIdAndUpdate(
    serviceRequest.customerId,
    {
      $set:{
        liveServiceId:null,
        isLiveRequest:false
      }
    },
    {new:true}
  )

  if(!customer){
    throw new ApiError(500,"Error in updating customer live request details")
  }

  const deletedRequest=await ServiceRequest.findByIdAndDelete(serviceRequestId);

  if(!deletedRequest){
    throw new ApiError(400,"Service Request not found");
  }

  return res.status(200).json(new ApiResponse(200,deletedRequest,"Service request deleted successfully"));
})

const updateStatusToInspecting=asyncHandler(async(req,res)=>{
  const {serviceRequestId}=req.params

  const serviceRequest=await ServiceRequest.findByIdAndUpdate(
    serviceRequestId,
    {
      $set:{
        orderStatus:"inspecting"
      }
    },
    {new:true}
  ).select("_id customerId workerId category description orderStatus audioNoteUrl wokerReported");

  if(!serviceRequest){
    throw new ApiError(400,"Service request not found");
  }

  return res.status(200).json(new ApiResponse(200,serviceRequest,"Order status set to inspecting successfully"))
})

const updateQuoteAmount = asyncHandler(async(req,res)=>{
  const {serviceRequestId}=req.params
  const {quoteAmount}=req.body

  const serviceRequest=await ServiceRequest.findByIdAndUpdate(
    serviceRequestId,
    {
      $set:{
        quoteAmount,
        orderStatus:"repairAmountQuoted"
      }
    },
    {new:true}
  ).select("_id customerId workerId category description orderStatus audioNoteUrl wokerReported");

  if(!serviceRequest){
    throw new ApiError(400,"Service request not found");
  }

  return res.status(200).json(new ApiResponse(200,serviceRequest,"Quote amount set successfully"))
})

export {
  createServiceRequest,
  findRequests,
  acceptRequest,
  setQuoteAmount,
  acceptRepairQuote,
  rejectRepairQuote,
  cancelledByWorkerAsCustomerNotResponding,
  cancelledByWorkerAsNotAbleToServe,
  cancelledByCustomerAsWorkerNotRespondingOrLate,
  cancelledByCustomerAsByMistake,
  cancelBySystemAsNotConnected,
  cancelledBySystemAsUnattended,
  rateWorker,
  reportWorker,
  getServiceRequestStatus,
  deleteServiceRequest,
  updateStatusToInspecting,
  updateQuoteAmount
};
