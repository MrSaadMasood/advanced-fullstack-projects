import express from "express"
const router = express.Router()
import { verifyOTP, generateOTP } from "../controllers/sessionController"
import { stringValidation } from "../middlewares/middlewares"

router.get("/generate-otp", generateOTP )

router.post("/verify-otp", 
    stringValidation("otp"), 
    stringValidation("refreshToken"), 
    stringValidation("factor2AuthToken"), 
    verifyOTP
)


export default router