import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Worker } from "../models/worker.model.js";

export const verifyTransactionJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const worker = await Worker.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!worker) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = worker; // attaches worker to req.user
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
