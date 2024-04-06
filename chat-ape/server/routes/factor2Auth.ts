import express from "express"
const router = express.Router()
import sessionController from "../controllers/sessionController"
import { stringValidation } from "../middlewares/middlewares"

router.get("/generate-otp", sessionController.generateOTP )

router.post("/verify-otp", stringValidation("otp"), stringValidation("refreshToken"), stringValidation("factor2AuthToken"), sessionController.verifyOTP)


module.exports = router