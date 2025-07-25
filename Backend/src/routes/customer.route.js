import { Router } from "express";
import { 
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
    getPastRequests
} from "../controllers/customer.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/customerAuth.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerCustomer)
router.route("/login").post(loginCustomer)

//secured routes
router.route("/logout").post(verifyJWT,  logoutCustomer)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentCustomer)
router.route("/:customerId/customerDetails").get( getCustomerDetails)
router.route("/:customerId/toggle-isliveRequestTo-false").patch( toggleIsLiveRequestToFalse)
router.route("/update-profilePhoto").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
router.route("/update-customer-details").post(verifyJWT, updateCustomerDetails)
router.route("/past-requests").get(verifyJWT, getPastRequests)

export default router