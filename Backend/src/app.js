import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import customerRouter from "./routes/customer.route.js"
import workerRouter from "./routes/worker.route.js"
import serviceRequestRouter from "./routes/serviceRequest.route.js"
import paymentRouter from "./routes/payment.route.js"

app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/worker", workerRouter)
app.use("/api/v1/service-request", serviceRequestRouter)
app.use("/api/v1/payment", paymentRouter)

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors || []
        });
    }

    console.error(err);
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        errors: []
    });
});


export { app }