const express = require("express")
const { body } = require("express-validator")
const router = express.Router()
const sessionController = require("../controllers/sessionController")
const { stringValidation} = require("../middlewares/middlewares")

router.get("/generate-otp", sessionController.generateOTP )

router.post("/verify-otp", stringValidation("otp"), stringValidation("refreshToken"), stringValidation("factor2AuthToken"), sessionController.verifyOTP)


module.exports = router