const express = require("express")
const router = express.Router()
const sessionController = require("../controllers/sessionController")

router.get("/generate-otp", sessionController.generateOTP )

router.post("/verify-otp", sessionController.verifyOTP)

module.exports = router