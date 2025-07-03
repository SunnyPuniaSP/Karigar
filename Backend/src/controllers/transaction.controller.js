import { Transaction } from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const createTransaction = asyncHandler(async (req, res) => {
  const { workerId, amount, type, description, platformFee, serviceRequestId } = req.body;

  if (!workerId || !amount || !type || !description) {
      throw new ApiError(400, "All required fields must be provided");
  }

  const transaction = await Transaction.create({
      workerId,
      amount,
      type,
      description,
      platformFee: platformFee || false,
      serviceRequestId: serviceRequestId || null
  });

  return res
      .status(201)
      .json(new ApiResponse(201, transaction, "Transaction created successfully"));
});



const getAllTransactions = asyncHandler(async (req, res) => {
  const workerIdRaw = req.query.workerId?.trim(); // remove unwanted spaces/newlines

  let filter = {};
  if (workerIdRaw) {
    filter.workerId = workerIdRaw;
  }

  const transactions = await Transaction.find(filter)
    .populate("workerId", "fullName email");

  return res.status(200).json(
    new ApiResponse(200, transactions, "Transactions fetched successfully")
  );
});

 const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid transaction ID");
  }

  const transaction = await Transaction.findById(id)
    .populate("workerId", "fullName email");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return res.status(200).json(
    new ApiResponse(200, transaction, "Transaction fetched successfully")
  );
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cleanedId = id.trim();
  
  const updatedTransaction = await Transaction.findByIdAndUpdate(cleanedId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTransaction) {
      throw new ApiError(404, "Transaction not found");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, updatedTransaction, "Transaction updated successfully"));
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cleanedId = id.trim(); // 🧼 Remove newline or whitespace

  const deletedTransaction = await Transaction.findByIdAndDelete(cleanedId);

  if (!deletedTransaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Transaction deleted successfully"));
});

export {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
