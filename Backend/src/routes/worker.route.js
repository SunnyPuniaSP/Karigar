import { Router } from "express";
import { 
    registerWorker,
    loginWorker,
    logoutWorker,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentWorker,
    updateProfilePhoto,
    getWorkerDetails,
    updateWorkerDetails,
    toggleIsOnline,
    updateWorkerCurrentLocation,
    temporaryBlockCustomer,
    getWorkerCurrentLocation,
    updateWorkerStartLocation,
    toggleIsLiveRequestToFalse
} from "../controllers/worker.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/workerAuth.middleware.js";


const router = Router()

router.route("/register").post(upload.single("profilePhoto"),registerWorker)
router.route("/login").post(loginWorker)

//secured routes
router.route("/logout").post(verifyJWT, logoutWorker)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentWorker)
router.route("/update-profilePhoto").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)
router.route("/update-worker-details").post(verifyJWT, updateWorkerDetails)
router.route("/:workerId/get-details").get( getWorkerDetails)
router.route("/toggle-isOnline").patch( verifyJWT, toggleIsOnline)
router.route("/:serviceRequestId/update-current-location").patch( verifyJWT, updateWorkerCurrentLocation)
router.route("/update-start-location").patch( verifyJWT, updateWorkerStartLocation)
router.route("/temporary-blockCustomer").patch( verifyJWT, temporaryBlockCustomer)
router.route("/:workerId/location").get( getWorkerCurrentLocation)
router.route("/:workerId/toggle-isliveRequestTo-false").patch( toggleIsLiveRequestToFalse)


export default router