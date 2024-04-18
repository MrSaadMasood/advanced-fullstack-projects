import express from "express"
const router = express.Router()
import { verifyOTP, generateOTP } from "../controllers/sessionController"
import { stringValidation } from "../middlewares/AuthMiddlewares"

router.get("/generate-otp", generateOTP )

router.post("/verify-otp", 
    stringValidation("otp"), 
    stringValidation("refreshToken"), 
    verifyOTP
)


export default router