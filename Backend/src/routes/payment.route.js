import { Router } from "express";
import { 
    createOrder,
    verifyPayment,
    paymentReceivedByCash
} from "../controllers/payment.controller.js";

import verifyJWTCustomer from "../middlewares/customerAuth.middleware.js";
import verifyJWTWorker from "../middlewares/workerAuth.middleware.js";

const router = Router();

router.route("/:serviceRequestId/create-order").post(verifyJWTCustomer, createOrder);
router.route("/:serviceRequestId/verify-payment").post(verifyJWTCustomer, verifyPayment);
router.route("/:serviceRequestId/payment-received-by-cash").post(verifyJWTWorker, paymentReceivedByCash);

export default router;